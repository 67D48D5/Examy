// gemini-service.js

import { GEMINI_CONFIG, NOTIFICATION_IDS, LOG_PREFIX } from '../utils/constants.js';
import { getStorageValues, createNotification, openOptionsPage } from '../utils/chrome-helpers.js';

/**
 * Queries Gemini API with an image
 * @param {string} dataUrl - Base64 encoded image data URL
 * @returns {Promise<string|null>} Response text or null on failure
 */
export async function queryGeminiWithImage(dataUrl) {
    // Retrieve API key and model name from storage
    const storageData = await getStorageValues(['apiKey', 'modelName', 'gemini_baseUrl', 'gemini_prompt']);
    const apiKey = storageData.apiKey;
    const modelName = storageData.modelName || GEMINI_CONFIG.defaultModel;
    const baseUrl = storageData.gemini_baseUrl?.replace(/\/$/, '') || GEMINI_CONFIG.baseUrl?.replace(/\/$/, '') || '';
    const prompt = storageData.gemini_prompt?.trim() || GEMINI_CONFIG.defaultPrompt;

    // Validate API key
    if (!apiKey) {
        console.error(`${LOG_PREFIX.ERROR} Gemini API Key is not set.`);
        await notifyMissingApiKey();
        return null;
    }

    // Prepare request body
    const requestBody = buildGeminiRequest(dataUrl, prompt);

    // Make API call
    try {
        const response = await fetch(
            `${baseUrl}/${modelName}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            console.error(`${LOG_PREFIX.ERROR} Gemini API error:`, result);
            return `Error: ${result.error?.message || 'API call failed'}`;
        }

        // Extract response text using optional chaining
        const geminiText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!geminiText) {
            console.error(`${LOG_PREFIX.ERROR} Unexpected Gemini API response structure:`, result);
            return 'Error: Unexpected API response format';
        }

        console.log(`${LOG_PREFIX.INFO} Gemini response:\n${geminiText}`);

        return `${LOG_PREFIX.INFO} Query response:\n${geminiText}`;

    } catch (error) {
        console.error(`${LOG_PREFIX.ERROR} Gemini API call failed:`, error);
        return `Error: ${error.message}`;
    }
}

/**
 * Builds the request body for Gemini API
 * @param {string} dataUrl - Base64 encoded image data URL
 * @param {string} prompt - Text prompt for the query
 * @returns {Object} Request body object
 */
function buildGeminiRequest(dataUrl, prompt) {
    // Extract Base64 data and MIME type from Data URL
    const [mimeTypePart, base64Data] = dataUrl.split(';base64,');
    const mimeType = mimeTypePart.replace('data:', '');

    return {
        contents: [
            {
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType
                        }
                    },
                    {
                        text: prompt
                    }
                ]
            }
        ]
    };
}

/**
 * Notifies user about missing API key and opens options page
 */
async function notifyMissingApiKey() {
    await createNotification(NOTIFICATION_IDS.NO_API_KEY, {
        type: 'basic',
        iconUrl: 'images/icon-128.png',
        title: 'API Key Required',
        message: 'Please set the API Key in the Examy options page.'
    });

    await openOptionsPage();
}
