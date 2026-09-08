'use client';

import Image from 'next/image';
import { SceneMotionControl, useSceneMotion } from './scene_motion';

export function RoomScene() {
  const { scene, paused, ready, toggle } = useSceneMotion();

  return (
    <>
      <div className="arrival-scene" ref={scene} data-paused={paused}>
        <div className="room-artboard">
          <Image
            unoptimized
            className="room-background"
            src="/images/living-room-motion.webp"
            fetchPriority="high"
            width={1672}
            height={941}
            alt="A sunny illustrated living room with a cinema poster, Manhattan map, coffee, a record player, Bloomberg Markets and The New Yorker magazines"
          />
          <div className="room-effects" aria-hidden="true">
            <div className="room-record">
              <div className="room-record-plane">
                <Image
                  unoptimized
                  className="room-vinyl scene-motion"
                  src="/images/room-vinyl.webp"
                  width={512}
                  height={512}
                  alt=""
                />
              </div>
            </div>
            <Image
              unoptimized
              className="room-still room-tonearm"
              src="/images/living-room-motion.webp"
              width={1672}
              height={941}
              alt=""
            />
            <Image
              unoptimized
              className="room-still room-spindle"
              src="/images/living-room-motion.webp"
              width={1672}
              height={941}
              alt=""
            />
            <div className="room-coffee">
              <Image
                unoptimized
                className="room-steam scene-motion"
                src="/images/room-steam.webp"
                width={256}
                height={512}
                alt=""
              />
              <Image
                unoptimized
                className="room-steam room-steam-late scene-motion"
                src="/images/room-steam.webp"
                width={256}
                height={512}
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
      {ready && (
        <SceneMotionControl paused={paused} toggle={toggle} subject="room" />
      )}
    </>
  );
}
