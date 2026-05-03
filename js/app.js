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
        console.log('StreamDriver Init - Client ID:', CONFIG.CLIENT_ID);
        
        try {
            // Initialize Icons
            if (typeof lucide !== 'undefined') lucide.createIcons();

            // Initialize Services
            if (typeof google !== 'undefined') {
                await this.auth.init();
            } else {
                console.error('Google SDK not loaded');
            }
            
            this.player = new PlayerService();

            // Bind Events
            this.bindEvents();

            // Check if already logged in
            if (this.auth.accessToken) {
                this.handleAuthSuccess();
            }

            this.updateApiStatus();
        } catch (error) {
            console.error('Initialization error:', error);
            // Don't let it hang, show app anyway
        } finally {
            // Luôn ẩn loading sau khi xong hoặc lỗi
            setTimeout(() => {
                const loader = document.getElementById('loading-screen');
                if (loader) loader.style.display = 'none';
                document.getElementById('app').classList.add('loaded');
            }, 800);
        }
    }

    updateApiStatus() {
        const dot = document.getElementById('status-dot');
        const text = document.getElementById('api-status');
        
        if (CONFIG.CLIENT_ID.includes('YOUR_CLIENT_ID')) {
            dot.style.background = '#ef4444';
            text.innerHTML = '<span id="status-dot" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #ef4444; margin-right: 8px;"></span> API chưa cấu hình! Vui lòng nhấn <b>Cấu hình thủ công</b>.';
        } else {
            dot.style.background = '#22c55e';
            text.innerHTML = '<span id="status-dot" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #22c55e; margin-right: 8px;"></span> API đã sẵn sàng. Chào mừng Đại Ca!';
        }
    }

    bindEvents() {
        document.getElementById('main-login-btn').onclick = () => this.auth.login();
        document.getElementById('logout-btn').onclick = () => this.auth.logout();
        document.getElementById('close-player-btn').onclick = () => this.player.close();
        document.getElementById('open-config-btn').onclick = () => this.toggleSettings(true);

        this.auth.onAuthChange = (token) => {
            if (token) this.handleAuthSuccess();
            else this.handleLogout();
        };

        document.getElementById('nav-my-drive').onclick = () => this.switchView('root', false);
        document.getElementById('nav-shared').onclick = () => this.switchView('root', true);
        
        // Settings Modal Events
        document.getElementById('nav-settings').onclick = () => this.toggleSettings(true);
        document.getElementById('close-settings-btn').onclick = () => this.toggleSettings(false);
        document.getElementById('save-settings-btn').onclick = () => this.saveSettings();

        // Check for missing credentials
        if (!localStorage.getItem('manual_client_id') && CONFIG.CLIENT_ID.includes('YOUR_CLIENT_ID')) {
            document.getElementById('setup-notice').style.display = 'block';
        }
    }

    toggleSettings(show) {
        const modal = document.getElementById('settings-modal');
        modal.style.display = show ? 'flex' : 'none';
        
        if (show) {
            document.getElementById('input-client-id').value = localStorage.getItem('manual_client_id') || '';
            document.getElementById('input-api-key').value = localStorage.getItem('manual_api_key') || '';
        }
    }

    saveSettings() {
        const clientId = document.getElementById('input-client-id').value.trim();
        const apiKey = document.getElementById('input-api-key').value.trim();

        if (clientId) localStorage.setItem('manual_client_id', clientId);
        if (apiKey) localStorage.setItem('manual_api_key', apiKey);

        alert('Đã lưu cấu hình! Trang web sẽ tải lại để áp dụng.');
        window.location.reload();
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
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('main-layout').style.display = 'flex';
        document.getElementById('user-info').style.display = 'flex';
        
        // Mock user data for now (or fetch from People API)
        document.getElementById('user-name').innerText = 'Đại Ca Streamer';
        document.getElementById('user-avatar').src = 'https://ui-avatars.com/api/?name=Dai+Ca&background=3b82f6&color=fff';
        
        this.renderFileList();
    }

    handleLogout() {
        document.getElementById('welcome-screen').style.display = 'flex';
        document.getElementById('main-layout').style.display = 'none';
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('file-list').innerHTML = '';
        this.updateApiStatus();
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
