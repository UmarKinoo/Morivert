import React from 'react';

// Single blurred + grain div placed over the 3D canvas (z-index below overlay content)
const NOISE_SVG =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
  <filter id="n">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#n)"/>
</svg>`
  );

export const GrainOverlay: React.FC = () => (
  <div
    aria-hidden
    className="grain-overlay"
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 5,
      pointerEvents: 'none',
      background: 'rgba(0,0,0,0.08)',
      backgroundImage: `url("${NOISE_SVG}")`,
      backgroundRepeat: 'repeat',
      opacity: 0.2,
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
    }}
  />
);
