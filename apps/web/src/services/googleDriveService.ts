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

/**
 * List files from user's Google Drive with optional query filters
 */
export async function listGoogleDriveFiles(
  accessToken: string,
  options?: {
    folderId?: string;
    searchQuery?: string;
    mimeTypeFilter?: 'ALL' | 'DOCS' | 'PDFS' | 'SHEETS' | 'SLIDES' | 'FOLDERS' | 'AUDIO';
    pageSize?: number;
    pageToken?: string;
  }
): Promise<DriveFileListResponse> {
  const pageSize = options?.pageSize || 40;
  const qParts: string[] = ['trashed = false'];

  if (options?.folderId) {
    qParts.push(`'${options.folderId}' in parents`);
  }

  if (options?.searchQuery && options.searchQuery.trim()) {
    const sanitized = options.searchQuery.replace(/'/g, "\\'");
    qParts.push(`(name contains '${sanitized}' or fullText contains '${sanitized}')`);
  }

  if (options?.mimeTypeFilter && options.mimeTypeFilter !== 'ALL') {
    switch (options.mimeTypeFilter) {
      case 'FOLDERS':
        qParts.push("mimeType = 'application/vnd.google-apps.folder'");
        break;
      case 'PDFS':
        qParts.push("mimeType = 'application/pdf'");
        break;
      case 'DOCS':
        qParts.push("(mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' or mimeType = 'text/plain')");
        break;
      case 'SHEETS':
        qParts.push("(mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' or mimeType = 'text/csv')");
        break;
      case 'SLIDES':
        qParts.push("(mimeType = 'application/vnd.google-apps.presentation' or mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation')");
        break;
      case 'AUDIO':
        qParts.push("(mimeType = 'application/vnd.google-apps.audio' or mimeType contains 'audio/')");
        break;
    }
  }

  const query = encodeURIComponent(qParts.join(' and '));
  const fields = encodeURIComponent('nextPageToken,files(id,name,mimeType,description,webViewLink,webContentLink,iconLink,thumbnailLink,createdTime,modifiedTime,size,shared,owners,parents)');
  
  let url = `https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}&fields=${fields}&q=${query}&orderBy=folder,modifiedTime desc`;
  if (options?.pageToken) {
    url += `&pageToken=${encodeURIComponent(options.pageToken)}`;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Google Drive API error (${res.status}): ${errBody}`);
  }

  return res.json();
}

/**
 * Create a new folder in Google Drive
 */
export async function createGoogleDriveFolder(
  accessToken: string,
  folderName: string,
  parentFolderId?: string
): Promise<GoogleDriveFile> {
  const metadata: Record<string, any> = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    description: 'Phronesis Mentorship Discipleship Folder'
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink,createdTime', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create folder in Google Drive: ${err}`);
  }

  return res.json();
}

/**
 * Upload text/document or file to Google Drive using multipart upload
 */
export async function uploadToGoogleDrive(
  accessToken: string,
  data: {
    fileName: string;
    mimeType: string;
    content: string | Blob;
    parentFolderId?: string;
    description?: string;
  }
): Promise<GoogleDriveFile> {
  const metadata: Record<string, any> = {
    name: data.fileName,
    mimeType: data.mimeType,
    description: data.description || 'Created via Phronesis Discipleship Platform'
  };

  if (data.parentFolderId) {
    metadata.parents = [data.parentFolderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  let contentBody: string;
  if (data.content instanceof Blob) {
    contentBody = await data.content.text();
  } else {
    contentBody = data.content;
  }

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${data.mimeType}\r\n\r\n` +
    contentBody +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,size,createdTime', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to upload to Google Drive: ${err}`);
  }

  return res.json();
}

/**
 * Delete a file or folder from Google Drive
 * (Note: Caller MUST display confirmation dialog before invoking this)
 */
export async function deleteGoogleDriveFile(
  accessToken: string,
  fileId: string
): Promise<boolean> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.text();
    throw new Error(`Failed to delete Google Drive file: ${err}`);
  }

  return true;
}

/**
 * Export Discipleship Session Notes to Google Drive
 */
export async function exportSessionToDrive(
  accessToken: string,
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

  return uploadToGoogleDrive(accessToken, {
    fileName,
    mimeType: 'text/plain',
    content,
    parentFolderId: folderId,
    description: `Discipleship meeting notes between ${session.mentorName} and ${session.menteeName}`
  });
}

/**
 * Export 5 Life Spheres Goals & Milestones Action Plan to Google Drive
 */
export async function exportGoalsPlanToDrive(
  accessToken: string,
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

  return uploadToGoogleDrive(accessToken, {
    fileName,
    mimeType: 'text/plain',
    content,
    parentFolderId: folderId,
    description: `5 Life Spheres discipleship spiritual action plan for ${userName}`
  });
}

/**
 * Format bytes to readable size
 */
export function formatBytes(bytes?: string | number): string {
  if (!bytes) return 'N/A';
  const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(num) || num === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return parseFloat((num / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
