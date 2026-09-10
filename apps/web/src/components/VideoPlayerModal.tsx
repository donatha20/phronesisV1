import React from 'react';
import { X, ExternalLink, Bookmark, Heart, Share2, Sparkles, BookOpen } from 'lucide-react';
import { PodcastEpisode } from '../types';

interface VideoPlayerModalProps {
  episode: PodcastEpisode | null;
  onClose: () => void;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  episode,
  onClose,
  onToggleLike,
  onToggleSave
}) => {
  if (!episode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto text-stone-100 shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {episode.series}
            </span>
            <span className="text-xs text-stone-400">• {episode.durationString}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Canvas Container */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/40 to-transparent flex flex-col justify-end p-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-600/90 text-white text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> High Definition Video Masterclass
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif-display text-white">
                {episode.title}
              </h2>
              <p className="text-sm text-stone-300">
                Featuring: <strong className="text-amber-300">{episode.speaker}</strong> ({episode.speakerRole})
              </p>
            </div>
          </div>
          <div className="text-center p-6 z-10">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/90 hover:bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg cursor-pointer transition transform hover:scale-105">
              <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="text-xs text-stone-300 mt-3">Interactive Studio Stream • Synchronized Scriptures Loaded</p>
          </div>
        </div>

        {/* Details & Scriptures */}
        <div className="p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
            <div className="text-sm text-stone-400">
              Released on <strong className="text-stone-200">{episode.releaseDate}</strong> • {episode.viewsCount} disciples tuned in
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleLike(episode.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  episode.isLiked
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${episode.isLiked ? 'fill-current' : ''}`} />
                {episode.likesCount}
              </button>
              <button
                onClick={() => onToggleSave(episode.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  episode.isSaved
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${episode.isSaved ? 'fill-current' : ''}`} />
                {episode.isSaved ? 'Saved to Vault' : 'Save'}
              </button>
              <button
                onClick={() => alert("Copied discipleship podcast sharing link to clipboard!")}
                className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 transition"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-400">Episode Summary</h4>
            <p className="text-stone-300 text-sm leading-relaxed">{episode.description}</p>
          </div>

          {/* Key Scriptures */}
          <div className="bg-stone-800/60 rounded-xl p-4 border border-stone-700/60 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Key Scripture Anchors
            </h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {episode.keyScriptures.map((sc, i) => (
                <span key={i} className="px-3 py-1 rounded-lg text-xs font-mono bg-stone-900 text-amber-200 border border-amber-900/40">
                  {sc}
                </span>
              ))}
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Key Discipleship Takeaways</h4>
            <ul className="space-y-1.5 text-sm text-stone-300">
              {episode.keyTakeaways.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
