// services/query-service.js

import { LOG_PREFIX, NOTIFICATION_IDS } from '../utils/constants.js';
import { createNotification, openOptionsPage } from '../utils/chrome-helpers.js';

/**
 * Queries the selected LLM provider with an image
 * @param {string} dataUrl - The captured image as a data URL
 * @param {Object} settings - Extension settings
 * @returns {Promise<string|null>} The text response or null on failure
 */
export async function queryLLM(dataUrl, settings) {
    const modelName = settings.modelName || 'gemini-2.5-flash';
    // Determine provider based on settings or model name
    let provider = settings.provider;
    if (!provider) {
        if (modelName === 'openai') provider = 'openai';
        else provider = 'gemini';
    }

    console.log(`${LOG_PREFIX.INFO} Querying \`${modelName}\` (\`${provider}\`)...`);

    try {
        if (provider === 'openai') {
            return await queryOpenAI(dataUrl, settings);
        } else if (provider === 'custom') {
            return await queryCustom(dataUrl, settings);
        } else {
            return await queryGemini(dataUrl, settings);
        }
    } catch (error) {
        console.error(`${LOG_PREFIX.ERROR} Query failed:`, error);
        return `Error: ${error.message}`;
    }
}

async function queryGemini(dataUrl, settings) {
    const apiKey = settings.apiKey;
    if (!apiKey) {
        await notifyMissingApiKey();
        return null;
    }

    const prompt = settings.prompt;
    const modelName = settings.modelName;
    const baseUrl = (settings.baseUrl || '').replace(/\/$/, '');

    const requestBody = buildGeminiRequest(dataUrl, prompt);

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
        throw new Error(result.error?.message || 'API call failed');
    }

    const geminiText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(`${LOG_PREFIX.INFO} \`Gemini\` API Response:`, geminiText);

    if (!geminiText) {
        console.error(`${LOG_PREFIX.ERROR} Unexpected Gemini API response structure:`, result);
        throw new Error('Unexpected API response format');
    }

    return geminiText;
}

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

async function notifyMissingApiKey() {
    await createNotification(NOTIFICATION_IDS.NO_API_KEY, {
        type: 'basic',
        iconUrl: 'images/icon-128.png',
        title: 'API Key Required',
        message: 'Please set the API Key in the Examy options page.'
    });

    await openOptionsPage();
}

async function queryOpenAI(dataUrl, settings) {
    return queryGenericOpenAI(
        dataUrl,
        settings.openai_apiKey,
        settings.openai_baseUrl,
        settings.openai_model,
        settings.openai_prompt
    );
}

async function queryCustom(dataUrl, settings) {
    return queryGenericOpenAI(
        dataUrl,
        settings.custom_apiKey,
        settings.custom_baseUrl,
        settings.custom_model,
        settings.custom_prompt
    );
}

async function queryGenericOpenAI(dataUrl, apiKey, baseUrl, model, prompt) {
    const body = {
        model: model,
        messages: [{
            role: "user",
            content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: dataUrl } }
            ]
        }],
        max_tokens: 1000
    };

    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    console.log(`${LOG_PREFIX.INFO} \`OpenAI\` API Response:`, data.choices?.[0]?.message?.content);

    return data.choices?.[0]?.message?.content || null;
}