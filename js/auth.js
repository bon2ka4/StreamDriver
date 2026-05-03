import { CONFIG } from './config.js';

export class AuthService {
    constructor() {
        this.tokenClient = null;
        this.accessToken = localStorage.getItem('gdrive_token');
        this.onAuthChange = null;
    }

    init() {
        return new Promise((resolve) => {
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CONFIG.CLIENT_ID,
                scope: CONFIG.SCOPES,
                callback: (response) => {
                    if (response.error !== undefined) {
                        throw response;
                    }
                    this.accessToken = response.access_token;
                    localStorage.setItem('gdrive_token', this.accessToken);
                    if (this.onAuthChange) this.onAuthChange(this.accessToken);
                    resolve(this.accessToken);
                },
            });
            resolve();
        });
    }

    login() {
        this.tokenClient.requestAccessToken({ prompt: 'select_account' });
    }

    logout() {
        this.accessToken = null;
        localStorage.removeItem('gdrive_token');
        google.accounts.oauth2.revoke(this.accessToken, () => {
            console.log('Token revoked');
        });
        if (this.onAuthChange) this.onAuthChange(null);
    }
}
