
const AYRSHARE_API_KEY = 'YOUR_AYRSHARE_API_KEY';
const AYRSHARE_BASE_URL = 'https://app.ayrshare.com/api';

export class AyrshareService {
  private static headers = {
    'Authorization': `Bearer ${AYRSHARE_API_KEY}`,
    'Content-Type': 'application/json',
  };

  static async publishPost(content: string, platforms: string[]) {
    try {
      const response = await fetch(`${AYRSHARE_BASE_URL}/post`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          post: content,
          platforms: platforms,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Ayrshare publish error:', error);
      throw error;
    }
  }

  static async getAnalytics(postId: string) {
    try {
      const response = await fetch(`${AYRSHARE_BASE_URL}/analytics/post/${postId}`, {
        headers: this.headers,
      });
      return await response.json();
    } catch (error) {
      console.error('Ayrshare analytics error:', error);
      throw error;
    }
  }

  static async getRecentPosts() {
    try {
      const response = await fetch(`${AYRSHARE_BASE_URL}/history`, {
        headers: this.headers,
      });
      return await response.json();
    } catch (error) {
      console.error('Ayrshare history error:', error);
      throw error;
    }
  }
}
