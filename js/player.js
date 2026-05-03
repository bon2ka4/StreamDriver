export class PlayerService {
    constructor() {
        this.player = new Plyr('#player', {
            controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
            settings: ['captions', 'quality', 'speed'],
            speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
            tooltips: { controls: true, seek: true },
            // Tối ưu Buffer
            loadSprite: true,
            iconPrefix: 'plyr'
        });
        this.player.media.preload = 'auto';
        this.modal = document.getElementById('player-modal');
    }

    play(file, streamUrl, tracks) {
        this.player.source = {
            type: 'video',
            title: file.name,
            sources: [
                {
                    src: streamUrl,
                    type: file.mimeType,
                }
            ],
            tracks: tracks
        };

        // Sử dụng this.player.media để truy cập trực tiếp vào thẻ video của Plyr
        const videoElement = this.player.media;
        const fallback = document.getElementById('player-fallback');
        const downloadLink = document.getElementById('download-link');

        fallback.style.display = 'none'; // Reset fallback

        if (videoElement) {
            videoElement.onerror = () => {
                console.error('Video load error');
                this.showFallback(streamUrl);
            };

            // Hẹn giờ: Sau 5 giây nếu vẫn 00:00 thì báo lỗi luôn
            this.loadTimeout = setTimeout(() => {
                if (videoElement.duration === 0 || isNaN(videoElement.duration)) {
                    console.warn('Video load timeout');
                    this.showFallback(streamUrl);
                }
            }, 6000);
        }

        this.modal.style.display = 'flex';
        this.player.play();
    }

    showFallback(streamUrl) {
        const fallback = document.getElementById('player-fallback');
        const downloadLink = document.getElementById('download-link');
        fallback.style.display = 'flex';
        downloadLink.href = streamUrl;
    }

    close() {
        if (this.loadTimeout) clearTimeout(this.loadTimeout);
        this.player.stop();
        this.modal.style.display = 'none';
        document.getElementById('player-fallback').style.display = 'none';
        this.player.source = {}; // Clear source
    }

    getStreamUrl(fileId, accessToken) {
        // Sử dụng link trực tiếp từ Google Drive để tận dụng session của trình duyệt
        return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${accessToken}`;
    }
}
