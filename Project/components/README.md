# FrameSequenceCanvas (React Component)

A high-performance HTML5 Canvas image sequence player built for React.

## Features
- **150-Frame Preloader**: Concurrent pre-fetching and off-thread decoding of initial 150 frames.
- **Live Loading Percentage**: Clean, luxury typography percentage display (`0%` -> `100%`) with animated progress track.
- **Smooth Preloader Dismissal**: Seamlessly fades out once the initial 150 frames are ready.
- **Non-Blocking Background Caching**: Fetches and caches remaining frames (`151` to `totalFrames`) via `requestIdleCallback` with bounded concurrency (max 3–4 parallel downloads), ensuring UI and scrolling remain 60 FPS smooth.
- **High-DPI Retina Support**: Automatically scales backing store to `devicePixelRatio` (capped at 2x) with zero downscale blur.
- **Aspect-Ratio "Cover" Drawing**: Zero per-frame memory allocation for canvas drawing.
- **TypeScript Support**: Full TypeScript interface (`FrameSequenceCanvas.tsx`) alongside standard JSX (`FrameSequenceCanvas.jsx`).

---

## Installation & Import

Copy the files from `Project/components/`:
- `FrameSequenceCanvas.jsx` (or `.tsx`)
- `FrameSequenceCanvas.css`

```jsx
import FrameSequenceCanvas from './components/FrameSequenceCanvas';
import './components/FrameSequenceCanvas.css';
```

---

## Basic Usage

```jsx
import React, { useState } from 'react';
import FrameSequenceCanvas from './components/FrameSequenceCanvas';

export default function App() {
  const [frame, setFrame] = useState(1);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <FrameSequenceCanvas
        totalFrames={825}
        initialBatchSize={150}
        frameBasePath="/public/frames/frame_"
        frameExtension=".jpg"
        currentFrame={frame}
        interactive={true}
        onInitialLoadComplete={() => console.log('First 150 frames loaded!')}
        onAllFramesLoaded={() => console.log('All 825 frames cached!')}
      />
    </div>
  );
}
```

---

## Props Reference

| Prop | Type | Default | Description |
| :--- | :---: | :---: | :--- |
| `totalFrames` | `number` | `825` | Total number of frames in the sequence |
| `initialBatchSize` | `number` | `150` | Frames required before hiding preloader |
| `frameBasePath` | `string` | `'public/frames/frame_'` | URL path prefix for frames |
| `frameExtension` | `string` | `'.jpg'` | Image format extension |
| `padLength` | `number` | `4` | Zero-padding length (e.g. `0001`) |
| `currentFrame` | `number` | `1` | Controlled frame index to display |
| `autoPlay` | `boolean` | `false` | Enable automatic playback |
| `fps` | `number` | `30` | Playback speed when autoPlay is enabled |
| `loop` | `boolean` | `true` | Loop playback on sequence end |
| `interactive` | `boolean` | `false` | Enable horizontal pointer drag scrubbing |
| `showBackgroundStatus` | `boolean` | `false` | Show subtle background caching progress indicator |
| `onInitialLoadComplete` | `() => void` | `null` | Callback triggered when 150 frames are ready |
| `onAllFramesLoaded` | `() => void` | `null` | Callback triggered when all frames are cached |
| `onFrameChange` | `(f: number) => void` | `null` | Callback on active frame change |
| `className` | `string` | `''` | CSS class for container |
| `style` | `object` | `{}` | Inline styles for container |
