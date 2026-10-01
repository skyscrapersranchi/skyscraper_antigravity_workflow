import React, { useState, useEffect } from 'react';
import FrameSequenceCanvas from './FrameSequenceCanvas';

/**
 * ExampleUsage — Demonstrates how to use FrameSequenceCanvas in a React App.
 *
 * 1. Default Preloader: Loads frames 1–150 with live percentage display.
 * 2. Background Caching: Loads remaining frames 151–825 via requestIdleCallback.
 * 3. Interactive Scrubbing & Scroll Controls.
 */
export function BasicSequenceDemo() {
  const [frame, setFrame] = useState(1);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0c0d0e' }}>
      <FrameSequenceCanvas
        totalFrames={825}
        initialBatchSize={150}
        frameBasePath="/public/frames/frame_"
        frameExtension=".jpg"
        currentFrame={frame}
        interactive={true}
        showBackgroundStatus={true}
        onInitialLoadComplete={() => console.log('Preloader finished! Initial 150 frames ready.')}
        onAllFramesLoaded={() => console.log('All 825 frames cached in memory.')}
        onFrameChange={(f) => setFrame(f)}
      />
    </div>
  );
}

/**
 * ScrollDrivenDemo — Links the image sequence to page scroll (like Apple / Skyscraper walkthrough)
 */
export function ScrollDrivenSequenceDemo() {
  const [frame, setFrame] = useState(1);
  const TOTAL_FRAMES = 825;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      const progress = Math.max(0, Math.min(1, scrollY / maxScroll));
      const targetFrame = Math.round(1 + progress * (TOTAL_FRAMES - 1));
      setFrame(targetFrame);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ minHeight: '500vh', background: '#0c0d0e' }}>
      {/* Sticky Canvas Viewport */}
      <div style={{ position: 'sticky', top: 0, width: '100vw', height: '100vh' }}>
        <FrameSequenceCanvas
          totalFrames={TOTAL_FRAMES}
          initialBatchSize={150}
          frameBasePath="/public/frames/frame_"
          frameExtension=".jpg"
          currentFrame={frame}
          showBackgroundStatus={true}
        />
        
        {/* Floating HUD */}
        <div style={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          color: '#f5f2eb',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          background: 'rgba(12, 13, 14, 0.75)',
          padding: '6px 12px',
          borderRadius: 4,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          pointerEvents: 'none'
        }}>
          FRAME: {String(frame).padStart(4, '0')} / {TOTAL_FRAMES}
        </div>
      </div>
    </div>
  );
}
