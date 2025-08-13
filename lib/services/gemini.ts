
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export class GeminiService {
  static async generateBlogContent(title: string, existingContent?: string) {
    try {
      const prompt = existingContent 
        ? `I'm writing a blog post titled "${title}". Here's what I have so far: "${existingContent}". Please suggest additional content, ideas, or sections that would enhance this blog post. Focus on providing valuable insights and engaging content.`
        : `I want to write a blog post titled "${title}". Please provide some engaging content ideas, an outline, or a starting paragraph that would make this blog post interesting and valuable to readers.`;

      const response = await fetch(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
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
              text: `Please improve this blog post content to make it more engaging, clear, and well-structured. Maintain the original meaning but enhance readability and flow: "${content}"`
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

  static async generateBlogIdeas(topic?: string) {
    try {
      const prompt = topic 
        ? `Generate 10 engaging blog post ideas related to "${topic}". Each idea should be specific, interesting, and provide value to readers.`
        : `Generate 10 engaging blog post ideas across different topics like technology, lifestyle, business, health, and education. Each idea should be specific and interesting.`;

      const response = await fetch(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      });

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No ideas available';
    } catch (error) {
      console.error('Gemini ideas error:', error);
      throw error;
    }
  }
}
