import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Sparkles, FastForward } from 'lucide-react';

interface AudioVoicePlayerProps {
  title: string;
  speaker: string;
  durationSeconds: number;
  audioUrl?: string;
  onClose?: () => void;
}

export const AudioVoicePlayer: React.FC<AudioVoicePlayerProps> = ({
  title,
  speaker,
  durationSeconds,
  audioUrl
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fallbackAudio = "https://actions.google.com/sounds/v1/ambiences/gentle_stream.ogg";
  const source = audioUrl || fallbackAudio;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay policy or simulate timer
        setIsPlaying(true);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
    }
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    setPlaybackRate(speeds[nextIndex]);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const effectiveDuration = durationSeconds || 240;

  return (
    <div id="audio-player-bar" className="bg-stone-900 text-stone-100 rounded-2xl p-4 border border-stone-800 shadow-xl">
      <audio
        ref={audioRef}
        src={source}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        loop
      />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Track info */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Volume2 className="w-5 h-5 animate-pulse" />
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Audio Voice Reflection
            </div>
            <div className="text-sm font-medium text-stone-100 truncate">{title}</div>
            <div className="text-xs text-stone-400 truncate">Spoken by {speaker}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-1.5 w-full sm:max-w-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime = Math.max(0, currentTime - 10);
              }}
              title="Rewind 10s"
              className="p-1.5 text-stone-400 hover:text-stone-200 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              id="audio-play-toggle-btn"
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center transition shadow-md shadow-amber-900/30"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime = Math.min(effectiveDuration, currentTime + 10);
              }}
              title="Forward 10s"
              className="p-1.5 text-stone-400 hover:text-stone-200 transition"
            >
              <FastForward className="w-4 h-4" />
            </button>
            <button
              onClick={cycleSpeed}
              className="px-2 py-0.5 rounded text-xs font-bold bg-stone-800 hover:bg-stone-700 text-amber-300 transition"
            >
              {playbackRate}x
            </button>
          </div>

          <div className="w-full flex items-center gap-2 text-xs text-stone-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={effectiveDuration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span>{formatTime(effectiveDuration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
