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
            alt="An illustrated walnut work desk with a Bloomberg Terminal, its colored keyboard, and a sunlit window overlooking trees"
          />
          <div className="terminal-effects" aria-hidden="true">
            <ScreenDetail
              className="terminal-chart-sweep"
              rect={[485, 315, 141, 98]}
            />
            <ScreenDetail
              className="terminal-row-sweep"
              rect={[659, 400, 133, 58]}
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
