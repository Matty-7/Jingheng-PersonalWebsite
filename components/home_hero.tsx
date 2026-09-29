'use client';

import { useState } from 'react';
import { HeroName } from './hero_name';
import { RoomScene } from './room_scene';

export function HomeHero() {
  const [paused, set_paused] = useState(false);
  return (
    <>
      <RoomScene
        paused={paused}
        on_toggle={() => set_paused((value) => !value)}
      />
      <div className="arrival-copy">
        <HeroName paused={paused} />
      </div>
    </>
  );
}
