'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowDown, ArrowUpRight, Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import music from '@/content/music.json';
import films from '@/content/films.json';
import books from '@/content/books.json';
import broadway from '@/content/broadway.json';

type Track = (typeof music)[number];
const number = (i:number) => String(i+1).padStart(2,'0');
const time = (seconds:number) => `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;

export default function Home() {
  const audio = useRef<HTMLAudioElement|null>(null);
  const request = useRef(0);
  const [selected,setSelected]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [loading,setLoading]=useState(false);
  const [started,setStarted]=useState(false);
  const [elapsed,setElapsed]=useState(0);
  const [duration,setDuration]=useState(0);
  const [message,setMessage]=useState('');
  const track=music[selected];

  const playTrack=useCallback(async(index:number)=>{
    const a=audio.current;
    if(!a || !Number.isInteger(index) || index<0 || index>=music.length)return;
    const ticket=++request.current;
    setSelected(index);setStarted(true);setLoading(true);setMessage('');
    if(a.dataset.track!==String(index)){
      a.pause();a.src=music[index].previewUrl;a.dataset.track=String(index);a.load();setElapsed(0);setDuration(0);
    }
    try{await a.play();if(ticket===request.current)setPlaying(true)}
    catch(error){if(ticket===request.current){setPlaying(false);setMessage(error instanceof DOMException && error.name==='NotAllowedError'?'Tap play to start the preview.':'This preview is unavailable right now. You can still listen on Apple Music.')}}
    finally{if(ticket===request.current)setLoading(false)}
  },[]);
  const toggle=useCallback(()=>{
    if(audio.current && !audio.current.paused){++request.current;audio.current.pause();setLoading(false)}
    else void playTrack(selected);
  },[selected,playTrack]);

  useEffect(()=>{
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    document.documentElement.classList.add('motion-ready');
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.12});
    document.querySelectorAll('[data-reveal]').forEach(el=>observer.observe(el));
    const filmSection=document.getElementById('films');
    const filmTrack=document.getElementById('film-track');
    const hero=document.querySelector<HTMLElement>('.arrival');
    let raf=0;
    const update=()=>{
      raf=0;
      const small=window.innerWidth<760;
      if(hero){const p=Math.min(1,Math.max(0,-hero.getBoundingClientRect().top/hero.offsetHeight));hero.style.setProperty('--hero-progress',reduced.matches?'0':String(p))}
      if(filmSection&&filmTrack){
        const distance=Math.max(0,filmTrack.scrollWidth-window.innerWidth+window.innerWidth*.09);
        if(!small&&!reduced.matches){filmSection.style.height=`${window.innerHeight+distance*1.2}px`;const rect=filmSection.getBoundingClientRect();const progress=Math.max(0,Math.min(1,-rect.top/Math.max(1,rect.height-window.innerHeight)));filmTrack.style.transform=`translate3d(${-progress*distance}px,0,0)`;filmSection.style.setProperty('--film-progress',String(progress));}
        else{filmSection.style.height='auto';filmTrack.style.transform='none'}
      }
    };
    const schedule=()=>{if(!raf)raf=window.requestAnimationFrame(update)};
    window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);reduced.addEventListener('change',schedule);update();
    return()=>{document.documentElement.classList.remove('motion-ready');observer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);reduced.removeEventListener('change',schedule);window.cancelAnimationFrame(raf)};
  },[]);

  useEffect(()=>{
    type Registry={registerTool:(tool:{name:string;title:string;description:string;inputSchema:object;annotations:object;execute:(input:unknown)=>unknown},options:{signal:AbortSignal})=>void|Promise<void>};
    const context=(document as Document&{modelContext?:Registry}).modelContext;
    if(!context?.registerTool)return;
    const lifecycle=new AbortController();
    const tool={name:'select_record',title:'Select a record',description:'Select one of the ten records and move to the record player. Does not start audio.',inputSchema:{type:'object',properties:{recordNumber:{type:'integer',minimum:1,maximum:10}},required:['recordNumber'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input:unknown){const n=(input as {recordNumber?:unknown})?.recordNumber;if(typeof n!=='number'||!Number.isInteger(n)||n<1||n>10)throw new Error('recordNumber must be an integer from 1 to 10.');++request.current;audio.current?.pause();setLoading(false);setSelected(n-1);setElapsed(0);setDuration(0);document.getElementById('records')?.scrollIntoView({behavior:'auto'});return {recordNumber:n,title:music[n-1].trackName,playing:false}}};
    try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{})}catch{}
    return()=>lifecycle.abort();
  },[]);

  return <>
    <a className="skip-link" href="#work">Skip to content</a>
    <nav className="site-nav" aria-label="Main navigation">
      <a href="#home" className="wordmark">Jingheng Huan<span>AN AFTERNOON UPTOWN</span></a>
      <div className="nav-links"><a href="#work">Work</a><a href="#records">Records</a><a href="#films">Films</a><a href="#books">Books</a><a href="#city">Say hello <ArrowUpRight size={14}/></a></div>
    </nav>
    <main>
      <section id="home" className="arrival">
        <Image unoptimized src="/images/living-room.jpg" fetchPriority="high" width="1600" height="900" alt="An illustrated sunny Manhattan living room with an Eames chair, records, books, and a bird-of-paradise plant"/>
        <div className="arrival-copy"><p className="eyebrow">UPPER EAST SIDE, NEW YORK</p><h1>A little<br/>room for<br/><em>everything.</em></h1><p>Things I make.<br/>Things that stay with me.</p></div>
        <a className="scroll-invitation" href="#work">Come in. Stay a while. <ArrowDown size={20}/></a>
        <span className="room-caption">THE DOOR IS OPEN.</span>
      </section>
      <section id="work" className="work-section">
        <p className="eyebrow" data-reveal>01 / AT THE DESK</p>
        <div data-reveal><h2>Curiosity,<br/><em>put to work.</em></h2><p className="work-intro">Engineering, financial markets,<br/>and ideas worth exploring.</p></div>
        <article className="project" data-reveal><span>SELECTED WORK / HACKDUKE 2025</span><h3>Duber</h3><p>A ride-sharing platform with sustainability rewards. A project about getting somewhere together.</p><a href="https://www.linkedin.com/in/jingheng-huan/" target="_blank" rel="noreferrer">More about my work <ArrowUpRight size={18}/></a></article>
      </section>
      <section id="records" className="records-section">
        <div className="section-heading" data-reveal><p className="eyebrow">02 / ON ROTATION</p><h2>Put something<br/><em>good on.</em></h2><p>Ten records for an unhurried afternoon.</p></div>
        <div className="listening-room">
          <div className="player-column">
            <div className={`turntable ${playing?'is-playing':''}`} aria-hidden="true"><Image unoptimized className="turntable-base" src="/images/turntable.webp" width="1448" height="1086" alt=""/><div className="vinyl-disc"><div className="vinyl-spin"><Image unoptimized src={track.artwork} alt="" width={160} height={160}/></div></div></div>
            <div className="now-playing"><span className="eyebrow">{loading?'LOADING PREVIEW':playing?'NOW PLAYING':'ON THE TURNTABLE'} · {number(selected)}</span><h3>{track.trackName}</h3><p>{track.displayArtist}</p></div>
            <div className="player-controls"><Button variant="ghost" size="icon" aria-label="Previous record" onClick={()=>void playTrack((selected+9)%10)}><SkipBack size={18}/></Button><Button className="play-control" onClick={toggle} aria-label={playing?'Pause preview':`Play preview of ${track.trackName}`}>{playing?<Pause size={20}/>:<Play size={20}/>} {loading?'Loading…':playing?'Pause':'Play preview'}</Button><Button variant="ghost" size="icon" aria-label="Next record" onClick={()=>void playTrack((selected+1)%10)}><SkipForward size={18}/></Button></div>
            <progress className="audio-progress" aria-label="Preview playback progress" max={duration||1} value={elapsed}/>
            <div className="audio-caption"><span>{time(elapsed)} / {duration?time(duration):'Preview'}</span><a href={track.appleMusicUrl} target="_blank" rel="noreferrer">Full song on Apple Music <ArrowUpRight size={14}/></a></div>
            <output className="playback-message">{message||'Apple Music preview · Press play to listen.'}</output>
          </div>
          <ol className="record-list">{music.map((t:Track,i)=><li key={t.trackId}><button className={`record-row ${i===selected?'selected':''}`} onClick={()=>void playTrack(i)} aria-label={`Play preview: ${t.trackName} by ${t.displayArtist}`} aria-current={i===selected?'true':undefined}><span className="record-number">{i===selected&&playing?<Volume2 size={17}/>:number(i)}</span><Image unoptimized src={t.artwork} alt={`${t.album} album cover`} width="64" height="64" loading="lazy"/><span className="record-info"><strong>{t.trackName}</strong><span>{t.displayArtist}</span></span><span className="record-arrow"><Play size={15}/></span></button></li>)}</ol>
        </div>
      </section>
      <section id="films" className="film-section" aria-labelledby="film-heading">
        <div className="film-sticky"><div className="film-heading"><div><p className="eyebrow">03 / AFTER THE CREDITS</p><h2 id="film-heading">Some films<br/><em>never leave.</em></h2></div><p>Ten films. A few different ways<br/>of seeing the world.</p></div>
          <div className="film-window"><div className="film-track" id="film-track">{films.map((film,i)=><article className="film-card" key={film.slug}><div className="poster-frame">{film.poster?<Image unoptimized src={film.poster} alt={`${film.title} — ${film.posterTreatment==='impressionist'?'official poster with a light impressionist treatment':'official poster'}`} width="500" height="750" loading="lazy"/>:<div className="poster-awaiting"><span>{number(i)}</span><h3>{film.title}</h3></div>}<span className="film-index">{number(i)} / 10</span></div><h3>{film.title}</h3><p className="film-meta">{film.year} · {film.director}</p><p className="film-note">{film.note}</p></article>)}</div></div>
          <div className="film-footer"><span>FAVORITE DIRECTORS · HITCHCOCK / NOLAN / SCORSESE</span><a href="https://movie.douban.com/people/180864246/collect" target="_blank" rel="noreferrer">The full film diary <ArrowUpRight size={16}/></a><div className="film-progress" aria-hidden="true"><span/></div></div>
        </div>
      </section>
      <section id="books" className="books-section"><div className="books-intro" data-reveal><p className="eyebrow">04 / IN THE MARGINS</p><h2>Other lives.<br/>Other worlds.<br/><em>One bookshelf.</em></h2><p>Ten books I keep close.</p></div><ol className="book-list">{books.map((book,i)=><li key={book.title} data-reveal><span className="book-number">{number(i)}</span><div><h3>{book.title}</h3><p className="book-author">{book.author}</p><p className="book-note">{book.note}</p></div></li>)}</ol></section>
      <section id="broadway" className="broadway-section"><div className="cast-sleeve" data-reveal><Image unoptimized src={broadway.artwork} alt="Two Strangers (Carry a Cake Across New York), original London cast recording cover" loading="lazy" width="600" height="600"/></div><div className="broadway-copy" data-reveal><p className="eyebrow">05 / A LITTLE INTERMISSION</p><h2>New York,<br/><em>on a high note.</em></h2><p>There’s always room for Broadway.</p><h3>“New York”</h3><p className="broadway-credit">Two Strangers (Carry a Cake Across New York)<br/>Sam Tutty & Dujonna Gift · Original London Cast</p><a className="text-link" href={broadway.appleMusicUrl} target="_blank" rel="noreferrer">Listen on Apple Music <ArrowUpRight size={18}/></a></div></section>
      <section id="city" className="city-section"><div className="city-window" aria-hidden="true"><Image unoptimized src="/images/living-room.jpg" alt="" width="1600" height="900" loading="lazy"/></div><div className="city-copy" data-reveal><p className="eyebrow">06 / AROUND THE BLOCK</p><h2>Somewhere<br/><em>in New York.</em></h2><p>Usually between the Upper East Side,<br/>Central Park, the Frick, and Lincoln Center.</p><span className="city-signoff">See you around.</span></div></section>
      <footer><div><p className="eyebrow">UNTIL NEXT TIME</p><h2>Come by<br/><em>again.</em></h2></div><div className="footer-links"><a href="https://www.linkedin.com/in/jingheng-huan/" target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight/></a><a href="https://www.instagram.com/jinghenghuan/" target="_blank" rel="noreferrer">Instagram <ArrowUpRight/></a><a href="https://www.douban.com/people/180864246/" target="_blank" rel="noreferrer">Douban <ArrowUpRight/></a><a href="https://music.apple.com/us/playlist/favorite-songs/pl.u-KRULJdg9MJ" target="_blank" rel="noreferrer">The whole playlist <ArrowUpRight/></a></div><p className="footer-small">JINGHENG HUAN · NEW YORK<br/>AN AFTERNOON UPTOWN</p></footer>
    </main>
    {/* Music previews have track and artist labels; synchronized lyric transcripts are not supplied by Apple. */}
    {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
    <audio aria-label="Apple Music song preview" ref={audio} preload="none" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>{setPlaying(false);setMessage('Preview finished. Listen to the full song on Apple Music.')}} onLoadedMetadata={()=>setDuration(Number.isFinite(audio.current?.duration)?audio.current!.duration:0)} onTimeUpdate={()=>setElapsed(audio.current?.currentTime||0)} onError={()=>{setPlaying(false);setLoading(false);setMessage('This preview is unavailable right now. Listen on Apple Music instead.')}}/>
    {started&&<aside className="mini-player" aria-label="Current record"><Image unoptimized src={track.artwork} alt="" width="42" height="42"/><a href="#records"><strong>{track.trackName}</strong><span>{track.displayArtist} · Preview</span></a><Button variant="ghost" size="icon" aria-label={playing?'Pause preview':'Resume preview'} onClick={toggle}>{playing?<Pause size={18}/>:<Play size={18}/>}</Button><Button variant="ghost" size="icon" aria-label="Next record" onClick={()=>void playTrack((selected+1)%10)}><SkipForward size={16}/></Button></aside>}
  </>;
}
