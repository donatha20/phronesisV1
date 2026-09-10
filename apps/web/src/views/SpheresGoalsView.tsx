import React, { useState } from 'react';
import { 
  Target, Plus, CheckCircle2, Circle, Sparkles, BookOpen, 
  MessageSquare, ShieldCheck, UserCheck, Calendar, ArrowUpRight 
} from 'lucide-react';
import { GoalItem, LifeSphere, UserProfile, MilestoneItem } from '../types';

interface SpheresGoalsViewProps {
  goals: GoalItem[];
  currentUser: UserProfile;
  onUpdateGoal: (updatedGoal: GoalItem) => void;
  onCreateGoal: (newGoal: GoalItem) => void;
}

export const SpheresGoalsView: React.FC<SpheresGoalsViewProps> = ({
  goals,
  currentUser,
  onUpdateGoal,
  onCreateGoal
}) => {
  const [selectedSphere, setSelectedSphere] = useState<LifeSphere | 'ALL'>('ALL');
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);

  // Form State
  const [goalTitle, setGoalTitle] = useState('');
  const [goalSphere, setGoalSphere] = useState<LifeSphere>('PERSONAL_GROWTH');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalScripture, setGoalScripture] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [goalMilestonesText, setGoalMilestonesText] = useState('');
  const [assignedMentor, setAssignedMentor] = useState('Elder Thomas Bradley');

  const sphereDefinitions = [
    { id: 'PERSONAL_GROWTH', label: 'Personal Growth & Prayer', color: 'border-amber-500 bg-amber-50 text-amber-900', desc: 'Secret place intimacy, Scripture memorization, theology study' },
    { id: 'ACADEMIA_CAREER', label: 'Academia & Career', color: 'border-blue-500 bg-blue-50 text-blue-900', desc: 'Workplace witness, craft excellence, ethical decision making' },
    { id: 'RELATIONSHIPS', label: 'Relationships & Family', color: 'border-rose-500 bg-rose-50 text-rose-900', desc: 'Biblical brotherhood, family honor, purity, conflict resolution' },
    { id: 'FINANCES', label: 'Finances & Stewardship', color: 'border-emerald-500 bg-emerald-50 text-emerald-900', desc: 'Firstfruits tithing, debt-free living, Kingdom philanthropy' },
    { id: 'PHYSICAL_WELLBEING', label: 'Physical Wellbeing', color: 'border-purple-500 bg-purple-50 text-purple-900', desc: 'Body as Holy Spirit temple, rest rhythms, digital Sabbath' }
  ];

  const filteredGoals = selectedSphere === 'ALL'
    ? goals
    : goals.filter(g => g.sphere === selectedSphere);

  const toggleMilestone = (goal: GoalItem, milestoneId: string) => {
    const updatedMilestones = goal.milestones.map(m => {
      if (m.id === milestoneId) {
        return { ...m, isCompleted: !m.isCompleted, completedDate: !m.isCompleted ? 'Today' : undefined };
      }
      return m;
    });

    const completedCount = updatedMilestones.filter(m => m.isCompleted).length;
    const progressPercent = Math.round((completedCount / (updatedMilestones.length || 1)) * 100);

    onUpdateGoal({
      ...goal,
      milestones: updatedMilestones,
      progressPercent
    });
  };

  const handleCreateNewGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    const rawMilestones = goalMilestonesText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const milestones: MilestoneItem[] = rawMilestones.length > 0
      ? rawMilestones.map((m, i) => ({ id: `m_${Date.now()}_${i}`, title: m, isCompleted: false }))
      : [{ id: `m_${Date.now()}_0`, title: 'Initial milestone step', isCompleted: false }];

    const newGoal: GoalItem = {
      id: `goal_${Date.now()}`,
      sphere: goalSphere,
      title: goalTitle.trim(),
      description: goalDescription.trim(),
      scriptureAnchor: goalScripture.trim() || 'Proverbs 16:3 - "Commit to the Lord whatever you do, and he will establish your plans."',
      targetDate: goalDate || '2026-11-30',
      milestones,
      status: 'ACTIVE',
      mentorFeedback: 'Looking forward to walking alongside you in this sphere! Keep your eyes fixed on Christ.',
      mentorApproved: true,
      checkInFrequency: 'Weekly',
      progressPercent: 0,
      createdBy: currentUser.name,
      assignedTo: assignedMentor
    };

    onCreateGoal(newGoal);
    setIsAddGoalModalOpen(false);

    // Reset
    setGoalTitle('');
    setGoalDescription('');
    setGoalScripture('');
    setGoalMilestonesText('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
              5 Life Spheres
            </span>
            <span className="text-xs text-stone-500">Holistic Christian Discipleship Framework</span>
          </div>
          <h1 className="text-2xl font-bold font-serif-display text-stone-900">
            Spiritual Accountability & Goal Milestones
          </h1>
          <p className="text-xs text-stone-600">
            Formulating intentional spiritual, career, relational, financial, and bodily habits under elder guidance.
          </p>
        </div>

        <button
          onClick={() => setIsAddGoalModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Discipleship Goal
        </button>
      </div>

      {/* Sphere Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setSelectedSphere('ALL')}
          className={`p-4 rounded-2xl border text-left transition ${
            selectedSphere === 'ALL'
              ? 'bg-stone-900 text-white border-stone-800 shadow-md'
              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider">All Spheres</div>
          <div className="text-lg font-bold font-serif-display mt-1">{goals.length} Goals</div>
          <div className="text-[11px] text-stone-400 mt-1">Holistic discipleship view</div>
        </button>

        {sphereDefinitions.map((sd) => {
          const count = goals.filter(g => g.sphere === sd.id).length;
          const isSelected = selectedSphere === sd.id;
          return (
            <button
              key={sd.id}
              onClick={() => setSelectedSphere(sd.id as LifeSphere)}
              className={`p-4 rounded-2xl border text-left transition ${
                isSelected
                  ? 'bg-amber-900 text-white border-amber-800 shadow-md'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider truncate text-amber-800">
                {sd.label.split('&')[0]}
              </div>
              <div className="text-base font-bold font-serif-display mt-1 truncate">
                {sd.label}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">{count} active goals</div>
            </button>
          );
        })}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGoals.map((g) => (
          <div
            key={g.id}
            className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Top Meta */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                  {g.sphere.replace('_', ' ')}
                </span>
                <span className="text-xs text-stone-500 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5" /> Target: {g.targetDate}
                </span>
              </div>

              {/* Title & Progress */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold font-serif-display text-stone-900 leading-snug">
                  {g.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {g.description}
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-600">Discipleship Milestones</span>
                  <span className="text-amber-800 font-mono">{g.progressPercent}%</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${g.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Scripture Anchor */}
              <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-xs">
                <div className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                  <BookOpen className="w-3.5 h-3.5" /> Scripture Anchor
                </div>
                <p className="font-serif-display italic text-stone-700">{g.scriptureAnchor}</p>
              </div>

              {/* Milestones Checklist */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Action Milestones ({g.milestones.filter(m => m.isCompleted).length}/{g.milestones.length})
                </div>
                <div className="space-y-1.5">
                  {g.milestones.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => toggleMilestone(g, m.id)}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 text-xs transition cursor-pointer ${
                        m.isCompleted
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {m.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                      )}
                      <span className={`flex-1 ${m.isCompleted ? 'line-through opacity-80' : ''}`}>
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mentor Feedback Footer */}
            <div className="pt-3 border-t border-stone-100 bg-amber-50/40 -mx-6 -mb-6 p-4 rounded-b-3xl space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-amber-700" /> Mentor Review: {g.assignedTo}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  Approved
                </span>
              </div>
              <p className="text-xs text-stone-700 italic">
                "{g.mentorFeedback}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Goal Modal */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-lg font-bold font-serif-display text-stone-900">
                Create 5-Sphere Discipleship Goal
              </h2>
              <button
                onClick={() => setIsAddGoalModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewGoal} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Morning Romans Journaling & Secret Place Prayer"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Life Sphere</label>
                  <select
                    value={goalSphere}
                    onChange={(e) => setGoalSphere(e.target.value as LifeSphere)}
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
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Target Completion Date</label>
                  <input
                    type="date"
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Scripture Anchor</label>
                <input
                  type="text"
                  placeholder="e.g., Psalm 119:105 - 'Your word is a lamp to my feet...'"
                  value={goalScripture}
                  onChange={(e) => setGoalScripture(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Description & Intent</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why this goal matters for your spiritual walk and character formation..."
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-amber-600 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Milestones (1 per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Step 1: Read Romans 1-4&#10;Step 2: Read Romans 5-8&#10;Step 3: Discipleship review with Elder Thomas"
                  value={goalMilestonesText}
                  onChange={(e) => setGoalMilestonesText(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-amber-600 resize-none font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-sm"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
