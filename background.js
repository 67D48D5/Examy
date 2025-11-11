// background.js

const GEMINI_MODEL = "gemini-2.5-flash"; // 또는 gemini-2.5-pro

chrome.commands.onCommand.addListener(async (command) => {
    if (command === "capture_and_query") {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

            if (tabs.length > 0) {
                const tab = tabs[0];
                await captureAndProcess(tab.windowId);
            }
        } catch (error) {
            console.error("[ERROR] While executing command:", error);
        }
    }
});

async function captureAndProcess(windowId) {
    try {
        const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: "jpeg" });

        console.log("[INFO] Captured image (Data URL):", dataUrl.substring(0, 50) + "...");

        await queryGeminiWithImage(dataUrl);

    } catch (error) {
        console.error("[ERROR] Capture and process failed:", error);
    }
}

async function queryGeminiWithImage(dataUrl) {
    // chrome.storage에서 API 키 가져오기
    const result = await chrome.storage.local.get(['geminiApiKey']);
    const GEMINI_API_KEY = result.geminiApiKey;

    // 키가 저장되어 있는지 확인
    if (!GEMINI_API_KEY) {
        console.error("[ERROR] Gemini API Key is not set.");

        // 사용자에게 옵션 페이지로 가도록 알림
        chrome.notifications.create('no-api-key', {
            type: 'basic',
            iconUrl: 'images/icon-128.png',
            title: 'API Key Required',
            message: 'Please set the Gemini API Key in the Examy options page.'
        });

        // 옵션 페이지 열기
        chrome.runtime.openOptionsPage();
        return; // API 호출 중단
    }

    // Data URL에서 Base64 데이터와 MIME 타입 추출
    const [mimeTypePart, base64Data] = dataUrl.split(';base64,');
    const mimeType = mimeTypePart.replace('data:', '');

    const prompt = "Solve the problems on this page and only provide the answers. Skip the solution process and give concise answers. If the problems are cut off, ignore them and move on.";

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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            console.error("[ERROR] Gemini API error:", result);
            return;
        }

        const geminiText = result.candidates[0].content.parts[0].text;
        console.log("[INFO] Gemini response:", geminiText);

        // 고유한 ID로 알림을 생성 (ID를 지정하지 않으면 매번 새 알림)
        const notificationId = 'gemini-response';

        chrome.notifications.create(notificationId, {
            type: 'basic', // 'basic', 'image', 'list', 'progress' 등이 있습니다.
            iconUrl: 'images/icon-128.png', // manifest.json에 등록한 아이콘
            title: 'Examy',
            message: geminiText // Gemini가 보낸 전체 텍스트
        });

    } catch (error) {
        console.error("[ERROR] Gemini API call or notification creation failed:", error);
    }
}