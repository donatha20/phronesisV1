import React, { useState } from 'react';
import { 
  Radio, Play, Video, Bookmark, Heart, Plus, Search, 
  Sparkles, BookOpen, Clock, Users, Share2 
} from 'lucide-react';
import { PodcastEpisode, PodcastMediaType, LifeSphere } from '../types';

interface PodcastMediaHubViewProps {
  podcasts: PodcastEpisode[];
  onOpenVideoModal: (episode: PodcastEpisode) => void;
  onPlayAudioPodcast: (episode: PodcastEpisode) => void;
  onAddNewPodcast: (episode: PodcastEpisode, file?: File) => void;
  onToggleSave: (id: string) => void;
  onToggleLike: (id: string) => void;
}

export const PodcastMediaHubView: React.FC<PodcastMediaHubViewProps> = ({
  podcasts,
  onOpenVideoModal,
  onPlayAudioPodcast,
  onAddNewPodcast,
  onToggleSave,
  onToggleLike
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'AUDIO' | 'VIDEO'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [series, setSeries] = useState('Phronesis Mentorship Masterclass');
  const [speaker, setSpeaker] = useState('Elder Thomas Bradley');
  const [speakerRole, setSpeakerRole] = useState('Elder & Marketplace Mentor');
  const [mediaType, setMediaType] = useState<PodcastMediaType>('AUDIO');
  const [duration, setDuration] = useState('28:30');
  const [sphere, setSphere] = useState<LifeSphere>('PERSONAL_GROWTH');
  const [description, setDescription] = useState('');
  const [scripturesText, setScripturesText] = useState('Proverbs 3:5-6, Romans 12:1-2');
  const [takeawaysText, setTakeawaysText] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const filtered = podcasts.filter(p => {
    const matchesType = filterType === 'ALL' || p.mediaType === filterType;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const parseDurationToSeconds = (value: string): number => {
    const parts = value.split(':').map((p) => parseInt(p, 10)).filter((n) => !isNaN(n));
    if (parts.length === 0) return 1800;
    return parts.reduce((acc, n) => acc * 60 + n, 0);
  };

  const handleUploadPodcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newEpisode: PodcastEpisode = {
      id: `pod_${Date.now()}`,
      title: title.trim(),
      series: series.trim(),
      speaker: speaker.trim(),
      speakerRole: speakerRole.trim(),
      mediaType,
      durationString: duration || '30:00',
      durationSeconds: parseDurationToSeconds(duration || '30:00'),
      releaseDate: 'Today • Just now',
      sphere,
      description: description.trim(),
      keyScriptures: scripturesText.split(',').map(s => s.trim()).filter(Boolean),
      keyTakeaways: takeawaysText.split('\n').map(s => s.trim()).filter(Boolean),
      viewsCount: 1,
      likesCount: 1,
      isLiked: true,
      isSaved: false,
      coverImageTheme: 'from-amber-800 to-stone-950'
    };

    onAddNewPodcast(newEpisode, mediaFile ?? undefined);
    setIsUploadModalOpen(false);

    // Reset
    setTitle('');
    setDescription('');
    setTakeawaysText('');
    setMediaFile(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
              Media Hub & Podcasts
            </span>
            <span className="text-xs text-stone-500">Audio Voice Reflections & Video Masterclasses</span>
          </div>
          <h1 className="text-2xl font-bold font-serif-display text-stone-900">
            Cross-Generational Kingdom Conversations
          </h1>
          <p className="text-xs text-stone-600">
            Listen to seasoned elders and young disciples explore faith, career ethics, emotional healing, and biblical stewardship.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Upload Podcast / Sermon
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Type pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterType === 'ALL' ? 'bg-stone-900 text-white shadow-sm' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            All Media ({podcasts.length})
          </button>
          <button
            onClick={() => setFilterType('AUDIO')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filterType === 'AUDIO' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Radio className="w-3.5 h-3.5" /> Audio Episodes
          </button>
          <button
            onClick={() => setFilterType('VIDEO')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filterType === 'VIDEO' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Video className="w-3.5 h-3.5" /> Video Masterclasses
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search titles, elders, themes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
          />
        </div>
      </div>

      {/* Podcasts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((ep) => (
          <div
            key={ep.id}
            className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition"
          >
            {/* Visual Cover Banner */}
            <div className={`h-40 bg-gradient-to-br ${ep.coverImageTheme} p-5 text-white flex flex-col justify-between relative`}>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-amber-300 border border-amber-500/30">
                  {ep.mediaType === 'VIDEO' ? '🎥 Video Class' : '🎙️ Audio Reflection'}
                </span>
                <span className="text-[11px] font-mono text-stone-300 bg-black/30 px-2 py-0.5 rounded">
                  {ep.durationString}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-amber-200 uppercase tracking-wide truncate">
                  {ep.series}
                </div>
                <h3 className="text-base font-bold font-serif-display leading-tight line-clamp-2">
                  {ep.title}
                </h3>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xs text-stone-500 flex items-center justify-between">
                  <span>Speaker: <strong className="text-stone-800">{ep.speaker}</strong></span>
                  <span>{ep.releaseDate}</span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                  {ep.description}
                </p>

                {/* Key Scripture Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ep.keyScriptures.slice(0, 2).map((sc, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                      {sc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleLike(ep.id)}
                    className={`p-2 rounded-lg text-xs transition ${
                      ep.isLiked ? 'text-rose-600 bg-rose-50' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${ep.isLiked ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => onToggleSave(ep.id)}
                    className={`p-2 rounded-lg text-xs transition ${
                      ep.isSaved ? 'text-amber-600 bg-amber-50' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${ep.isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {ep.mediaType === 'VIDEO' ? (
                  <button
                    onClick={() => onOpenVideoModal(ep)}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5 text-amber-400" /> Watch Video
                  </button>
                ) : (
                  <button
                    onClick={() => onPlayAudioPodcast(ep)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Listen Audio
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-lg font-bold font-serif-display text-stone-900">
                Upload Podcast Episode or Sermon Masterclass
              </h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadPodcast} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Episode Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Ep 43: Navigating Relational Integrity in Modern Dating"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Media Format</label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as PodcastMediaType)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                  >
                    <option value="AUDIO">🎙️ Audio Voice Reflection</option>
                    <option value="VIDEO">🎥 Video Masterclass / Studio</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g., 34:20"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  {mediaType === 'VIDEO' ? 'Video File' : 'Audio File'}
                </label>
                <input
                  type="file"
                  accept={mediaType === 'VIDEO' ? 'video/*' : 'audio/*'}
                  onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
                  className="w-full text-stone-700 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:bg-amber-600 file:text-white file:font-bold file:text-xs hover:file:bg-amber-500 bg-stone-50 border border-stone-200 rounded-xl"
                />
                {mediaFile && (
                  <p className="text-[11px] text-stone-500">{mediaFile.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Speaker Name</label>
                  <input
                    type="text"
                    required
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Sphere Focus</label>
                  <select
                    value={sphere}
                    onChange={(e) => setSphere(e.target.value as LifeSphere)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                  >
                    <option value="PERSONAL_GROWTH">Personal Growth</option>
                    <option value="ACADEMIA_CAREER">Academia & Career</option>
                    <option value="RELATIONSHIPS">Relationships</option>
                    <option value="FINANCES">Finances</option>
                    <option value="PHYSICAL_WELLBEING">Physical Wellbeing</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Key Scriptures (comma separated)</label>
                <input
                  type="text"
                  value={scripturesText}
                  onChange={(e) => setScripturesText(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Key Takeaways (one per line)</label>
                <textarea
                  rows={3}
                  placeholder={'e.g.\nPractical steps for walking in daily obedience\nHow to discern God\'s voice in decision-making'}
                  value={takeawaysText}
                  onChange={(e) => setTakeawaysText(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Episode Description & Summary</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Outline key conversation topics and practical takeaways..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-amber-600 resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-sm"
                >
                  Publish Media Episode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
