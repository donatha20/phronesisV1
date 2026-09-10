import React, { useState, useEffect } from 'react';
import { 
  Folder, FileText, Upload, RefreshCw, Plus, Search, Filter, 
  ExternalLink, Trash2, CheckCircle2, AlertCircle, HardDrive, 
  ShieldCheck, ArrowRight, Download, BookOpen, Lock, Sparkles,
  Layers, Video, Check, X, FileSpreadsheet, Presentation, Music
} from 'lucide-react';
import { UserProfile, DiscipleshipSession, GoalItem, ResourceItem, PrayerRequest } from '../types';
import { 
  signInWithGoogleDrive, 
  googleLogout, 
  getAccessToken, 
  getCurrentGoogleUser,
  initAuth 
} from '../services/googleAuth';
import { 
  listGoogleDriveFiles, 
  createGoogleDriveFolder, 
  uploadToGoogleDrive, 
  deleteGoogleDriveFile, 
  exportSessionToDrive, 
  exportGoalsPlanToDrive, 
  GoogleDriveFile, 
  formatBytes 
} from '../services/googleDriveService';

interface GoogleDriveViewProps {
  currentUser: UserProfile;
  sessions: DiscipleshipSession[];
  goals: GoalItem[];
  prayers: PrayerRequest[];
  onImportResourceToLibrary: (resource: ResourceItem) => void;
}

export const GoogleDriveView: React.FC<GoogleDriveViewProps> = ({
  currentUser,
  sessions,
  goals,
  prayers,
  onImportResourceToLibrary
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isFetchingFiles, setIsFetchingFiles] = useState(false);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mimeFilter, setMimeFilter] = useState<'ALL' | 'DOCS' | 'PDFS' | 'SHEETS' | 'SLIDES' | 'FOLDERS' | 'AUDIO'>('ALL');
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [folderBreadcrumbs, setFolderBreadcrumbs] = useState<Array<{ id: string; name: string }>>([
    { id: '', name: 'My Drive' }
  ]);

  // Status & Toasts
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<GoogleDriveFile | null>(null);
  const [fileToDelete, setFileToDelete] = useState<GoogleDriveFile | null>(null);

  // Upload state
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState<'text/plain' | 'application/pdf'>('text/plain');
  const [uploadFileContent, setUploadFileContent] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Create folder state
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Import to Library Form state
  const [importTitle, setImportTitle] = useState('');
  const [importSphere, setImportSphere] = useState<string>('PERSONAL_GROWTH');
  const [importAccessTier, setImportAccessTier] = useState<string>('OPEN_PUBLIC');
  const [importDescription, setImportDescription] = useState('');

  // Quick export loading states
  const [isExportingSession, setIsExportingSession] = useState<string | null>(null);
  const [isExportingPlan, setIsExportingPlan] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Listen to Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        fetchFiles(token);
      },
      () => {
        // Fallback check in memory
        getAccessToken().then(token => {
          if (token) {
            setAccessToken(token);
            setGoogleUser(getCurrentGoogleUser());
            fetchFiles(token);
          }
        });
      }
    );

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoadingAuth(true);
    try {
      const authResult = await signInWithGoogleDrive();
      if (authResult) {
        setAccessToken(authResult.accessToken);
        setGoogleUser(authResult.user);
        showToast(`Connected to Google Drive as ${authResult.user.displayName || authResult.user.email}!`);
        fetchFiles(authResult.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to sign in with Google.', 'error');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await googleLogout();
    setAccessToken(null);
    setGoogleUser(null);
    setFiles([]);
    showToast('Signed out of Google Drive.');
  };

  const fetchFiles = async (token?: string, folderId?: string) => {
    const activeToken = token || accessToken;
    if (!activeToken) return;

    setIsFetchingFiles(true);
    try {
      const response = await listGoogleDriveFiles(activeToken, {
        folderId: folderId ?? currentFolderId,
        searchQuery,
        mimeTypeFilter: mimeFilter
      });
      setFiles(response.files || []);
    } catch (err: any) {
      console.error(err);
      showToast('Error loading files from Google Drive: ' + err.message, 'error');
    } finally {
      setIsFetchingFiles(false);
    }
  };

  const handleNavigateToFolder = (folder: GoogleDriveFile) => {
    setCurrentFolderId(folder.id);
    setFolderBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
    fetchFiles(accessToken || undefined, folder.id);
  };

  const handleBreadcrumbClick = (index: number) => {
    const target = folderBreadcrumbs[index];
    const newBreadcrumbs = folderBreadcrumbs.slice(0, index + 1);
    setFolderBreadcrumbs(newBreadcrumbs);
    const newFolderId = target.id || undefined;
    setCurrentFolderId(newFolderId);
    fetchFiles(accessToken || undefined, newFolderId);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newFolderName.trim()) return;

    setIsCreatingFolder(true);
    try {
      await createGoogleDriveFolder(accessToken, newFolderName.trim(), currentFolderId);
      setNewFolderName('');
      setIsCreateFolderModalOpen(false);
      showToast(`Folder "${newFolderName}" created successfully in Google Drive!`);
      fetchFiles();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !uploadFileName.trim()) return;

    setIsUploading(true);
    try {
      await uploadToGoogleDrive(accessToken, {
        fileName: uploadFileName.endsWith('.txt') ? uploadFileName : `${uploadFileName}.txt`,
        mimeType: uploadFileType,
        content: uploadFileContent,
        parentFolderId: currentFolderId,
        description: uploadDescription
      });

      setIsUploadModalOpen(false);
      setUploadFileName('');
      setUploadFileContent('');
      setUploadDescription('');
      showToast(`File "${uploadFileName}" uploaded to Google Drive!`);
      fetchFiles();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDeleteFile = async () => {
    if (!accessToken || !fileToDelete) return;

    try {
      await deleteGoogleDriveFile(accessToken, fileToDelete.id);
      showToast(`"${fileToDelete.name}" was permanently removed from Google Drive.`);
      setFileToDelete(null);
      fetchFiles();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleExportSession = async (session: DiscipleshipSession) => {
    if (!accessToken) {
      showToast('Please sign in to Google Drive first to export minutes.', 'error');
      return;
    }

    setIsExportingSession(session.id);
    try {
      const exportedFile = await exportSessionToDrive(accessToken, session, currentFolderId);
      showToast(`Session notes for "${session.topic}" saved to Google Drive!`);
      fetchFiles();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsExportingSession(null);
    }
  };

  const handleExportGrowthPlan = async () => {
    if (!accessToken) {
      showToast('Please sign in to Google Drive first.', 'error');
      return;
    }

    setIsExportingPlan(true);
    try {
      await exportGoalsPlanToDrive(accessToken, currentUser.name, goals, currentFolderId);
      showToast(`5 Life Spheres discipleship action plan saved to Google Drive!`);
      fetchFiles();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsExportingPlan(false);
    }
  };

  const handleConfirmImportToLibrary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isImportModalOpen) return;

    const importedResource: ResourceItem = {
      id: `drive_${isImportModalOpen.id}`,
      title: importTitle || isImportModalOpen.name,
      author: currentUser.name,
      type: isImportModalOpen.mimeType.includes('pdf') ? 'PDF_GUIDE' : 'STUDY_SERIES',
      sphere: importSphere as any,
      description: importDescription || `Imported from Google Drive: ${isImportModalOpen.name}`,
      readTime: '15 min study',
      downloadUrl: isImportModalOpen.webViewLink || '#',
      isBookmarked: false,
      rating: 5.0,
      accessTier: importAccessTier as any,
      fileSize: formatBytes(isImportModalOpen.size),
      uploadedBy: currentUser.name,
      uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      keyScriptureAnchors: ['2 Timothy 2:2', 'Proverbs 4:7']
    };

    onImportResourceToLibrary(importedResource);
    setIsImportModalOpen(null);
    showToast(`"${importedResource.title}" was published to Phronesis Resource Library!`);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') return <Folder className="w-5 h-5 text-amber-500 fill-amber-100" />;
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (mimeType.includes('document') || mimeType.includes('text')) return <FileText className="w-5 h-5 text-blue-500" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    if (mimeType.includes('presentation')) return <Presentation className="w-5 h-5 text-amber-600" />;
    if (mimeType.includes('audio')) return <Music className="w-5 h-5 text-purple-500" />;
    return <FileText className="w-5 h-5 text-stone-500" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 animate-bounce ${
          toastMessage.type === 'error' ? 'bg-red-900 text-white border-red-500' : 'bg-stone-900 text-white border-amber-500/40'
        }`}>
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Main Header / Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" /> Google Drive Cloud Discipleship Sync
            </span>
            <span className="text-xs text-stone-500 font-medium">Official Cloud Storage Integration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-display text-stone-900">
            Google Drive Discipleship Storage & Library Hub
          </h1>
          <p className="text-xs text-stone-600 leading-relaxed">
            Directly connect your Google Drive to sync study guides, backup discipleship session minutes, export 5 Life Spheres action plans, and import study curricula into the Phronesis Library.
          </p>
        </div>

        {/* Authentication Controls */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 shrink-0 space-y-3 min-w-[280px]">
          {accessToken && googleUser ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {googleUser.photoURL ? (
                  <img 
                    src={googleUser.photoURL} 
                    alt={googleUser.displayName || 'Google Account'} 
                    className="w-10 h-10 rounded-full border border-amber-500/40"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                    {googleUser.displayName?.charAt(0) || 'G'}
                  </div>
                )}
                <div className="truncate">
                  <div className="font-bold text-xs text-stone-900 truncate">
                    {googleUser.displayName || 'Connected Account'}
                  </div>
                  <div className="text-[10px] text-stone-500 truncate">{googleUser.email}</div>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Drive Connected
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => fetchFiles()}
                  disabled={isFetchingFiles}
                  className="flex-1 py-2 px-3 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingFiles ? 'animate-spin' : ''}`} /> Refresh
                </button>

                <button
                  onClick={handleGoogleSignOut}
                  className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-600 text-xs font-bold transition"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 text-center">
              <p className="text-[11px] text-stone-600 font-medium">
                Connect your Google Account to access and save files to Google Drive.
              </p>
              
              {/* Official Google Sign In Button Styling */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoadingAuth}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-stone-50 text-stone-700 font-semibold border border-stone-300 px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition text-xs active:scale-98"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span>{isLoadingAuth ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Discipleship Export & Cloud Sync Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Session Minutes Sync */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Video className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 pt-1">Backup Session Minutes</h3>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Export latest 1-on-1 discipleship session covenants, action items, and prayers to Google Drive.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-stone-100">
            {sessions.slice(0, 2).map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2 text-xs bg-stone-50 p-2 rounded-xl">
                <div className="truncate">
                  <div className="font-bold text-stone-800 truncate">{s.topic}</div>
                  <div className="text-[10px] text-stone-500">{s.scheduledTime}</div>
                </div>
                <button
                  onClick={() => handleExportSession(s)}
                  disabled={isExportingSession === s.id}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] whitespace-nowrap transition"
                >
                  {isExportingSession === s.id ? 'Saving...' : 'Export'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: 5 Life Spheres Discipleship Plan */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 pt-1">Export 5 Life Spheres Growth Plan</h3>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Save your current spiritual goals, milestones, scripture anchors, and mentor review feedback.
            </p>
          </div>

          <div className="pt-2 border-t border-stone-100">
            <button
              onClick={handleExportGrowthPlan}
              disabled={isExportingPlan}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              {isExportingPlan ? 'Exporting Plan to Drive...' : 'Export Full Discipleship Plan'}
            </button>
          </div>
        </div>

        {/* Card 3: Upload Discipleship PDF/Notes */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 pt-1">Upload New Study Notes / PDF</h3>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Save new Bible study guides, sermon transcripts, or discipleship reflections straight into Google Drive.
            </p>
          </div>

          <div className="pt-2 border-t border-stone-100 flex gap-2">
            <button
              onClick={() => setIsCreateFolderModalOpen(true)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Folder className="w-3.5 h-3.5 text-amber-600" /> New Folder
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm shadow-amber-950/20"
            >
              <Plus className="w-3.5 h-3.5" /> Upload File
            </button>
          </div>
        </div>

      </div>

      {/* Google Drive File Explorer */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-5">
        
        {/* Top Explorer Filter & Search */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 text-xs text-stone-600 overflow-x-auto">
            {folderBreadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-stone-300">/</span>}
                <button
                  onClick={() => handleBreadcrumbClick(idx)}
                  className={`font-semibold hover:text-amber-700 transition px-1.5 py-0.5 rounded-lg ${
                    idx === folderBreadcrumbs.length - 1 ? 'text-amber-900 bg-amber-50 font-bold' : ''
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            
            {/* Filter Pills */}
            <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
              {(['ALL', 'DOCS', 'PDFS', 'SHEETS', 'SLIDES', 'FOLDERS', 'AUDIO'] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => {
                    setMimeFilter(filterType);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition text-xs ${
                    mimeFilter === filterType
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {filterType}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Google Drive files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchFiles();
                }}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

        </div>

        {/* File List / State View */}
        {!accessToken ? (
          <div className="text-center py-16 space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-800 mx-auto flex items-center justify-center">
              <HardDrive className="w-8 h-8 text-amber-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-stone-900">Sign in to Access Google Drive</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Connect your Google Account to browse, upload, and link discipleship materials directly with Phronesis.
              </p>
            </div>
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoadingAuth}
              className="inline-flex items-center gap-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md shadow-amber-950/20 transition"
            >
              <span>Connect Google Drive</span>
            </button>
          </div>
        ) : isFetchingFiles ? (
          <div className="text-center py-16 space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-stone-600">Retrieving files from Google Drive...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Folder className="w-12 h-12 text-stone-300 mx-auto" />
            <p className="text-xs font-semibold text-stone-600">No files found matching your search.</p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 underline"
            >
              Upload your first study note to Google Drive
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => {
              const isFolder = file.mimeType === 'application/vnd.google-apps.folder';

              return (
                <div
                  key={file.id}
                  className="bg-stone-50 hover:bg-white p-4 rounded-2xl border border-stone-200 hover:border-amber-400 hover:shadow-md transition flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="p-2 rounded-xl bg-white border border-stone-200 shrink-0">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <div className="truncate">
                          {isFolder ? (
                            <button
                              onClick={() => handleNavigateToFolder(file)}
                              className="font-bold text-xs text-stone-900 hover:text-amber-700 text-left truncate block"
                            >
                              {file.name}
                            </button>
                          ) : (
                            <div className="font-bold text-xs text-stone-900 truncate" title={file.name}>
                              {file.name}
                            </div>
                          )}
                          <div className="text-[10px] text-stone-400">
                            {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'Recent'} • {isFolder ? 'Folder' : formatBytes(file.size)}
                          </div>
                        </div>
                      </div>

                      {/* Delete File Button */}
                      <button
                        onClick={() => setFileToDelete(file)}
                        title="Delete file from Google Drive"
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {file.description && (
                      <p className="text-[11px] text-stone-500 line-clamp-2 italic">
                        "{file.description}"
                      </p>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-2 text-xs">
                    {isFolder ? (
                      <button
                        onClick={() => handleNavigateToFolder(file)}
                        className="w-full py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] flex items-center justify-center gap-1 transition"
                      >
                        Open Folder <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setIsImportModalOpen(file);
                            setImportTitle(file.name.replace(/\.[^/.]+$/, ''));
                            setImportDescription(file.description || `Study material linked from Google Drive: ${file.name}`);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
                        >
                          <BookOpen className="w-3 h-3 text-amber-400" /> Link to Library
                        </button>

                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-amber-700 hover:border-amber-300 transition"
                            title="Open in Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL 1: CREATE GOOGLE DRIVE FOLDER */}
      {isCreateFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-stone-200 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-stone-900">Create New Folder in Google Drive</h2>
              </div>
              <button
                onClick={() => setIsCreateFolderModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Folder Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Discipleship Study Series 2026"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreateFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingFolder}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition"
                >
                  {isCreatingFolder ? 'Creating...' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPLOAD STUDY NOTES TO GOOGLE DRIVE */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-stone-200 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-stone-900">Upload Discipleship Notes to Drive</h2>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadFile} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Document Title / File Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Philippians_Chapter_4_Study_Notes"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Description / Discipleship Context</label>
                <input
                  type="text"
                  placeholder="e.g., Prepared for Mentee weekly study on godly contentment"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Content / Study Notes Body *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Paste or write your discipleship study outline, biblical commentary, reflection questions..."
                  value={uploadFileContent}
                  onChange={(e) => setUploadFileContent(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition"
                >
                  {isUploading ? 'Uploading to Drive...' : 'Save to Google Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: IMPORT GOOGLE DRIVE FILE INTO PHRONESIS RESOURCE LIBRARY */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-stone-200 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Curriculum Publisher
                </span>
                <h2 className="text-base font-bold text-stone-900">
                  Publish Google Drive Document to Library
                </h2>
              </div>
              <button
                onClick={() => setIsImportModalOpen(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmImportToLibrary} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Library Resource Title *</label>
                <input
                  type="text"
                  required
                  value={importTitle}
                  onChange={(e) => setImportTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Primary Life Sphere</label>
                  <select
                    value={importSphere}
                    onChange={(e) => setImportSphere(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                  >
                    <option value="PERSONAL_GROWTH">Personal Growth</option>
                    <option value="ACADEMIA_CAREER">Academia & Career</option>
                    <option value="RELATIONSHIPS">Relationships & Family</option>
                    <option value="FINANCES">Finances & Stewardship</option>
                    <option value="PHYSICAL_WELLBEING">Physical Wellbeing</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Access Tier</label>
                  <select
                    value={importAccessTier}
                    onChange={(e) => setImportAccessTier(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                  >
                    <option value="OPEN_PUBLIC">Open Public Access</option>
                    <option value="REGISTERED_DISCIPLES">Registered Disciples Only</option>
                    <option value="ELDERS_ONLY">Elders & Mentors Only</option>
                    <option value="ENROLLED_COHORT">Enrolled Cohort Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Curriculum Synopsis</label>
                <textarea
                  rows={3}
                  value={importDescription}
                  onChange={(e) => setImportDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                <span>The Google Drive direct viewer link will be attached for all readers.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition"
                >
                  Publish to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY CONFIRMATION DIALOG FOR DESTRUCTIVE OPERATIONS (DELETE FILE) */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-fade-in">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Delete File from Google Drive?</h3>
                <p className="text-[11px] text-stone-500">Explicit confirmation required</p>
              </div>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs text-stone-700 space-y-1">
              <span className="font-bold block text-stone-900">{fileToDelete.name}</span>
              <p className="text-[11px] text-stone-500">
                This will permanently delete this item from your Google Drive. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteFile}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
