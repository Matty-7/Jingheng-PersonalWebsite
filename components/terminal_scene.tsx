'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { SceneMotionControl, useSceneMotion } from './scene_motion';
import { useImageStatus } from './image_status';

const quote_frames = [
  ['101.24', '101.28', '101.21'],
  ['98.62', '98.59', '98.65'],
  ['4.218', '4.224', '4.211'],
  ['106.83', '106.79', '106.86'],
  ['3.946', '3.951', '3.942'],
];
const curve_frames = [
  '0,21 10,19 20,20 30,14 40,17 50,10 60,13 70,9 80,15 90,11 100,13 110,6 120,8 130,4 140,7',
  '0,18 10,21 20,15 30,18 40,12 50,16 60,8 70,12 80,6 90,10 100,5 110,11 120,8 130,13 140,10',
  '0,20 10,16 20,19 30,11 40,15 50,8 60,14 70,17 80,12 90,16 100,9 110,13 120,6 130,9 140,3',
];
const bar_heights = [29, 19, 32, 14, 23, 17, 10, 15, 9];

function MarketActivity() {
  return (
    <svg className="terminal-market" viewBox="0 0 1672 941" focusable="false">
      <svg x="738" y="402" width="49" height="52" viewBox="0 0 49 52" overflow="hidden">
        <rect width="49" height="52" fill="#101411" />
        {quote_frames.map((readings, row_index) => (
          <g key={row_index} transform={`translate(0 ${row_index * 10})`}>
            {readings.map((reading, frame_index) => (
              <g
                key={reading}
                className="market-quote-frame scene-motion"
                style={{
                  animationDuration: `${9 + row_index}s`,
                  animationDelay: `${-((3 - frame_index) * (9 + row_index)) / 3 - row_index * 0.4}s`,
                  color: ['#d4cf9b', '#85b36a', '#d59562'][(frame_index + row_index) % 3],
                } as CSSProperties}
              >
                <rect x="2" y="1" width="44" height="8" fill="currentColor" opacity="0.08" />
                <text x="43" y="7.5" textAnchor="end" fill="currentColor">{reading}</text>
              </g>
            ))}
          </g>
        ))}
      </svg>
      <svg x="482" y="425" width="142" height="26" viewBox="0 0 142 26" overflow="hidden">
        <rect width="142" height="26" fill="#111713" />
        <path d="M0 6H142 M0 13H142 M0 20H142" stroke="#465044" strokeWidth="0.45" opacity="0.5" />
        {curve_frames.map((points, frame_index) => (
          <polyline
            key={points}
            className="market-curve scene-motion"
            points={points}
            fill="none"
            stroke="#cbd3b8"
            strokeWidth="1.1"
            strokeLinejoin="round"
            style={{ animationDelay: `${-frame_index * 4}s` }}
          />
        ))}
      </svg>
      <svg x="804" y="414" width="85" height="35" viewBox="0 0 85 35" overflow="hidden">
        <rect width="85" height="35" fill="#111511" />
        <path d="M0 12H85 M0 24H85 M0 34H85" stroke="#424938" strokeWidth="0.45" opacity="0.45" />
        {bar_heights.map((height, index) => (
          <rect
            key={index}
            className="market-bar scene-motion"
            x={2 + index * 9}
            y={34 - height}
            width="4.5"
            height={height}
            fill={index % 2 === 0 ? '#d8a14b' : '#7b9e55'}
            style={{ animationDuration: `${6 + index % 4}s`, animationDelay: `${-index * 0.7}s` }}
          />
        ))}
      </svg>
    </svg>
  );
}

export function TerminalScene() {
  const { scene, paused, ready, toggle } = useSceneMotion();
  const { image_ref, state, on_load, on_error } = useImageStatus();
  return (
    <div className="closing-art">
      <div className="terminal-scene" ref={scene} data-paused={paused} data-image-state={state}>
        <div className="terminal-artboard">
          <Image
            unoptimized
            className="terminal-background"
            ref={image_ref}
            onLoad={on_load}
            onError={on_error}
            src="/images/writing-terminal.webp"
            width={1672}
            height={941}
            loading="lazy"
            alt="An illustrated walnut desk with a slim Bloomberg Terminal on central silver monitor arms, a colored keyboard and wireless mouse, decorative changing market figures and charts, and a sunlit window"
          />
          <div className="terminal-effects" aria-hidden="true">
            <MarketActivity />
          </div>
        </div>
      </div>
      {ready && state === 'loaded' && (
        <SceneMotionControl paused={paused} toggle={toggle} subject="desk" />
      )}
    </div>
  );
}
