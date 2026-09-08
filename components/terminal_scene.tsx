'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { SceneMotionControl, useSceneMotion } from './scene_motion';

function ScreenDetail({
  className,
  rect,
}: {
  className: string;
  rect: [number, number, number, number];
}) {
  const [x, y, width, height] = rect;
  const style = {
    '--panel-x': x,
    '--panel-y': y,
    '--panel-width': width,
    '--panel-height': height,
  } as CSSProperties;
  return (
    <div className={`terminal-detail ${className} scene-motion`} style={style}>
      <Image
        unoptimized
        className="terminal-detail-texture"
        src="/images/writing-terminal.webp"
        width={1672}
        height={941}
        loading="lazy"
        alt=""
      />
    </div>
  );
}

export function TerminalScene() {
  const { scene, paused, ready, toggle } = useSceneMotion();
  return (
    <div className="closing-art">
      <div className="terminal-scene" ref={scene} data-paused={paused}>
        <div className="terminal-artboard">
          <Image
            unoptimized
            className="terminal-background"
            src="/images/writing-terminal.webp"
            width={1672}
            height={941}
            loading="lazy"
            alt="An illustrated walnut desk with a slim Bloomberg Terminal on central silver monitor arms, a colored keyboard, pie, candlestick, bar and heatmap charts, brick-built Statue of Liberty and Duke basketball figurines to the keyboard’s left, and a sunlit window"
          />
          <div className="terminal-effects" aria-hidden="true">
            <svg className="terminal-jersey" viewBox="0 0 1672 941">
              <path d="M440 540 L465 540 L467 552 L438 552 Z" fill="#1748b4" />
              <text
                x="452.5"
                y="550"
                textAnchor="middle"
                fill="#fff7df"
                fontFamily="Arial, sans-serif"
                fontWeight="900"
                fontSize="10.5"
                textLength="24"
                lengthAdjust="spacingAndGlyphs"
              >
                DUKE
              </text>
            </svg>
            <ScreenDetail
              className="terminal-chart-sweep"
              rect={[487, 323, 137, 79]}
            />
            <ScreenDetail
              className="terminal-row-sweep"
              rect={[661, 402, 130, 50]}
            />
          </div>
        </div>
      </div>
      {ready && (
        <SceneMotionControl paused={paused} toggle={toggle} subject="desk" />
      )}
    </div>
  );
}
