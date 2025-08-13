
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export class GeminiService {
  static async generateContentSuggestions(prompt: string, context?: string) {
    try {
      const fullPrompt = context 
        ? `Based on this context: "${context}", suggest engaging social media content for: ${prompt}`
        : `Suggest engaging social media content for: ${prompt}`;

      const response = await fetch(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }]
        }),
      });

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No suggestions available';
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  static async improveContent(content: string) {
    try {
      const response = await fetch(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Improve this social media post to make it more engaging while keeping the core message: "${content}"`
            }]
          }]
        }),
      });

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || content;
    } catch (error) {
      console.error('Gemini improve error:', error);
      throw error;
    }
  }
}
