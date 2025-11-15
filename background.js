// background.js

chrome.commands.onCommand.addListener(async (command) => {
    if (command === "capture_and_query") {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs.length === 0) return;

            const tab = tabs[0];

            // Capture and process the visible tab, returning a Data URL
            const dataUrl = await captureAndProcess(tab.windowId);
            if (!dataUrl) {
                console.error("[ERROR] Page capture failed, stopping.");
                return;
            }

            // Query Gemini with the captured image Data URL
            const geminiText = await queryGeminiWithImage(dataUrl);
            if (!geminiText) {
                console.error("[ERROR] Query to Gemini failed, stopping.");
                return;
            }

            // Inject content.js script into the current tab
            // (If already injected, this code is ignored)
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });

            // Send the response text to content.js as a message
            chrome.tabs.sendMessage(tab.id, {
                type: "displayResult",
                text: geminiText
            });

        } catch (error) {
            console.error("[ERROR] While executing command:", error);
        }
    }
});

async function captureAndProcess(windowId) {
    try {
        const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: "jpeg" });
        console.log("[INFO] Captured page image (Data URL):", dataUrl);

        return dataUrl; // Return captured data
    } catch (error) {
        console.error("[ERROR] Capture and process failed:", error);

        return null; // Return null on failure
    }
}

async function queryGeminiWithImage(dataUrl) {
    // Retrieve API key and model name together
    const storageData = await chrome.storage.local.get(['apiKey', 'modelName']);
    const GEMINI_API_KEY = storageData.apiKey;

    // Use stored model name, or default to 'flash' if not set
    const GEMINI_MODEL = storageData.modelName || 'gemini-2.5-flash';

    // Check if API key is stored
    if (!GEMINI_API_KEY) {
        console.error("[ERROR] Gemini API Key is not set.");

        // Notify user to go to options page
        chrome.notifications.create('no-api-key', {
            type: 'basic',
            iconUrl: 'images/icon-128.png',
            title: 'API Key Required',
            message: 'Please set the API Key in the Examy options page.'
        });

        // Open options page
        chrome.runtime.openOptionsPage();
        return null; // Stop API call
    }

    // Extract Base64 data and MIME type from Data URL
    const [mimeTypePart, base64Data] = dataUrl.split(';base64,');
    const mimeType = mimeTypePart.replace('data:', '');

    const prompt = "Solve the problems on this page and only provide the answers. Skip the solution process and give concise answers. If the problems are cut off, ignore them and move on. If there are no problems, respond with 'No problems found.' Respond in the language used in the image. Answer in plain text without any additional formatting.";

    const requestBody = {
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

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            console.error("[ERROR] Gemini API error:", result);
            return `Error: ${result.error?.message || 'API call failed'}`; // Return error message
        }

        const geminiText = result.candidates[0].content.parts[0].text;
        console.log("[INFO] Gemini response:", geminiText);

        return geminiText; // Return Gemini text on success

    } catch (error) {
        console.error("[ERROR] Gemini API call failed:", error);
        return `Error: ${error.message}`; // Return error message
    }
}