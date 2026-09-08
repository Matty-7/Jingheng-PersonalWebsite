'use client';

import Image from 'next/image';
import { SceneMotionControl, useSceneMotion } from './scene_motion';
import { useImageStatus } from './image_status';

export function RoomScene(control: { paused: boolean; on_toggle: () => void }) {
  const { scene, paused, ready, toggle } = useSceneMotion(control);
  const { image_ref, state, on_load, on_error } = useImageStatus();

  return (
    <>
      <div className="arrival-scene" ref={scene} data-paused={paused} data-image-state={state}>
        <div className="room-artboard">
          <Image
            unoptimized
            className="room-background"
            ref={image_ref}
            onLoad={on_load}
            onError={on_error}
            src="/images/living-room-motion.jpg"
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
                  src="/images/room-vinyl.png"
                  width={512}
                  height={512}
                  alt=""
                />
              </div>
            </div>
            <Image
              unoptimized
              className="room-still room-tonearm"
              src="/images/living-room-motion.jpg"
              width={1672}
              height={941}
              alt=""
            />
            <Image
              unoptimized
              className="room-still room-spindle"
              src="/images/living-room-motion.jpg"
              width={1672}
              height={941}
              alt=""
            />
            <div className="room-coffee">
              <Image
                unoptimized
                className="room-steam scene-motion"
                src="/images/room-steam.png"
                width={256}
                height={512}
                alt=""
              />
              <Image
                unoptimized
                className="room-steam room-steam-late scene-motion"
                src="/images/room-steam.png"
                width={256}
                height={512}
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
      {ready && (
        <SceneMotionControl paused={paused} toggle={toggle} subject="hero" />
      )}
    </>
  );
}
