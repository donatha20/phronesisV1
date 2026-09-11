import React, { useState } from 'react';
import { 
  FolderOpen, BookOpen, Bookmark, Download, Star, 
  Search, Filter, ExternalLink, FileText, CheckCircle2, 
  PlusCircle, ShieldCheck, Lock, Unlock, Users, Share2, 
  Layers, ChevronRight, X, Sparkles, Check, Clock, UserCheck
} from 'lucide-react';
import { ResourceItem, LifeSphere, ResourceType, ResourceAccessTier, UserProfile } from '../types';

interface ResourceLibraryViewProps {
  resources: ResourceItem[];
  currentUser: UserProfile;
  enrolledResourceIds: string[];
  onToggleBookmark: (id: string) => void;
  onAddNewResource: (newRes: ResourceItem, file?: File) => void;
  onEnrollResource: (resourceId: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const ResourceLibraryView: React.FC<ResourceLibraryViewProps> = ({
  resources,
  currentUser,
  enrolledResourceIds,
  onToggleBookmark,
  onAddNewResource,
  onEnrollResource
}) => {
  const [selectedSphere, setSelectedSphere] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'EXPLORE' | 'UPHOLDER_MANAGER' | 'MY_ENROLLED'>('EXPLORE');

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedResourceForView, setSelectedResourceForView] = useState<ResourceItem | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  // Upload Form State
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState(currentUser.name);
  const [newSphere, setNewSphere] = useState<LifeSphere>('PERSONAL_GROWTH');
  const [newType, setNewType] = useState<ResourceType>('PDF_GUIDE');
  const [newAccessTier, setNewAccessTier] = useState<ResourceAccessTier>('OPEN_PUBLIC');
  const [newReadTime, setNewReadTime] = useState('30 pages (PDF)');
  const [newDescription, setNewDescription] = useState('');
  const [newScriptures, setNewScriptures] = useState('Colossians 3:1-17, 2 Timothy 3:16-17');
  const [newChapterInput, setNewChapterInput] = useState('');
  const [chaptersList, setChaptersList] = useState<string[]>([
    'Module 1: Foundations & Theological Anchor',
    'Module 2: Practical Spiritual Habits & Secret Place',
    'Module 3: Overcoming Impediments & Accountability'
  ]);
  const [newFile, setNewFile] = useState<File | null>(null);

  const handleAddChapter = () => {
    if (!newChapterInput.trim()) return;
    setChaptersList([...chaptersList, newChapterInput.trim()]);
    setNewChapterInput('');
  };

  const handleRemoveChapter = (index: number) => {
    setChaptersList(chaptersList.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const createdResource: ResourceItem = {
      id: `res_${Date.now()}`,
      title: newTitle,
      author: newAuthor,
      type: newType,
      sphere: newSphere,
      description: newDescription,
      readTime: newReadTime,
      isBookmarked: false,
      rating: 0, // no rating feature exists yet — matches the server's default until one does
      accessTier: newAccessTier,
      fileSize: newFile ? formatFileSize(newFile.size) : 'External link',
      enrolledUsersCount: 1,
      uploadedBy: `${currentUser.name} (${currentUser.role === 'MENTOR_ELDER' ? 'Elder' : 'Curriculum Lead'})`,
      uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      keyScriptureAnchors: newScriptures.split(',').map(s => s.trim()).filter(Boolean),
      syllabusChapters: chaptersList.length > 0 ? chaptersList : ['Module 1: Comprehensive Discipleship Overview']
    };

    // The uploader is auto-enrolled server-side once the resource is created
    // (see App.tsx's onAddNewResource) — the id here is client-local and not
    // the real server id, so we don't call onEnrollResource with it.
    onAddNewResource(createdResource, newFile ?? undefined);
    setIsUploadModalOpen(false);

    // Reset fields
    setNewTitle('');
    setNewDescription('');
    setNewReadTime('30 pages (PDF)');
    setNewFile(null);
  };

  const handleCopyInviteLink = (resId: string, title: string) => {
    const link = `https://phronesis.faith/curriculum/enroll/${resId}`;
    navigator.clipboard?.writeText?.(link);
    setCopyFeedback(title);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const handleSimulateDownload = (res: ResourceItem) => {
    setDownloadSuccessToast(`"${res.title}" downloaded to your local study vault!`);
    setTimeout(() => setDownloadSuccessToast(null), 4000);
  };

  const filtered = resources.filter(res => {
    const matchesSphere = selectedSphere === 'ALL' || res.sphere === selectedSphere;
    const matchesTier = selectedTier === 'ALL' || res.accessTier === selectedTier;
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'MY_ENROLLED') {
      return enrolledResourceIds.includes(res.id) && matchesSphere && matchesSearch;
    }
    return matchesSphere && matchesTier && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Toast Banner */}
      {downloadSuccessToast && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-semibold">{downloadSuccessToast}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5" /> Discipleship Curricula & Materials
            </span>
            <span className="text-xs text-stone-500">Material Upholder & Library Portal</span>
          </div>
          <h1 className="text-2xl font-bold font-serif-display text-stone-900">
            Curriculum Syllabi & Study Workbooks
          </h1>
          <p className="text-xs text-stone-600 max-w-2xl">
            As a material upholder, publish official discipleship syllabi, manage access levels, and enable church elders and young believers to enroll in guided study cohorts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm shadow-amber-950/20 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" /> Upload Material / Syllabus
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-3">
        <div className="flex bg-stone-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('EXPLORE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'EXPLORE' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Curricula ({resources.length})
          </button>
          <button
            onClick={() => setActiveTab('MY_ENROLLED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'MY_ENROLLED' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            My Enrolled Materials ({enrolledResourceIds.length})
          </button>
          <button
            onClick={() => setActiveTab('UPHOLDER_MANAGER')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'UPHOLDER_MANAGER' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Upholder Permissions Manager
          </button>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Sphere Pills */}
          <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
            {['ALL', 'PERSONAL_GROWTH', 'FINANCES', 'RELATIONSHIPS', 'ACADEMIA_CAREER'].map((sp) => (
              <button
                key={sp}
                onClick={() => setSelectedSphere(sp)}
                className={`px-2.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition text-xs ${
                  selectedSphere === sp
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {sp === 'ALL' ? 'All Spheres' : sp.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search syllabus, author, topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
            />
          </div>
        </div>
      </div>

      {/* VIEW 1: UPHOLDER PERMISSIONS & ENROLLMENT MANAGER */}
      {activeTab === 'UPHOLDER_MANAGER' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-lg font-bold font-serif-display text-stone-900">
                Material Upholder & Sign-Up Access Dashboard
              </h2>
              <p className="text-xs text-stone-500">
                Control who can sign up, access study syllabi, and receive automatic discipleship cohort invites.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Direct Upholder Privileges Active
              </span>
            </div>
          </div>

          {/* Quick Access Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-stone-400">Total Materials Maintained</span>
              <div className="text-2xl font-bold font-mono text-stone-900">{resources.length} Guides</div>
              <p className="text-[11px] text-stone-500">Curricula published across 5 spheres</p>
            </div>
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-800">Total Active Enrollments</span>
              <div className="text-2xl font-bold font-mono text-amber-900">
                {resources.reduce((acc, r) => acc + (r.enrolledUsersCount || 12), 0)} Believers
              </div>
              <p className="text-[11px] text-amber-800/80">Disciples & Elders in active study</p>
            </div>
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-stone-400">Sign-Up Tier Policy</span>
              <div className="text-base font-bold text-stone-800">Open Sign-Up & Cohort Pairing</div>
              <p className="text-[11px] text-stone-500">Anyone registered can request syllabus</p>
            </div>
          </div>

          {/* Table of Material Access Tiers */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 uppercase font-bold text-[10px]">
                  <th className="py-3 px-4">Material Title & Sphere</th>
                  <th className="py-3 px-4">Author / Upholder</th>
                  <th className="py-3 px-4">Access Tier</th>
                  <th className="py-3 px-4">Enrolled Disciples</th>
                  <th className="py-3 px-4">Sign-Up Invitation Link</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {resources.map((res) => (
                  <tr key={res.id} className="hover:bg-stone-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-stone-900">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <div>{res.title}</div>
                          <span className="text-[10px] text-stone-400 font-normal">{res.sphere.replace('_', ' ')} • {res.readTime}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-medium">{res.author}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        res.accessTier === 'OPEN_PUBLIC'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : res.accessTier === 'ELDERS_ONLY'
                          ? 'bg-purple-50 text-purple-800 border border-purple-200'
                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                      }`}>
                        {res.accessTier ? res.accessTier.replace('_', ' ') : 'OPEN ACCESS'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-800">
                      {res.enrolledUsersCount || 45} Members
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleCopyInviteLink(res.id, res.title)}
                        className="flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 transition"
                      >
                        <Share2 className="w-3 h-3" />
                        {copyFeedback === res.title ? 'Copied Link!' : 'Copy Sign-Up Link'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedResourceForView(res)}
                        className="px-3 py-1 rounded-lg bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition"
                      >
                        Inspect Syllabus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2 & 3: GRID OF MATERIALS */}
      {activeTab !== 'UPHOLDER_MANAGER' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full py-16 text-center space-y-3 bg-white rounded-3xl border border-dashed border-stone-300">
              <FolderOpen className="w-10 h-10 text-stone-400 mx-auto" />
              <div className="text-base font-bold text-stone-800">No study materials match your search</div>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try switching the Life Sphere category filter or upload a new curriculum workbook as a material upholder.
              </p>
            </div>
          ) : (
            filtered.map((res) => {
              const isEnrolled = enrolledResourceIds.includes(res.id);

              return (
                <div
                  key={res.id}
                  className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition group"
                >
                  <div className="space-y-3">
                    {/* Header tags */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          {res.type.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          res.accessTier === 'OPEN_PUBLIC'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : res.accessTier === 'ELDERS_ONLY'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {res.accessTier ? res.accessTier.replace('_', ' ') : 'OPEN ACCESS'}
                        </span>
                      </div>
                      <span className="text-xs text-stone-500 font-mono">{res.readTime}</span>
                    </div>

                    {/* Title and Author */}
                    <div className="space-y-1">
                      <h3 
                        onClick={() => setSelectedResourceForView(res)}
                        className="text-base font-bold font-serif-display text-stone-900 leading-snug group-hover:text-amber-700 transition cursor-pointer"
                      >
                        {res.title}
                      </h3>
                      <p className="text-xs text-stone-500">
                        Authored by <strong className="text-stone-700">{res.author}</strong>
                      </p>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                      {res.description}
                    </p>

                    {/* Syllabus chapters preview */}
                    {res.syllabusChapters && res.syllabusChapters.length > 0 && (
                      <div className="bg-stone-50 rounded-2xl p-3 border border-stone-100 text-xs space-y-1.5">
                        <div className="text-[10px] font-bold uppercase text-stone-400 flex items-center justify-between">
                          <span>Syllabus ({res.syllabusChapters.length} Modules)</span>
                          <span className="text-amber-700 cursor-pointer" onClick={() => setSelectedResourceForView(res)}>View All</span>
                        </div>
                        <div className="text-[11px] text-stone-700 truncate flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="truncate">{res.syllabusChapters[0]}</span>
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                      <div className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{res.rating} / 5.0</span>
                      </div>
                      <div className="flex items-center gap-1 text-stone-500">
                        <Users className="w-3 h-3" />
                        <span>{res.enrolledUsersCount || 48} Enrolled</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onToggleBookmark(res.id)}
                      className={`p-2.5 rounded-xl text-xs transition ${
                        res.isBookmarked ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                      title={res.isBookmarked ? 'Bookmarked' : 'Bookmark Material'}
                    >
                      <Bookmark className={`w-4 h-4 ${res.isBookmarked ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => setSelectedResourceForView(res)}
                      className="px-3 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Layers className="w-3.5 h-3.5" /> Syllabus
                    </button>

                    {isEnrolled ? (
                      <button
                        onClick={() => handleSimulateDownload(res)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-200" /> Download PDF
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onEnrollResource(res.id);
                          handleSimulateDownload(res);
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-amber-950/20"
                      >
                        <Unlock className="w-3.5 h-3.5" /> Sign Up / Access
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL 1: UPLOAD MATERIAL / DISCIPLESHIP SYLLABUS */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 my-8 animate-fade-in max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                    Material Upholder Portal
                  </span>
                  <span className="text-xs text-stone-500">Publish Discipleship Curriculum</span>
                </div>
                <h2 className="text-xl font-bold font-serif-display text-stone-900">
                  Upload Discipleship Guide & Study Material
                </h2>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-5 text-xs">
              
              {/* Title & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Curriculum Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Foundations of Christian Marketplace Ethics"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Author / Upholder Elder *</label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Sphere & Material Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Primary Life Sphere</label>
                  <select
                    value={newSphere}
                    onChange={(e) => setNewSphere(e.target.value as LifeSphere)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                  >
                    <option value="PERSONAL_GROWTH">Personal Growth & Prayer</option>
                    <option value="ACADEMIA_CAREER">Academia & Career</option>
                    <option value="RELATIONSHIPS">Relationships & Family</option>
                    <option value="FINANCES">Finances & Stewardship</option>
                    <option value="PHYSICAL_WELLBEING">Physical Wellbeing</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Material Format</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ResourceType)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                  >
                    <option value="PDF_GUIDE">PDF Study Guide / Syllabus</option>
                    <option value="STUDY_SERIES">Multi-Week Interactive Series</option>
                    <option value="SERMON_TRANSCRIPT">Sermon Transcript & Notes</option>
                    <option value="BOOK_RECOMMENDATION">Book Recommendation & Review</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Access Tier (Permissions)</label>
                  <select
                    value={newAccessTier}
                    onChange={(e) => setNewAccessTier(e.target.value as ResourceAccessTier)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                  >
                    <option value="OPEN_PUBLIC">Open Public Access</option>
                    <option value="REGISTERED_DISCIPLES">Registered Disciples Only</option>
                    <option value="ELDERS_ONLY">Elders & Mentors Only</option>
                    <option value="ENROLLED_COHORT">Enrolled Cohort Only</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Description & Discipleship Objectives *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain the theological foundation, target audience, and spiritual milestones of this material..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Attach File (PDF, DOCX, audio...)</label>
                <input
                  type="file"
                  onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
                  className="w-full text-stone-700 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:bg-amber-600 file:text-white file:font-bold file:text-xs hover:file:bg-amber-500 bg-stone-50 border border-stone-200 rounded-xl"
                />
                {newFile && (
                  <p className="text-[11px] text-stone-500">
                    {newFile.name} • {formatFileSize(newFile.size)}
                  </p>
                )}
              </div>

              {/* Scripture Anchors & Study Length */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Key Scripture Anchors (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g., Romans 12:1-2, Psalm 119:105"
                    value={newScriptures}
                    onChange={(e) => setNewScriptures(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Study Duration / Page Count</label>
                  <input
                    type="text"
                    placeholder="e.g., 8-Week Study (42 pages PDF)"
                    value={newReadTime}
                    onChange={(e) => setNewReadTime(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Syllabus Chapter Builder */}
              <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <label className="font-bold text-stone-800 block">Curriculum Syllabus Modules</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {chaptersList.map((ch, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-stone-200 text-xs">
                      <span className="text-stone-800 font-medium truncate">{ch}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveChapter(idx)}
                        className="text-stone-400 hover:text-red-600 font-bold ml-2 shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add module (e.g., Week 4: The Secret Place & Fasting)"
                    value={newChapterInput}
                    onChange={(e) => setNewChapterInput(e.target.value)}
                    className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddChapter}
                    className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-xs"
                  >
                    Add Module
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition shadow-sm shadow-amber-950/20"
                >
                  Publish Material to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DETAILED SYLLABUS & INSPECT MATERIAL */}
      {selectedResourceForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 my-8 animate-fade-in">
            
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                    {selectedResourceForView.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-stone-500 font-mono">{selectedResourceForView.readTime}</span>
                </div>
                <h2 className="text-xl font-bold font-serif-display text-stone-900">
                  {selectedResourceForView.title}
                </h2>
                <p className="text-xs text-stone-600">
                  Authored & Upholding by <strong className="text-stone-800">{selectedResourceForView.author}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedResourceForView(null)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Overview</span>
                <p className="text-stone-700 leading-relaxed text-sm">
                  {selectedResourceForView.description}
                </p>
              </div>

              {/* Key Scripture Anchors */}
              {selectedResourceForView.keyScriptureAnchors && (
                <div className="space-y-1.5 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                    Scriptural Grounding & Memory Verses
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedResourceForView.keyScriptureAnchors.map((sc, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white text-amber-900 font-bold border border-amber-200 text-xs">
                        {sc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Syllabus Modules */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Curriculum Syllabus & Progression
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">
                    {selectedResourceForView.fileSize || '3.5 MB'}
                  </span>
                </div>
                <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200 max-h-56 overflow-y-auto">
                  {(selectedResourceForView.syllabusChapters || [
                    'Module 1: Personal Devotion & Biblical Anchor',
                    'Module 2: Walking with Integrity in Everyday Life',
                    'Module 3: Discipleship Multiplying & Community Prayer'
                  ]).map((chapter, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-stone-200">
                      <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {i + 1}
                      </div>
                      <span className="text-stone-800 font-medium leading-tight">{chapter}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-stone-100">
              <button
                onClick={() => handleCopyInviteLink(selectedResourceForView.id, selectedResourceForView.title)}
                className="px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copyFeedback === selectedResourceForView.title ? 'Copied Link!' : 'Share Study Link'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onEnrollResource(selectedResourceForView.id);
                    handleSimulateDownload(selectedResourceForView);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  {enrolledResourceIds.includes(selectedResourceForView.id) ? 'Download Workbook PDF' : 'Enroll & Download Syllabus'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
