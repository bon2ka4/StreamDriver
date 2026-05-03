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

    play(videoUrl, title, subs = []) {
        this.player.source = {
            type: 'video',
            title: title,
            sources: [
                {
                    src: videoUrl,
                    type: 'video/mp4',
                    size: 1080 // Default label
                }
            ],
            tracks: subs.map(s => ({
                kind: 'captions',
                label: s.label,
                srclang: s.lang,
                src: s.url,
                default: s.isDefault
            }))
        };

        this.modal.style.display = 'flex';
        this.player.play();
    }

    close() {
        this.player.stop();
        this.modal.style.display = 'none';
        this.player.source = {}; // Clear source
    }
}
