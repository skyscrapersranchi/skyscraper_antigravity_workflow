import React, { useEffect, useRef, useState, useCallback } from 'react';
import './FrameSequenceCanvas.css';

/**
 * FrameSequenceCanvas — High-Performance HTML5 Canvas Image Sequence Player
 *
 * Features:
 * - Fetches initial 150 frames with bounded concurrency and off-thread decoding
 * - Displays a sleek, architectural loading percentage counter (0% -> 100%)
 * - Smoothly hides the preloader once the initial 150 frames are ready
 * - Fetches and caches remaining frames in the background via requestIdleCallback without blocking UI
 * - High-DPI canvas rendering with aspect-ratio cover and zero per-frame garbage collection
 * - Supports external controlled frame, autoPlay, and interactive scrubbing
 */
export default function FrameSequenceCanvas({
  totalFrames = 825,
  initialBatchSize = 150,
  frameBasePath = 'public/frames/frame_',
  frameExtension = '.jpg',
  padLength = 4,
  currentFrame = 1,
  autoPlay = false,
  fps = 30,
  loop = true,
  interactive = false,
  showBackgroundStatus = false,
  onInitialLoadComplete = null,
  onAllFramesLoaded = null,
  onFrameChange = null,
  className = '',
  style = {}
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Loading States
  const [loadedInitialCount, setLoadedInitialCount] = useState(0);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);
  const [totalLoadedCount, setTotalLoadedCount] = useState(0);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [internalFrame, setInternalFrame] = useState(currentFrame);

  // References to preserve state across renders without causing re-renders
  const frameCache = useRef(new Map());
  const isMounted = useRef(true);
  const lastRenderedIndex = useRef(-1);
  const isInteracting = useRef(false);
  const dragStartX = useRef(0);
  const dragStartFrame = useRef(1);

  // Pre-allocated bounds object to avoid per-frame allocations during canvas drawing
  const boundsRef = useRef({
    drawWidth: 0,
    drawHeight: 0,
    offsetX: 0,
    offsetY: 0
  });

  // Helper to format frame file path (e.g., "public/frames/frame_0001.jpg")
  const getFramePath = useCallback((index) => {
    const padded = String(index).padStart(padLength, '0');
    return `${frameBasePath}${padded}${frameExtension}`;
  }, [frameBasePath, padLength, frameExtension]);

  // Decode single frame off-thread using native img.decode()
  const loadSingleFrame = useCallback((index) => {
    return new Promise((resolve) => {
      if (frameCache.current.has(index)) {
        return resolve(frameCache.current.get(index));
      }

      const img = new Image();
      img.src = getFramePath(index);

      if (typeof img.decode === 'function') {
        img.decode()
          .then(() => {
            frameCache.current.set(index, img);
            resolve(img);
          })
          .catch(() => {
            // Graceful fallback to onload if decode rejects
            img.onload = () => {
              frameCache.current.set(index, img);
              resolve(img);
            };
            img.onerror = () => resolve(null);
          });
      } else {
        img.onload = () => {
          frameCache.current.set(index, img);
          resolve(img);
        };
        img.onerror = () => resolve(null);
      }
    });
  }, [getFramePath]);

  // Canvas render routine with aspect-ratio "cover" logic and high-DPI scaling
  const renderFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Retrieve target frame or closest loaded neighbor frame as fallback
    let img = frameCache.current.get(frameIndex);
    if (!img) {
      for (let offset = 1; offset < 40; offset++) {
        if (frameCache.current.has(frameIndex - offset)) {
          img = frameCache.current.get(frameIndex - offset);
          break;
        } else if (frameCache.current.has(frameIndex + offset)) {
          img = frameCache.current.get(frameIndex + offset);
          break;
        }
      }
    }

    if (!img) return;

    // Prevent redundant canvas draws if frame and canvas dimensions are identical
    if (lastRenderedIndex.current === frameIndex && !canvas._needsResize) {
      return;
    }
    canvas._needsResize = false;
    lastRenderedIndex.current = frameIndex;

    const cWidth = canvas.width;
    const cHeight = canvas.height;
    const iWidth = img.naturalWidth || img.width;
    const iHeight = img.naturalHeight || img.height;

    if (!iWidth || !iHeight) return;

    const imgRatio = iWidth / iHeight;
    const canvasRatio = cWidth / cHeight;
    const bounds = boundsRef.current;

    if (canvasRatio > imgRatio) {
      bounds.drawWidth = cWidth;
      bounds.drawHeight = cWidth / imgRatio;
      bounds.offsetX = 0;
      bounds.offsetY = (cHeight - bounds.drawHeight) / 2;
    } else {
      bounds.drawHeight = cHeight;
      bounds.drawWidth = cHeight * imgRatio;
      bounds.offsetX = (cWidth - bounds.drawWidth) / 2;
      bounds.offsetY = 0;
    }

    ctx.fillStyle = '#0c0d0e';
    ctx.fillRect(0, 0, cWidth, cHeight);
    ctx.drawImage(
      img,
      Math.round(bounds.offsetX),
      Math.round(bounds.offsetY),
      Math.round(bounds.drawWidth),
      Math.round(bounds.drawHeight)
    );
  }, []);

  // Update canvas backing store resolution to device pixels
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const targetWidth = Math.floor(rect.width * dpr);
    const targetHeight = Math.floor(rect.height * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      canvas.style.width = `${Math.floor(rect.width)}px`;
      canvas.style.height = `${Math.floor(rect.height)}px`;
      canvas._needsResize = true;
    }

    renderFrame(internalFrame);
  }, [internalFrame, renderFrame]);

  // Synchronize external controlled currentFrame prop
  useEffect(() => {
    if (currentFrame && currentFrame !== internalFrame) {
      const clamped = Math.max(1, Math.min(totalFrames, Math.round(currentFrame)));
      setInternalFrame(clamped);
      renderFrame(clamped);
    }
  }, [currentFrame, totalFrames, internalFrame, renderFrame]);

  // ============================================================
  // PRELOADER & BACKGROUND FETCHING PIPELINE
  // ============================================================
  useEffect(() => {
    isMounted.current = true;
    let isCancelled = false;

    const initialTarget = Math.min(initialBatchSize, totalFrames);
    const CONCURRENCY_INITIAL = 6;
    let initialLoaded = 0;
    let nextInitialIndex = 1;

    // Phase 1: Bounded concurrent load of initial 150 frames
    const loadNextInitial = () => {
      if (isCancelled || nextInitialIndex > initialTarget) return;

      const frameIdx = nextInitialIndex++;
      loadSingleFrame(frameIdx).then(() => {
        if (isCancelled) return;

        initialLoaded++;
        if (isMounted.current) {
          setLoadedInitialCount(initialLoaded);
          setTotalLoadedCount(initialLoaded);
        }

        // Check if initial batch is fully loaded
        if (initialLoaded === initialTarget) {
          if (isMounted.current) {
            setIsInitialLoaded(true);
            renderFrame(1);
          }
          if (typeof onInitialLoadComplete === 'function') {
            onInitialLoadComplete();
          }

          // Trigger Phase 2: Background idle load for remaining frames
          startBackgroundLoad();
        } else {
          loadNextInitial();
        }
      });
    };

    // Kick off initial pool
    for (let c = 0; c < CONCURRENCY_INITIAL; c++) {
      loadNextInitial();
    }

    // Phase 2: Non-blocking background loading of remaining frames (151 to totalFrames)
    const startBackgroundLoad = () => {
      if (initialTarget >= totalFrames) {
        if (isMounted.current) setIsFullyLoaded(true);
        if (typeof onAllFramesLoaded === 'function') onAllFramesLoaded();
        return;
      }

      let currentBackgroundIndex = initialTarget + 1;
      let backgroundLoaded = initialLoaded;
      let activeBackgroundWorkers = 0;
      const MAX_BACKGROUND_CONCURRENCY = 3;

      const pumpBackground = () => {
        if (isCancelled) return;

        while (activeBackgroundWorkers < MAX_BACKGROUND_CONCURRENCY && currentBackgroundIndex <= totalFrames) {
          const idx = currentBackgroundIndex++;
          activeBackgroundWorkers++;

          loadSingleFrame(idx).then(() => {
            activeBackgroundWorkers--;
            if (isCancelled) return;

            backgroundLoaded++;
            if (isMounted.current) {
              setTotalLoadedCount(backgroundLoaded);
            }

            if (backgroundLoaded === totalFrames) {
              if (isMounted.current) setIsFullyLoaded(true);
              if (typeof onAllFramesLoaded === 'function') onAllFramesLoaded();
            } else {
              scheduleNextBackground();
            }
          });
        }
      };

      const scheduleNextBackground = () => {
        if (typeof window.requestIdleCallback === 'function') {
          window.requestIdleCallback(() => pumpBackground(), { timeout: 1500 });
        } else {
          setTimeout(() => pumpBackground(), 40);
        }
      };

      scheduleNextBackground();
    };

    return () => {
      isCancelled = true;
      isMounted.current = false;
    };
  }, [totalFrames, initialBatchSize, loadSingleFrame, renderFrame, onInitialLoadComplete, onAllFramesLoaded]);

  // Handle ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    handleResize();

    let resizeTimer = null;
    const observer = new ResizeObserver(() => {
      if (resizeTimer) cancelAnimationFrame(resizeTimer);
      resizeTimer = requestAnimationFrame(() => handleResize());
    });

    observer.observe(container);
    return () => {
      if (resizeTimer) cancelAnimationFrame(resizeTimer);
      observer.disconnect();
    };
  }, [handleResize]);

  // Optional autoPlay playback loop
  useEffect(() => {
    if (!autoPlay || !isInitialLoaded) return;

    let animId = null;
    let lastTick = performance.now();
    const interval = 1000 / fps;

    const tick = (now) => {
      const delta = now - lastTick;
      if (delta >= interval) {
        lastTick = now - (delta % interval);
        setInternalFrame((prev) => {
          let next = prev + 1;
          if (next > totalFrames) {
            next = loop ? 1 : totalFrames;
          }
          renderFrame(next);
          if (typeof onFrameChange === 'function') {
            onFrameChange(next);
          }
          return next;
        });
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [autoPlay, isInitialLoaded, fps, loop, totalFrames, renderFrame, onFrameChange]);

  // Interactive Drag / Scrub Handlers
  const handlePointerDown = (e) => {
    if (!interactive || !isInitialLoaded) return;
    isInteracting.current = true;
    dragStartX.current = e.clientX;
    dragStartFrame.current = internalFrame;
    if (e.target.setPointerCapture) {
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!isInteracting.current || !interactive) return;
    const deltaX = e.clientX - dragStartX.current;
    const containerWidth = containerRef.current?.offsetWidth || 1000;
    const frameDelta = Math.round((deltaX / containerWidth) * totalFrames);
    let nextFrame = dragStartFrame.current + frameDelta;

    if (loop) {
      nextFrame = ((nextFrame - 1) % totalFrames + totalFrames) % totalFrames + 1;
    } else {
      nextFrame = Math.max(1, Math.min(totalFrames, nextFrame));
    }

    setInternalFrame(nextFrame);
    renderFrame(nextFrame);
    if (typeof onFrameChange === 'function') {
      onFrameChange(nextFrame);
    }
  };

  const handlePointerUp = () => {
    isInteracting.current = false;
  };

  // Compute clean preloader percentage (0% to 100% of the initial 150 frames)
  const initialTarget = Math.min(initialBatchSize, totalFrames);
  const percentage = Math.min(100, Math.round((loadedInitialCount / (initialTarget || 1)) * 100));

  return (
    <div
      ref={containerRef}
      className={`fsc-container ${className}`.trim()}
      style={style}
    >
      {/* HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        className="fsc-canvas"
        style={{ cursor: interactive ? 'ew-resize' : 'default' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      {/* Preloader Overlay: Shows progress of first 150 frames, fades out when complete */}
      <div
        className={`fsc-preloader ${isInitialLoaded ? 'fsc-preloader--hidden' : ''}`.trim()}
        aria-hidden={isInitialLoaded}
      >
        <div className="fsc-preloader__content">
          <span className="fsc-preloader__tagline">Architectural Experience</span>

          <div className="fsc-preloader__percentage">
            {percentage}
            <span className="fsc-preloader__percentage-symbol">%</span>
          </div>

          <div className="fsc-preloader__track">
            <div
              className="fsc-preloader__bar"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="fsc-preloader__status">
            Loading sequence · {loadedInitialCount} / {initialTarget} frames
          </p>
        </div>
      </div>

      {/* Optional subtle background loading badge (if requested via prop) */}
      {showBackgroundStatus && isInitialLoaded && (
        <div
          className={`fsc-bg-status ${isFullyLoaded ? 'fsc-bg-status--complete' : ''}`.trim()}
        >
          {isFullyLoaded
            ? 'All frames cached'
            : `Caching in background (${totalLoadedCount}/${totalFrames})`}
        </div>
      )}
    </div>
  );
}
