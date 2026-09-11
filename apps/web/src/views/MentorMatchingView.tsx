import React, { useState } from 'react';
import {
  Users, ShieldCheck, Video, CheckCircle2, Search,
  Edit3, Heart, X, Phone, Mail, FileText, Clock
} from 'lucide-react';
import { UserProfile, LifeSphere } from '../types';

export interface ApplyToMentorInput {
  mentorId: string;
  sphere: string;
  introduction: string;
  growthDesire: string;
  meetingFrequency: string;
}

export interface EditMyBioInput {
  title: string;
  location: string;
  yearsInFaith: number;
  churchCommunity: string;
  bio: string;
  fullBiography: string;
  ministryJourney: string;
  mentorshipPhilosophy: string;
  availabilitySchedule: string;
  favoriteScripture: string;
}

interface MentorMatchingViewProps {
  mentors: UserProfile[];
  mentees: UserProfile[];
  currentUser: UserProfile;
  onSelectMentorForBooking: (mentor: UserProfile) => void;
  onEditMyBio: (input: EditMyBioInput) => void;
  onApplyToMentor: (input: ApplyToMentorInput) => void;
}

export const MentorMatchingView: React.FC<MentorMatchingViewProps> = ({
  mentors,
  mentees,
  currentUser,
  onSelectMentorForBooking,
  onEditMyBio,
  onApplyToMentor
}) => {
  const [activeTab, setActiveTab] = useState<'MENTORS' | 'MENTEES'>('MENTORS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGift, setSelectedGift] = useState<string>('ALL');
  const [selectedSphereFilter] = useState<string>('ALL');

  // Modals
  const [selectedMentorForBio, setSelectedMentorForBio] = useState<UserProfile | null>(null);
  const [isEditBioModalOpen, setIsEditBioModalOpen] = useState(false);
  const [isPairingRequestModalOpen, setIsPairingRequestModalOpen] = useState<UserProfile | null>(null);
  const [pairingSuccessToast, setPairingSuccessToast] = useState<string | null>(null);

  // Edit-my-bio form state (mentors only), pre-filled from the current user
  const [bioTitle, setBioTitle] = useState(currentUser.title);
  const [bioLocation, setBioLocation] = useState(currentUser.location);
  const [bioYearsInFaith, setBioYearsInFaith] = useState(currentUser.yearsInFaith);
  const [bioChurch, setBioChurch] = useState(currentUser.churchCommunity);
  const [bioShort, setBioShort] = useState(currentUser.bio);
  const [bioFull, setBioFull] = useState(currentUser.fullBiography ?? '');
  const [bioMinistryJourney, setBioMinistryJourney] = useState(currentUser.ministryJourney ?? '');
  const [bioPhilosophy, setBioPhilosophy] = useState(currentUser.mentorshipPhilosophy ?? '');
  const [bioAvailability, setBioAvailability] = useState(currentUser.availabilitySchedule ?? '');
  const [bioScripture, setBioScripture] = useState(currentUser.favoriteScripture);

  // Pairing Request Form State
  const [pairingSphere, setPairingSphere] = useState<LifeSphere>('PERSONAL_GROWTH');
  const [pairingIntro, setPairingIntro] = useState('');
  const [pairingGoal, setPairingGoal] = useState('');
  const [pairingFrequency, setPairingFrequency] = useState('Bi-weekly 1-on-1 Sessions');

  const allGifts = ['ALL', 'Wisdom & Counsel', 'Teaching', 'Pastoral Shepherding', 'Discernment', 'Giving', 'Administration', 'Encouragement'];

  const displayedList = (activeTab === 'MENTORS' ? mentors : mentees).filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.churchCommunity.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGift = selectedGift === 'ALL' || user.spiritualGifts.includes(selectedGift);
    const matchesSphere = selectedSphereFilter === 'ALL' || user.primarySpheres.includes(selectedSphereFilter as LifeSphere);
    return matchesSearch && matchesGift && matchesSphere;
  });

  const isMentor = currentUser.role === 'MENTOR_ELDER';

  const handleSaveMyBio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bioShort.trim()) return;

    onEditMyBio({
      title: bioTitle.trim(),
      location: bioLocation.trim(),
      yearsInFaith: Number(bioYearsInFaith) || 0,
      churchCommunity: bioChurch.trim(),
      bio: bioShort.trim(),
      fullBiography: bioFull.trim(),
      ministryJourney: bioMinistryJourney.trim(),
      mentorshipPhilosophy: bioPhilosophy.trim(),
      availabilitySchedule: bioAvailability.trim(),
      favoriteScripture: bioScripture.trim(),
    });
    setIsEditBioModalOpen(false);
    setPairingSuccessToast('Your elder biography has been updated.');
    setTimeout(() => setPairingSuccessToast(null), 5000);
  };

  const handleSendPairingRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPairingRequestModalOpen) return;

    const targetMentor = isPairingRequestModalOpen;
    onApplyToMentor({
      mentorId: targetMentor.id,
      sphere: pairingSphere,
      introduction: pairingIntro || 'Eager to grow under your biblical counsel and prayer guidance.',
      growthDesire: pairingGoal || 'Cultivating deep spiritual habits and wisdom in daily life decisions.',
      meetingFrequency: pairingFrequency,
    });
    setIsPairingRequestModalOpen(null);
    setSelectedMentorForBio(null);
    setPairingSuccessToast(`Your mentorship application to ${targetMentor.name} has been sent — they'll review and accept it.`);
    setTimeout(() => setPairingSuccessToast(null), 5000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Toast Notification */}
      {pairingSuccessToast && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs font-semibold">{pairingSuccessToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Cross-Generational Discipleship Directory
            </span>
            <span className="text-xs text-stone-500">Biographies & Direct Pairing</span>
          </div>
          <h1 className="text-2xl font-bold font-serif-display text-stone-900">
            Senior Elders & Mentee Matching
          </h1>
          <p className="text-xs text-stone-600 max-w-2xl">
            Read comprehensive elder testimonies, explore spiritual backgrounds, and choose a seasoned spiritual father or mother for direct discipleship, goal review, and prayer communion.
          </p>
        </div>

        {/* Action Buttons */}
        {isMentor && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsEditBioModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Edit3 className="w-4 h-4 text-amber-400" /> Edit My Elder Biography
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-stone-200 pb-3">
        
        {/* Tab switcher */}
        <div className="flex bg-stone-100 p-1 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('MENTORS')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'MENTORS' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Senior Church Elders ({mentors.length})
          </button>
          {(isMentor || currentUser.role === 'ADMIN') && (
            <button
              onClick={() => setActiveTab('MENTEES')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'MENTEES' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {currentUser.role === 'ADMIN' ? 'Young Believers' : 'My Mentees'} ({mentees.length})
            </button>
          )}
        </div>

        {/* Gifts & Search */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
            {allGifts.slice(0, 5).map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGift(g)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition text-xs ${
                  selectedGift === g
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, church, biography..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
            />
          </div>
        </div>
      </div>

      {/* Mentor & Mentee Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedList.map((profile) => {
          const isCurrentMentor = currentUser.assignedMentorId === profile.id;

          return (
            <div
              key={profile.id}
              className={`bg-white rounded-3xl p-6 border shadow-sm space-y-5 flex flex-col justify-between hover:shadow-md transition group ${
                isCurrentMentor ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-stone-200 hover:border-amber-400'
              }`}
            >
              <div className="space-y-4">
                
                {/* Profile Card Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600/30 to-amber-900/40 border border-amber-500/50 flex items-center justify-center font-bold text-xl text-amber-900">
                      {profile.avatarInitial}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-stone-900">{profile.name}</h3>
                        {profile.isVerifiedElder && (
                          <span title="Verified Elder">
                            <ShieldCheck className="w-4 h-4 text-amber-600 fill-amber-100" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 line-clamp-1">{profile.title}</p>
                    </div>
                  </div>

                  {isCurrentMentor && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      Your Mentor
                    </span>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {profile.badges.map((b, i) => (
                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/60">
                      {b}
                    </span>
                  ))}
                </div>

                {/* Short Bio summary */}
                <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                  {profile.bio}
                </p>

                {/* Meta stats */}
                <div className="bg-stone-50 rounded-2xl p-3 border border-stone-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold">Years in Faith:</span>
                    <div className="font-bold text-stone-800">{profile.yearsInFaith} Years</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold">Discipleship Hours:</span>
                    <div className="font-bold text-amber-800 font-mono">{profile.discipleshipHours} hrs</div>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-stone-200/60 text-stone-600">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Church Fellowship:</span>
                    <span className="truncate block font-medium text-stone-700">{profile.churchCommunity}</span>
                  </div>
                </div>

                {/* Spiritual Gifts */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Spiritual Gifts:</span>
                  <div className="flex flex-wrap gap-1">
                    {profile.spiritualGifts.map((g, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-100 flex gap-2">
                <button
                  onClick={() => setSelectedMentorForBio(profile)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-700" /> Read Full Biography
                </button>

                {activeTab === 'MENTORS' ? (
                  <button
                    onClick={() => setIsPairingRequestModalOpen(profile)}
                    className="py-2.5 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" /> Choose Mentor
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectMentorForBooking(profile)}
                    className="py-2.5 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Video className="w-3.5 h-3.5" /> Book Call
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: FULL MENTOR BIOGRAPHY & TESTIMONY */}
      {selectedMentorForBio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 my-8 animate-fade-in max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-2xl border border-amber-300">
                  {selectedMentorForBio.avatarInitial}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold font-serif-display text-stone-900">
                      {selectedMentorForBio.name}
                    </h2>
                    {selectedMentorForBio.isVerifiedElder && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                        <ShieldCheck className="w-3 h-3 text-amber-600" /> Verified Elder
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500">{selectedMentorForBio.title}</p>
                  <p className="text-xs text-stone-600 font-medium mt-0.5">
                    {selectedMentorForBio.churchCommunity} • {selectedMentorForBio.location}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedMentorForBio(null)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-5 text-xs">
              
              {/* Full Biography */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Life Testimony & Spiritual Biography
                </span>
                <p className="text-stone-700 leading-relaxed text-sm whitespace-pre-line bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  {selectedMentorForBio.fullBiography || selectedMentorForBio.bio}
                </p>
              </div>

              {/* Ministry Background & Philosophy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                    Ministry Track Record
                  </span>
                  <p className="text-stone-700 leading-relaxed">
                    {selectedMentorForBio.ministryJourney || '30+ years of faithful service, shepherding families and young believers.'}
                  </p>
                </div>

                <div className="space-y-1 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                    Discipleship Philosophy
                  </span>
                  <p className="text-stone-700 leading-relaxed">
                    {selectedMentorForBio.mentorshipPhilosophy || 'Rooted in 2 Timothy 2:2 — intentional life-on-life spiritual investment.'}
                  </p>
                </div>
              </div>

              {/* Availability Schedule */}
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Discipleship Availability & Office Hours
                </span>
                <p className="text-stone-800 font-medium">
                  {selectedMentorForBio.availabilitySchedule || 'Available weekly for video/audio call appointments and text accountability.'}
                </p>
              </div>

              {/* Favorite Scripture */}
              <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Life Scripture Anchor
                </span>
                <p className="font-serif-display text-sm italic text-amber-100">
                  {selectedMentorForBio.favoriteScripture}
                </p>
              </div>

              {/* Contact info info */}
              <div className="flex flex-wrap gap-4 text-stone-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                  <span>{selectedMentorForBio.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  <span>WhatsApp: {selectedMentorForBio.phone}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setSelectedMentorForBio(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 text-xs"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const target = selectedMentorForBio;
                  setSelectedMentorForBio(null);
                  setIsPairingRequestModalOpen(target);
                }}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-amber-950/20"
              >
                <Heart className="w-4 h-4 fill-current" /> Choose {selectedMentorForBio.name.split(' ')[0]} as My Mentor
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: PAIRING REQUEST FORM (MENTEE CHOOSES MENTOR) */}
      {isPairingRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 my-8 animate-fade-in">
            
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                    Discipleship Covenant
                  </span>
                  <span className="text-xs text-stone-500">Pairing Application</span>
                </div>
                <h2 className="text-xl font-bold font-serif-display text-stone-900">
                  Request Mentorship with {isPairingRequestModalOpen.name}
                </h2>
              </div>
              <button
                onClick={() => setIsPairingRequestModalOpen(null)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendPairingRequest} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Primary Life Sphere for Guidance *</label>
                <select
                  value={pairingSphere}
                  onChange={(e) => setPairingSphere(e.target.value as LifeSphere)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                >
                  <option value="PERSONAL_GROWTH">Personal Growth & Secret Place Prayer</option>
                  <option value="ACADEMIA_CAREER">Academia & Workplace Ethics</option>
                  <option value="RELATIONSHIPS">Relationships, Marriage & Family</option>
                  <option value="FINANCES">Finances & Kingdom Stewardship</option>
                  <option value="PHYSICAL_WELLBEING">Physical Wellbeing & Disciplines</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Introduce Yourself & Your Spiritual Walk *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share a brief overview of where you are in your faith, your salvation story, and what prompted you to seek mentorship..."
                  value={pairingIntro}
                  onChange={(e) => setPairingIntro(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Current Goal or Prayer Burden</label>
                <input
                  type="text"
                  placeholder="e.g., Overcoming career anxiety and establishing morning Word meditation"
                  value={pairingGoal}
                  onChange={(e) => setPairingGoal(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Preferred Meeting Rhythm</label>
                <select
                  value={pairingFrequency}
                  onChange={(e) => setPairingFrequency(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                >
                  <option value="Weekly 1-on-1 In-App Video Calls">Weekly 1-on-1 In-App Video Calls</option>
                  <option value="Bi-weekly 1-on-1 Sessions">Bi-weekly 1-on-1 Sessions</option>
                  <option value="Monthly In-Depth Spiritual Review">Monthly In-Depth Spiritual Review</option>
                </select>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 space-y-1 text-[11px]">
                <span className="font-bold block">Christian Discipleship Commitment:</span>
                <p>
                  By submitting this request, you agree to walk in transparency, respect the elder's time, and faithfully engage in mutual prayer and Scripture reflection.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsPairingRequestModalOpen(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition shadow-sm"
                >
                  Confirm & Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT MY ELDER BIOGRAPHY (mentors only, own profile) */}
      {isEditBioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 my-8 animate-fade-in max-h-[90vh] overflow-y-auto">

            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                    Elder Biography
                  </span>
                  <span className="text-xs text-stone-500">Visible to mentees browsing the directory</span>
                </div>
                <h2 className="text-xl font-bold font-serif-display text-stone-900">
                  Edit My Elder Biography
                </h2>
              </div>
              <button
                onClick={() => setIsEditBioModalOpen(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMyBio} className="space-y-4 text-xs">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Ministry Role / Profession</label>
                  <input
                    type="text"
                    placeholder="e.g., Church Elder & Business Executive"
                    value={bioTitle}
                    onChange={(e) => setBioTitle(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Dallas, TX (Remote OK)"
                    value={bioLocation}
                    onChange={(e) => setBioLocation(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Years Walking in Faith</label>
                  <input
                    type="number"
                    value={bioYearsInFaith}
                    onChange={(e) => setBioYearsInFaith(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Church Fellowship</label>
                  <input
                    type="text"
                    placeholder="e.g., Grace Community Church"
                    value={bioChurch}
                    onChange={(e) => setBioChurch(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Short Bio (Card Overview) *</label>
                <input
                  type="text"
                  required
                  placeholder="A concise summary of your faith journey and passions..."
                  value={bioShort}
                  onChange={(e) => setBioShort(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Full Biography & Faith Testimony</label>
                <textarea
                  rows={4}
                  placeholder="Share your detailed life testimony: how God called you, career trials, marriage/family wisdom, and why you feel burdened to disciple young believers..."
                  value={bioFull}
                  onChange={(e) => setBioFull(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Discipleship Philosophy</label>
                  <input
                    type="text"
                    placeholder="e.g., 2 Timothy 2:2 life-on-life biblical mentoring"
                    value={bioPhilosophy}
                    onChange={(e) => setBioPhilosophy(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Availability & Meeting Schedule</label>
                  <input
                    type="text"
                    placeholder="e.g., Tuesdays & Thursdays 6-8 PM EST"
                    value={bioAvailability}
                    onChange={(e) => setBioAvailability(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Favorite Scripture Anchor</label>
                <input
                  type="text"
                  placeholder="e.g., Romans 12:1-2"
                  value={bioScripture}
                  onChange={(e) => setBioScripture(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Ministry Journey</label>
                <textarea
                  rows={3}
                  placeholder="Highlights of your ministry track record..."
                  value={bioMinistryJourney}
                  onChange={(e) => setBioMinistryJourney(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsEditBioModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold transition shadow-sm"
                >
                  Save Biography
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
