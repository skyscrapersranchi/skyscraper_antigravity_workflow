import React, { useEffect, useRef, useState, useCallback, CSSProperties, PointerEvent } from 'react';
import './FrameSequenceCanvas.css';

export interface FrameSequenceCanvasProps {
  /** Total number of frames in the sequence (default: 825) */
  totalFrames?: number;
  /** Number of initial frames required before hiding the preloader (default: 150) */
  initialBatchSize?: number;
  /** Relative or absolute URL prefix for frames (default: 'public/frames/frame_') */
  frameBasePath?: string;
  /** File extension for image frames (default: '.jpg') */
  frameExtension?: string;
  /** Leading zero padding length (default: 4, e.g. 0001) */
  padLength?: number;
  /** Controlled active frame index (1 to totalFrames) */
  currentFrame?: number;
  /** Enable automatic sequential playback */
  autoPlay?: boolean;
  /** Frames per second when autoPlay is enabled (default: 30) */
  fps?: number;
  /** Loop playback when reaching the end of the sequence */
  loop?: boolean;
  /** Enable horizontal pointer drag scrubbing on the canvas */
  interactive?: boolean;
  /** Display a subtle badge showing background caching progress */
  showBackgroundStatus?: boolean;
  /** Callback invoked when the initial 150 frames have finished loading */
  onInitialLoadComplete?: () => void;
  /** Callback invoked when all frames (1 to totalFrames) have been loaded and cached */
  onAllFramesLoaded?: () => void;
  /** Callback invoked when the active frame changes */
  onFrameChange?: (frame: number) => void;
  /** Optional custom CSS class name for container */
  className?: string;
  /** Optional custom inline styles for container */
  style?: CSSProperties;
}

interface Bounds {
  drawWidth: number;
  drawHeight: number;
  offsetX: number;
  offsetY: number;
}

interface ResizableCanvas extends HTMLCanvasElement {
  _needsResize?: boolean;
}

export const FrameSequenceCanvas: React.FC<FrameSequenceCanvasProps> = ({
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
  onInitialLoadComplete,
  onAllFramesLoaded,
  onFrameChange,
  className = '',
  style = {}
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<ResizableCanvas | null>(null);

  // Loading States
  const [loadedInitialCount, setLoadedInitialCount] = useState<number>(0);
  const [isInitialLoaded, setIsInitialLoaded] = useState<boolean>(false);
  const [totalLoadedCount, setTotalLoadedCount] = useState<number>(0);
  const [isFullyLoaded, setIsFullyLoaded] = useState<boolean>(false);
  const [internalFrame, setInternalFrame] = useState<number>(currentFrame);

  // Memory & Execution Refs
  const frameCache = useRef<Map<number, HTMLImageElement>>(new Map());
  const isMounted = useRef<boolean>(true);
  const lastRenderedIndex = useRef<number>(-1);
  const isInteracting = useRef<boolean>(false);
  const dragStartX = useRef<number>(0);
  const dragStartFrame = useRef<number>(1);

  // Pre-allocated bounds to prevent GC thrashing during render loop
  const boundsRef = useRef<Bounds>({
    drawWidth: 0,
    drawHeight: 0,
    offsetX: 0,
    offsetY: 0
  });

  const getFramePath = useCallback((index: number): string => {
    const padded = String(index).padStart(padLength, '0');
    return `${frameBasePath}${padded}${frameExtension}`;
  }, [frameBasePath, padLength, frameExtension]);

  const loadSingleFrame = useCallback((index: number): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      if (frameCache.current.has(index)) {
        return resolve(frameCache.current.get(index)!);
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

  const renderFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

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

  useEffect(() => {
    if (currentFrame && currentFrame !== internalFrame) {
      const clamped = Math.max(1, Math.min(totalFrames, Math.round(currentFrame)));
      setInternalFrame(clamped);
      renderFrame(clamped);
    }
  }, [currentFrame, totalFrames, internalFrame, renderFrame]);

  useEffect(() => {
    isMounted.current = true;
    let isCancelled = false;

    const initialTarget = Math.min(initialBatchSize, totalFrames);
    const CONCURRENCY_INITIAL = 6;
    let initialLoaded = 0;
    let nextInitialIndex = 1;

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

        if (initialLoaded === initialTarget) {
          if (isMounted.current) {
            setIsInitialLoaded(true);
            renderFrame(1);
          }
          if (onInitialLoadComplete) {
            onInitialLoadComplete();
          }
          startBackgroundLoad();
        } else {
          loadNextInitial();
        }
      });
    };

    for (let c = 0; c < CONCURRENCY_INITIAL; c++) {
      loadNextInitial();
    }

    const startBackgroundLoad = () => {
      if (initialTarget >= totalFrames) {
        if (isMounted.current) setIsFullyLoaded(true);
        if (onAllFramesLoaded) onAllFramesLoaded();
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
              if (onAllFramesLoaded) onAllFramesLoaded();
            } else {
              scheduleNextBackground();
            }
          });
        }
      };

      const scheduleNextBackground = () => {
        if ('requestIdleCallback' in window) {
          (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void }).requestIdleCallback(
            () => pumpBackground(),
            { timeout: 1500 }
          );
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    handleResize();

    let resizeTimer: number | null = null;
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

  useEffect(() => {
    if (!autoPlay || !isInitialLoaded) return;

    let animId: number | null = null;
    let lastTick = performance.now();
    const interval = 1000 / fps;

    const tick = (now: number) => {
      const delta = now - lastTick;
      if (delta >= interval) {
        lastTick = now - (delta % interval);
        setInternalFrame((prev) => {
          let next = prev + 1;
          if (next > totalFrames) {
            next = loop ? 1 : totalFrames;
          }
          renderFrame(next);
          if (onFrameChange) {
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

  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!interactive || !isInitialLoaded) return;
    isInteracting.current = true;
    dragStartX.current = e.clientX;
    dragStartFrame.current = internalFrame;
    if (e.currentTarget.setPointerCapture) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
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
    if (onFrameChange) {
      onFrameChange(nextFrame);
    }
  };

  const handlePointerUp = () => {
    isInteracting.current = false;
  };

  const initialTarget = Math.min(initialBatchSize, totalFrames);
  const percentage = Math.min(100, Math.round((loadedInitialCount / (initialTarget || 1)) * 100));

  return (
    <div
      ref={containerRef}
      className={`fsc-container ${className}`.trim()}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="fsc-canvas"
        style={{ cursor: interactive ? 'ew-resize' : 'default' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

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
};

export default FrameSequenceCanvas;
