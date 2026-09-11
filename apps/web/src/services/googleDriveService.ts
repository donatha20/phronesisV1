/**
 * Google Drive access, brokered server-side (phase P5). Every call here hits
 * our Django API, which holds the encrypted refresh token and talks to
 * Google on the user's behalf — the browser never sees a Google access token.
 */
import { apiFetch } from '../lib/api';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  description?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  shared?: boolean;
  owners?: Array<{ displayName: string; emailAddress: string; photoLink?: string }>;
  parents?: string[];
}

export interface DriveFileListResponse {
  files: GoogleDriveFile[];
  nextPageToken?: string;
}

/** List files from the connected user's Google Drive with optional filters. */
export async function listGoogleDriveFiles(options?: {
  folderId?: string;
  searchQuery?: string;
  mimeTypeFilter?: 'ALL' | 'DOCS' | 'PDFS' | 'SHEETS' | 'SLIDES' | 'FOLDERS' | 'AUDIO';
  pageSize?: number;
  pageToken?: string;
}): Promise<DriveFileListResponse> {
  const params = new URLSearchParams();
  if (options?.folderId) params.set('folderId', options.folderId);
  if (options?.searchQuery?.trim()) params.set('search', options.searchQuery.trim());
  if (options?.mimeTypeFilter) params.set('mimeType', options.mimeTypeFilter);
  if (options?.pageSize) params.set('pageSize', String(options.pageSize));
  if (options?.pageToken) params.set('pageToken', options.pageToken);

  return apiFetch<DriveFileListResponse>(`/api/integrations/google/drive/files/?${params.toString()}`);
}

/** Create a new folder in Google Drive. */
export async function createGoogleDriveFolder(
  folderName: string,
  parentFolderId?: string
): Promise<GoogleDriveFile> {
  return apiFetch<GoogleDriveFile>('/api/integrations/google/drive/folders/', {
    method: 'POST',
    json: { name: folderName, parentFolderId },
  });
}

/** Upload text content as a file to Google Drive. */
export async function uploadToGoogleDrive(data: {
  fileName: string;
  mimeType: string;
  content: string;
  parentFolderId?: string;
  description?: string;
}): Promise<GoogleDriveFile> {
  return apiFetch<GoogleDriveFile>('/api/integrations/google/drive/upload/', {
    method: 'POST',
    json: data,
  });
}

/** Delete a file or folder from Google Drive. Caller MUST confirm first. */
export async function deleteGoogleDriveFile(fileId: string): Promise<boolean> {
  await apiFetch<void>(`/api/integrations/google/drive/files/?fileId=${encodeURIComponent(fileId)}`, {
    method: 'DELETE',
  });
  return true;
}

/** Export Discipleship Session Notes to Google Drive. */
export async function exportSessionToDrive(
  session: {
    id: string;
    mentorName: string;
    menteeName: string;
    scheduledTime: string;
    topic: string;
    sphereFocus: string;
    scriptureText: string;
    meetingNotes: string;
    actionItems: string[];
    postSessionPrayer: string;
  },
  folderId?: string
): Promise<GoogleDriveFile> {
  const content = `=====================================================
PHRONESIS DISCIPLESHIP COVENANT & SESSION MINUTES
=====================================================
Date & Time: ${session.scheduledTime}
Elder / Mentor: ${session.mentorName}
Disciple / Mentee: ${session.menteeName}
Life Sphere Focus: ${session.sphereFocus.replace('_', ' ')}
Topic: ${session.topic}

-----------------------------------------------------
SCRIPTURAL FOUNDATION
-----------------------------------------------------
${session.scriptureText}

-----------------------------------------------------
COUNSEL & SESSION NOTES
-----------------------------------------------------
${session.meetingNotes || 'No notes entered.'}

-----------------------------------------------------
ACTION COMMITMENTS & MILESTONES
-----------------------------------------------------
${session.actionItems.map((item, idx) => `[ ] ${idx + 1}. ${item}`).join('\n')}

-----------------------------------------------------
CLOSING INTERCESSION & PRAYER BURDEN
-----------------------------------------------------
${session.postSessionPrayer || 'Amen.'}

=====================================================
Exported from Phronesis Mentorship Platform on ${new Date().toLocaleString()}
=====================================================`;

  const fileName = `Discipleship_Notes_${session.menteeName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;

  return uploadToGoogleDrive({
    fileName,
    mimeType: 'text/plain',
    content,
    parentFolderId: folderId,
    description: `Discipleship meeting notes between ${session.mentorName} and ${session.menteeName}`
  });
}

/** Export 5 Life Spheres Goals & Milestones Action Plan to Google Drive. */
export async function exportGoalsPlanToDrive(
  userName: string,
  goals: Array<{
    title: string;
    sphere: string;
    description: string;
    scriptureAnchor: string;
    targetDate: string;
    progressPercent: number;
    status: string;
    milestones: Array<{ title: string; isCompleted: boolean }>;
    mentorFeedback: string;
  }>,
  folderId?: string
): Promise<GoogleDriveFile> {
  let content = `=====================================================
PHRONESIS 5 LIFE SPHERES - DISCIPLESHIP GROWTH PLAN
=====================================================
Believer: ${userName}
Generated: ${new Date().toLocaleString()}
Total Tracked Goals: ${goals.length}
=====================================================\n\n`;

  goals.forEach((g, idx) => {
    content += `-----------------------------------------------------\n`;
    content += `GOAL #${idx + 1}: ${g.title}\n`;
    content += `Sphere: ${g.sphere.replace('_', ' ')} | Status: ${g.status} | Progress: ${g.progressPercent}%\n`;
    content += `Target Date: ${g.targetDate}\n`;
    content += `Scripture Anchor: ${g.scriptureAnchor}\n`;
    content += `Description: ${g.description}\n`;
    if (g.mentorFeedback) {
      content += `Mentor Feedback: ${g.mentorFeedback}\n`;
    }
    content += `\nMilestones:\n`;
    g.milestones.forEach((m, mIdx) => {
      content += `  [${m.isCompleted ? 'X' : ' '}] ${mIdx + 1}. ${m.title}\n`;
    });
    content += `\n`;
  });

  content += `=====================================================\nEnd of Discipleship Plan\n=====================================================`;

  const fileName = `Growth_Plan_5Spheres_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;

  return uploadToGoogleDrive({
    fileName,
    mimeType: 'text/plain',
    content,
    parentFolderId: folderId,
    description: `5 Life Spheres discipleship spiritual action plan for ${userName}`
  });
}

/** Format bytes to a readable size. */
export function formatBytes(bytes?: string | number): string {
  if (!bytes) return 'N/A';
  const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(num) || num === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return parseFloat((num / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
