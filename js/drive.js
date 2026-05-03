import { CONFIG } from './config.js';

export class DriveService {
    constructor(authService) {
        this.authService = authService;
    }

    async fetchFiles(folderId = 'root', isShared = false) {
        const token = this.authService.accessToken;
        if (!token) return [];

        let query = `'${folderId}' in parents and trashed = false`;
        if (isShared && folderId === 'root') {
            query = `sharedWithMe = true and trashed = false`;
        }

        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,thumbnailLink,size,videoMediaMetadata)&pageSize=100`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            if (response.status === 401) {
                this.authService.login();
            }
            return [];
        }

        const data = await response.json();
        return data.files || [];
    }

    async getFileMetadata(fileId) {
        const token = this.authService.accessToken;
        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,videoMediaMetadata,description`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return await response.json();
    }

    async fetchSubtitles(fileId) {
        try {
            // Tìm các file phụ đề có liên quan hoặc trong cùng folder
            // Hiện tại em trả về mảng rỗng để fix lỗi trước, Đại Ca có thể nâng cấp tìm file .srt sau
            return [];
        } catch (error) {
            console.error('Error fetching subtitles:', error);
            return [];
        }
    }

    getStreamUrl(fileId) {
        return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${this.authService.accessToken}`;
    }
}
