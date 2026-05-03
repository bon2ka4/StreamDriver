export const CONFIG = {
    get CLIENT_ID() { return localStorage.getItem('manual_client_id') || '215348480469-ekt4t07e3kpbnjtcah6s7avuv784al8.apps.googleusercontent.com' },
    get API_KEY() { return localStorage.getItem('manual_api_key') || 'AIzaSyAt2WzWTx2r3j-Zbjil3qThm2IZbik9wRI' },
    SCOPES: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly',
    DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
};
