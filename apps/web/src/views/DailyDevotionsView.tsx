import React, { useState } from 'react';
import { 
  BookOpen, Sparkles, Heart, MessageSquare, Share2, 
  Plus, Bookmark, Volume2, Send, Filter, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { DailyDevotion, UserProfile, LifeSphere, DevotionComment } from '../types';

interface DailyDevotionsViewProps {
  devotions: DailyDevotion[];
  currentUser: UserProfile;
  onPlayAudio: (devotion: DailyDevotion) => void;
  onPostDevotion: (newDevotion: DailyDevotion) => void;
}

export const DailyDevotionsView: React.FC<DailyDevotionsViewProps> = ({
  devotions,
  currentUser,
  onPlayAudio,
  onPostDevotion
}) => {
  const [selectedDevotion, setSelectedDevotion] = useState<DailyDevotion>(devotions[0]);
  const [activeSphereFilter, setActiveSphereFilter] = useState<string>('ALL');
  const [commentText, setCommentText] = useState('');
  const [isNewDevotionModalOpen, setIsNewDevotionModalOpen] = useState(false);

  // New devotion form state
  const [newTitle, setNewTitle] = useState('');
  const [newScriptureRef, setNewScriptureRef] = useState('');
  const [newScriptureText, setNewScriptureText] = useState('');
  const [newReflection, setNewReflection] = useState('');
  const [newPrayer, setNewPrayer] = useState('');
  const [newActionStep, setNewActionStep] = useState('');
  const [newSphere, setNewSphere] = useState<LifeSphere>('PERSONAL_GROWTH');

  const filteredDevotions = activeSphereFilter === 'ALL'
    ? devotions
    : devotions.filter(d => d.categorySphere === activeSphereFilter);

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment: DevotionComment = {
      id: `c_${Date.now()}`,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorInitial: currentUser.avatarInitial,
      text: commentText.trim(),
      timestamp: 'Just now',
      likes: 0
    };
    const updated = {
      ...selectedDevotion,
      comments: [...selectedDevotion.comments, newComment]
    };
    setSelectedDevotion(updated);
    setCommentText('');
  };

  const handleCreateDevotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newReflection.trim()) return;

    const created: DailyDevotion = {
      id: `dev_${Date.now()}`,
      title: newTitle.trim(),
      date: 'Today • Just now',
      theme: `${newSphere.replace('_', ' ')} Discipleship`,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorTitle: currentUser.title,
      scriptureReference: newScriptureRef || 'Proverbs 3:5-6',
      scriptureText: newScriptureText || '"Trust in the Lord with all your heart and lean not on your own understanding."',
      reflectionBody: newReflection.trim(),
      prayerPoint: newPrayer.trim() || 'Lord, help us apply this truth faithfully.',
      practicalActionStep: newActionStep.trim() || 'Pray through this scripture and share with a brother or sister.',
      audioDurationSeconds: 180,
      audioVoiceNoteUrl: 'https://actions.google.com/sounds/v1/ambiences/gentle_stream.ogg',
      categorySphere: newSphere,
      likesCount: 1,
      isLikedByUser: true,
      comments: [],
      tags: ['Phronesis', newSphere, 'Wisdom'],
      readTimeMinutes: 3
    };

    onPostDevotion(created);
    setSelectedDevotion(created);
    setIsNewDevotionModalOpen(false);

    // Reset
    setNewTitle('');
    setNewScriptureRef('');
    setNewScriptureText('');
    setNewReflection('');
    setNewPrayer('');
    setNewActionStep('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
              Daily Phronesis
            </span>
            <span className="text-xs text-stone-500">Practical Spiritual Wisdom</span>
          </div>
          <h1 className="text-2xl font-bold font-serif-display text-stone-900 mt-1">
            Devotional Feed & Elder Voice Notes
          </h1>
          <p className="text-xs text-stone-600">
            Biblical meditations curated by senior elders and young believers for daily kingdom living.
          </p>
        </div>

        <button
          onClick={() => setIsNewDevotionModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Post Phronesis Devotional
        </button>
      </div>

      {/* Main layout: Sidebar feed list + Selected devotion reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Feed list (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Sphere Filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            {['ALL', 'PERSONAL_GROWTH', 'FINANCES', 'ACADEMIA_CAREER', 'RELATIONSHIPS'].map((sp) => (
              <button
                key={sp}
                onClick={() => setActiveSphereFilter(sp)}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                  activeSphereFilter === sp
                    ? 'bg-amber-700 text-white'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {sp === 'ALL' ? 'All' : sp.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Devotion Cards Feed */}
          <div className="space-y-3">
            {filteredDevotions.map((dev) => {
              const isSelected = selectedDevotion.id === dev.id;
              return (
                <div
                  key={dev.id}
                  onClick={() => setSelectedDevotion(dev)}
                  className={`p-4 rounded-2xl border transition cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-amber-50/50 border-amber-400 shadow-sm'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="font-semibold text-amber-800 uppercase tracking-wider">{dev.date}</span>
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-amber-600" /> {Math.floor(dev.audioDurationSeconds / 60)}m audio
                    </span>
                  </div>

                  <h3 className="text-sm font-bold font-serif-display text-stone-900 leading-snug">
                    {dev.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2">
                    {dev.reflectionBody}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px] text-stone-500">
                    <span>By {dev.authorName}</span>
                    <span className="text-amber-800 font-bold flex items-center gap-0.5">
                      Read <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Devotion Full Reader (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          
          {/* Header */}
          <div className="space-y-3 pb-6 border-b border-stone-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                  {selectedDevotion.categorySphere.replace('_', ' ')}
                </span>
                <span className="text-xs text-stone-500 font-mono">{selectedDevotion.date}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPlayAudio(selectedDevotion)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-bold transition shadow-sm"
                >
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>Play Voice Note</span>
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif-display text-stone-900 leading-snug">
              {selectedDevotion.title}
            </h1>

            <div className="flex items-center gap-3 pt-1">
              <div className="w-9 h-9 rounded-xl bg-amber-700/20 text-amber-900 font-bold flex items-center justify-center text-sm">
                {selectedDevotion.authorName[0]}
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900">{selectedDevotion.authorName}</div>
                <div className="text-[11px] text-stone-500">{selectedDevotion.authorTitle}</div>
              </div>
            </div>
          </div>

          {/* Scripture Anchor Card */}
          <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200/80 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-700" /> Scripture Meditation: {selectedDevotion.scriptureReference}
            </div>
            <p className="text-base font-serif-display italic text-stone-900 leading-relaxed">
              {selectedDevotion.scriptureText}
            </p>
          </div>

          {/* Body Reflection */}
          <div className="prose prose-stone max-w-none text-stone-800 text-sm leading-relaxed whitespace-pre-line">
            {selectedDevotion.reflectionBody}
          </div>

          {/* Prayer Point */}
          <div className="bg-stone-900 rounded-2xl p-5 text-stone-100 space-y-2 border border-stone-800 shadow-md">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Prayer of Phronesis
            </div>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed italic">
              "{selectedDevotion.prayerPoint}"
            </p>
          </div>

          {/* Practical Action Step */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600" /> Practical Life Application Step
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              {selectedDevotion.practicalActionStep}
            </p>
          </div>

          {/* Community Reflections & Discussion */}
          <div className="pt-6 border-t border-stone-200 space-y-4">
            <h3 className="text-base font-bold font-serif-display text-stone-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>Mentee & Elder Reflections ({selectedDevotion.comments.length})</span>
            </h3>

            {/* Existing Comments */}
            <div className="space-y-3">
              {selectedDevotion.comments.map((c) => (
                <div key={c.id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-600/20 text-amber-900 font-bold text-xs flex items-center justify-center">
                        {c.authorInitial}
                      </span>
                      <span className="text-xs font-bold text-stone-900">{c.authorName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                        {c.authorRole === 'MENTOR_ELDER' ? 'Elder' : 'Mentee'}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400">{c.timestamp}</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed pl-8">
                    {c.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Add Comment Input */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Share a reflection, revelation, or question on this passage..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600"
              />
              <button
                onClick={handleAddComment}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post New Devotion Modal */}
      {isNewDevotionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-lg font-bold font-serif-display text-stone-900">
                Post Phronesis Devotional
              </h2>
              <button
                onClick={() => setIsNewDevotionModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDevotion} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Devotion Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Guarding the Heart in Tech Decisions"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Life Sphere Focus</label>
                  <select
                    value={newSphere}
                    onChange={(e) => setNewSphere(e.target.value as LifeSphere)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                  >
                    <option value="PERSONAL_GROWTH">Personal Growth & Prayer</option>
                    <option value="ACADEMIA_CAREER">Academia & Career</option>
                    <option value="RELATIONSHIPS">Relationships & Family</option>
                    <option value="FINANCES">Finances & Stewardship</option>
                    <option value="PHYSICAL_WELLBEING">Physical Wellbeing</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Scripture Reference</label>
                  <input
                    type="text"
                    placeholder="e.g., Proverbs 4:23"
                    value={newScriptureRef}
                    onChange={(e) => setNewScriptureRef(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Scripture Text</label>
                <textarea
                  rows={2}
                  placeholder="Insert the Bible verse quote..."
                  value={newScriptureText}
                  onChange={(e) => setNewScriptureText(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-amber-600 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Reflection & Practical Exegesis</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Share the biblical wisdom, practical insight, and theological application..."
                  value={newReflection}
                  onChange={(e) => setNewReflection(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-amber-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Prayer Point</label>
                  <input
                    type="text"
                    placeholder="Focus prayer..."
                    value={newPrayer}
                    onChange={(e) => setNewPrayer(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Action Step</label>
                  <input
                    type="text"
                    placeholder="Specific application..."
                    value={newActionStep}
                    onChange={(e) => setNewActionStep(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsNewDevotionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-sm"
                >
                  Publish Phronesis Devotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
