import axios from 'axios';

/**
 * TikTok OAuth Authorization URL Generator
 * This helper generates the URL needed to start the TikTok authorization flow
 */

export class TikTokOAuthHelper {
  /**
   * Generate the TikTok authorization URL
   * User needs to visit this URL to authorize the app
   */
  static generateAuthorizationUrl(): string {
    const clientId = process.env.TIKTOK_CLIENT_ID || '';
    const redirectUri = process.env.TIKTOK_REDIRECT_URI || 'http://localhost:5001/tiktok/callback';
    const scope = 'user.info.basic,user.info.profile'; // Approved scopes
    const state = Buffer.from(JSON.stringify({ timestamp: Date.now() })).toString('base64');

    const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
    authUrl.searchParams.append('client_key', clientId);
    authUrl.searchParams.append('scope', scope);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('state', state);

    return authUrl.toString();
  }

  /**
   * Test the current TikTok access token
   */
  static async testAccessToken(accessToken: string): Promise<boolean> {
    try {
      const response = await axios.get('https://open-api.tiktok.com/v1/user/info/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ TikTok Access Token is valid:', response.data);
      return true;
    } catch (error: any) {
      console.error('❌ TikTok Access Token test failed:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Refresh TikTok access token if needed
   */
  static async refreshAccessToken(refreshToken: string): Promise<any> {
    try {
      const url = 'https://open.tiktokapis.com/v2/oauth/token/';
      const params = new URLSearchParams();
      params.append('client_key', process.env.TIKTOK_CLIENT_ID || '');
      params.append('client_secret', process.env.TIKTOK_CLIENT_SECRET || '');
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', refreshToken);

      const response = await axios.post(url, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('✅ TikTok token refreshed successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error refreshing TikTok token:', error.response?.data || error.message);
      throw error;
    }
  }
}

/**
 * INTEGRATION STEPS:
 *
 * 1. GET THE AUTHORIZATION URL:
 *    const authUrl = TikTokOAuthHelper.generateAuthorizationUrl();
 *    console.log('Visit this URL to authorize:', authUrl);
 *
 * 2. USER AUTHORIZES:
 *    - User visits the URL above
 *    - Logs into TikTok
 *    - Clicks "Authorize"
 *    - Gets redirected to http://localhost:5001/tiktok/callback?code=XXX
 *
 * 3. BACKEND EXCHANGES CODE FOR TOKEN:
 *    - The /tiktok/callback endpoint handles this automatically
 *    - Access token is displayed in console
 *    - Save token to .env.local as TIKTOK_ACCESS_TOKEN
 *
 * 4. TEST THE TOKEN:
 *    const isValid = await TikTokOAuthHelper.testAccessToken(yourAccessToken);
 */
