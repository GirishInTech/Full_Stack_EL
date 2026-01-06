 /**
 * Gemini AI Service
 * Handles AI-powered document analysis and chatbot functionality
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Analyze and summarize a document (PDF or image)
   * @param {File} file - The file to analyze
   * @returns {Promise<string>} - AI-generated summary
   */
  async analyzeDocument(file) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });
      // const model = this.genAI.getGenerativeModel({ model: 'gemini-exp-1206' });

      
      // Convert file to base64
      const base64Data = await this.fileToBase64(file);
      
      const prompt = `
        Please analyze this document and provide a comprehensive summary. Include:
        
        1. **Main Topic/Event**: What is this document about?
        2. **Key Details**: Important information like dates, deadlines, requirements
        3. **Rules/Guidelines**: Any important rules or guidelines mentioned
        4. **Contact Information**: Any contact details provided
        5. **Additional Notes**: Other relevant information
        
        Please format the response in a clear, structured manner with bullet points where appropriate.
        Focus on extracting practical information that would be useful for someone interested in participating.
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: file.type
          }
        }
      ]);

      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw new Error('Failed to analyze document. Please try again.');
    }
  }

  /**
   * Answer questions about an event using AI
   * @param {string} question - User's question
   * @param {Object} eventData - Event information for context
   * @returns {Promise<string>} - AI-generated answer
   */
  async answerEventQuestion(question, eventData) {
    try {
      console.log('Answering question:', question);
      console.log('Event data:', eventData);
      
      const model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
      
      // Check if there's a cached brochure summary for this event
      const cacheKey = `brochure_summary_${eventData._id}`;
      const brochureSummary = localStorage.getItem(cacheKey);
      
      const context = `
        Event Information:
        - Title: ${eventData.title}
        - Description: ${eventData.description}
        - Categories: ${eventData.categories?.join(', ')}
        - Team Size: ${eventData.teamSize?.min}-${eventData.teamSize?.max} members
        - Registration Deadline: ${eventData.deadlines?.registrationClose ? new Date(eventData.deadlines.registrationClose).toLocaleDateString() : 'Not specified'}
        - Event Start: ${eventData.deadlines?.eventStart ? new Date(eventData.deadlines.eventStart).toLocaleDateString() : 'Not specified'}
        - Event End: ${eventData.deadlines?.eventEnd ? new Date(eventData.deadlines.eventEnd).toLocaleDateString() : 'Not specified'}
        - Rules: ${eventData.rules?.join('\n') || 'No specific rules listed'}
        - Status: ${eventData.status}
        
        ${brochureSummary ? `
        Additional Detailed Information from Event Brochure:
        ${JSON.parse(brochureSummary)}
        ` : '(No additional brochure details available)'}
      `;

      const prompt = `
        Based on the following comprehensive event information, please answer the user's question clearly and concisely:
        
        ${context}
        
        User Question: ${question}
        
        Please provide a helpful and accurate answer using BOTH the basic event data and the detailed brochure information (if available). 
        Give priority to the detailed brochure information when it provides more specific details.
        Be friendly and conversational in your response.
        If specific information is not available, mention that clearly.
      `;

      console.log('Sending prompt to Gemini with brochure data:', !!brochureSummary);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const answer = response.text();
      
      console.log('Gemini response:', answer);
      return answer;
    } catch (error) {
      console.error('Error answering question:', error);
      console.error('Error details:', error.message);
      console.error('Full error object:', error);
      
      // More specific error handling
      if (error.message.includes('API_KEY')) {
        throw new Error('Invalid API key. Please check your Gemini API configuration.');
      } else if (error.message.includes('PERMISSION_DENIED')) {
        throw new Error('Permission denied. Please check your API key permissions.');
      } else if (error.message.includes('QUOTA_EXCEEDED')) {
        throw new Error('API quota exceeded. Please try again later.');
      } else {
        throw new Error(`Failed to process question: ${error.message}`);
      }
    }
  }

  /**
   * Analyze a document from URL (handles both local and Google Drive links)
   * @param {string} url - The URL of the document
   * @returns {Promise<string>} - AI-generated summary
   */
  async analyzeDocumentFromUrl(url) {
    try {
      // Handle local files differently than external URLs
      let fetchUrl = url;
      
      // If it's a local media file, construct the full URL
      if (url.startsWith('/media/')) {
        fetchUrl = `http://localhost:5000${url}`;
      } else {
        // Convert Google Drive links to direct download links
        fetchUrl = this.convertToDirectDownloadUrl(url);
      }
      
      // Fetch the file with CORS handling
      const response = await fetch(fetchUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': '*/*',
        }
      });
      
      if (!response.ok) {
        // If direct fetch fails, try alternative approach
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Check if we actually got a file or an error page
      if (blob.size < 100) {
        throw new Error('Received empty or invalid file');
      }
      
      // Determine file type
      let mimeType = blob.type;
      if (!mimeType || mimeType === 'application/octet-stream' || mimeType === 'text/html') {
        // Try to determine from URL
        if (url.toLowerCase().includes('.pdf')) {
          mimeType = 'application/pdf';
        } else if (url.toLowerCase().match(/\.(jpg|jpeg)$/)) {
          mimeType = 'image/jpeg';
        } else if (url.toLowerCase().includes('.png')) {
          mimeType = 'image/png';
        } else {
          mimeType = 'application/pdf'; // Default assumption
        }
      }
      
      const file = new File([blob], 'brochure', { type: mimeType });
      
      // Use the existing analyzeDocument method
      return await this.analyzeDocument(file);
    } catch (error) {
      console.error('Error analyzing document from URL:', error);
      
      // Provide more specific error messages
      if (error.message.includes('CORS')) {
        throw new Error('CORS error: The file cannot be accessed directly. Please use a direct download link or upload the file locally.');
      } else if (error.message.includes('403') || error.message.includes('401')) {
        throw new Error('Access denied: Please ensure the file is publicly accessible.');
      } else if (error.message.includes('404')) {
        throw new Error('File not found: Please check if the URL is correct and the file exists.');
      } else {
        throw new Error(`Failed to analyze document: ${error.message}`);
      }
    }
  }

  /**
   * Analyze brochure using the backend API endpoint with caching
   * @param {string} eventId - The event ID
   * @returns {Promise<string>} - AI-generated summary
   */
  async analyzeBrochureViaAPI(eventId) {
    try {
      // Check if summary is already cached
      const cacheKey = `brochure_summary_${eventId}`;
      const cachedSummary = localStorage.getItem(cacheKey);
      
      if (cachedSummary) {
        console.log('Using cached brochure summary');
        return JSON.parse(cachedSummary);
      }

      console.log('No cached summary found, generating new one...');
      
      // Get the auth token (same as used by api.js)
      const token = localStorage.getItem('accessToken');
      
      // Call the backend endpoint to get brochure data
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/summarize-brochure`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      let summary;
      
      if (result.data.base64) {
        // Local file - analyze the base64 data
        const base64Data = result.data.base64;
        const mimeType = result.data.mimeType;
        
        // Convert base64 to File object
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: mimeType });
        const file = new File([blob], result.data.filename, { type: mimeType });
        
        // Analyze using Gemini
        summary = await this.analyzeDocument(file);
      } else if (result.data.url) {
        // External URL - use the existing URL analysis method
        summary = await this.analyzeDocumentFromUrl(result.data.url);
      } else {
        throw new Error('Invalid brochure data received from server');
      }

      // Cache the summary for future use
      localStorage.setItem(cacheKey, JSON.stringify(summary));
      console.log('Brochure summary cached successfully');
      
      return summary;
    } catch (error) {
      console.error('Error analyzing brochure via API:', error);
      
      if (error.message.includes('401') || error.message.includes('403')) {
        throw new Error('Authentication required. Please log in and try again.');
      } else if (error.message.includes('404')) {
        throw new Error('Event or brochure not found.');
      } else if (error.message.includes('400')) {
        throw new Error('No brochure available for this event.');
      } else {
        throw new Error(`Failed to analyze brochure: ${error.message}`);
      }
    }
  }

  /**
   * Clear cached brochure summary for an event
   * @param {string} eventId - The event ID
   */
  clearBrochureCache(eventId) {
    const cacheKey = `brochure_summary_${eventId}`;
    localStorage.removeItem(cacheKey);
    console.log(`Cleared brochure cache for event ${eventId}`);
  }

  /**
   * Convert Google Drive view links to direct download links
   * @param {string} url - Original URL
   * @returns {string} - Direct download URL
   * @private
   */
  convertToDirectDownloadUrl(url) {
    // Check if it's a Google Drive link
    const driveMatch = url.match(/https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (driveMatch) {
      const fileId = driveMatch[1];
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    
    // If not a Google Drive link, return as is
    return url;
  }
  /**
   * Convert file to base64 string
   * @private
   */
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export default new GeminiService();