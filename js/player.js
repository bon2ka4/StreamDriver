export class PlayerService {
    constructor() {
        this.player = new Plyr('#player', {
            controls: [
                'play-large', 'play', 'progress', 'current-time', 'duration',
                'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'
            ],
            settings: ['captions', 'quality', 'speed'],
            quality: {
                default: 1080,
                options: [4320, 2880, 2160, 1440, 1080, 720, 540, 480, 360, 240]
            }
        });
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
                fallback.style.display = 'flex';
                downloadLink.href = streamUrl;
            };
        }

        this.modal.style.display = 'flex';
        this.player.play();
    }

    close() {
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
