import { AuthService } from './auth.js';
import { DriveService } from './drive.js';
import { PlayerService } from './player.js';

class App {
    constructor() {
        this.auth = new AuthService();
        this.drive = new DriveService(this.auth);
        this.player = null;
        
        this.currentFolder = 'root';
        this.isSharedView = false;

        this.init();
    }

    async init() {
        // Initialize Icons
        lucide.createIcons();

        // Initialize Services
        await this.auth.init();
        this.player = new PlayerService();

        // Bind Events
        this.bindEvents();

        // Check if already logged in
        if (this.auth.accessToken) {
            this.handleAuthSuccess();
        }

        // Hide loading
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('app').classList.add('loaded');
        }, 1000);
    }

    bindEvents() {
        document.getElementById('login-btn').onclick = () => this.auth.login();
        document.getElementById('close-player-btn').onclick = () => this.player.close();

        this.auth.onAuthChange = (token) => {
            if (token) this.handleAuthSuccess();
            else this.handleLogout();
        };

        document.getElementById('nav-my-drive').onclick = () => this.switchView('root', false);
        document.getElementById('nav-shared').onclick = () => this.switchView('root', true);
    }

    async switchView(folderId, isShared) {
        this.currentFolder = folderId;
        this.isSharedView = isShared;
        
        // UI Update
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        document.getElementById(isShared ? 'nav-shared' : 'nav-my-drive').classList.add('active');
        document.querySelector('.section-title').innerText = isShared ? 'Được chia sẻ với tôi' : 'Drive của tôi';

        this.renderFileList();
    }

    async handleAuthSuccess() {
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('user-info').style.display = 'flex';
        // You could fetch user info here using Google People API
        this.renderFileList();
    }

    handleLogout() {
        document.getElementById('login-btn').style.display = 'block';
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('file-list').innerHTML = '';
    }

    async renderFileList() {
        const fileList = document.getElementById('file-list');
        fileList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-dim);">Đang tải dữ liệu...</p>';

        const files = await this.drive.fetchFiles(this.currentFolder, this.isSharedView);
        
        fileList.innerHTML = '';
        if (files.length === 0) {
            fileList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-dim);">Không có tệp tin nào được tìm thấy.</p>';
            return;
        }

        files.forEach(file => {
            const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
            const isVideo = file.mimeType.startsWith('video/');

            if (!isFolder && !isVideo) return;

            const card = document.createElement('div');
            card.className = 'file-card';
            card.innerHTML = `
                <div class="file-thumb">
                    ${isFolder ? '<i data-lucide="folder" style="width: 48px; height: 48px; color: #3b82f6;"></i>' : 
                      (file.thumbnailLink ? `<img src="${file.thumbnailLink.replace('=s220', '=s600')}" alt="${file.name}">` : '<i data-lucide="video" style="width: 48px; height: 48px;"></i>')}
                </div>
                <div class="file-info">
                    <div class="file-name" title="${file.name}">${file.name}</div>
                    <div class="file-meta">${isFolder ? 'Thư mục' : this.formatSize(file.size)}</div>
                </div>
            `;

            card.onclick = () => {
                if (isFolder) {
                    this.switchView(file.id, this.isSharedView);
                } else if (isVideo) {
                    this.playVideo(file);
                }
            };

            fileList.appendChild(card);
        });
        
        lucide.createIcons();
    }

    async playVideo(file) {
        const streamUrl = this.drive.getStreamUrl(file.id);
        // Ở phiên bản này, em đang lấy file gốc. 
        // Để có đa chất lượng (720, 1080), cần proxy hoặc xử lý sâu hơn.
        this.player.play(streamUrl, file.name);
    }

    formatSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Start App
window.addEventListener('DOMContentLoaded', () => {
    new App();
});
