// background.js

chrome.commands.onCommand.addListener(async (command) => {
    if (command === "capture_and_query") {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs.length === 0) return;

            const tab = tabs[0];

            // 캡처 실행 (결과를 dataUrl로 받음)
            const dataUrl = await captureAndProcess(tab.windowId);
            if (!dataUrl) {
                console.error("[ERROR] Capture failed, stopping.");
                return;
            }

            // Gemini 쿼리 실행 (결과를 geminiText로 받음)
            const geminiText = await queryGeminiWithImage(dataUrl);
            if (!geminiText) {
                console.error("[ERROR] Gemini query failed, stopping.");
                return;
            }

            // content.js 스크립트를 현재 탭에 주입
            // (이미 주입되었다면 이 코드는 무시됨)
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });

            // content.js로 응답 텍스트를 메시지로 전송
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
        console.log("[INFO] Captured image (Data URL):", dataUrl);

        return dataUrl; // 캡처 데이터를 반환
    } catch (error) {
        console.error("[ERROR] Capture and process failed:", error);

        return null; // 실패 시 null 반환
    }
}

async function queryGeminiWithImage(dataUrl) {
    // API 키와 모델 이름을 함께 가져오기
    const storageData = await chrome.storage.local.get(['geminiApiKey', 'geminiModel']);
    const GEMINI_API_KEY = storageData.geminiApiKey;

    // 저장된 모델 이름을 사용하고, 없으면 기본값(flash)을 사용합니다.
    const GEMINI_MODEL = storageData.geminiModel || 'gemini-2.5-flash';

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
        return null; // API 호출 중단
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            console.error("[ERROR] Gemini API error:", result);
            return `Error: ${result.error?.message || 'API call failed'}`; // 에러 메시지를 반환
        }

        const geminiText = result.candidates[0].content.parts[0].text;
        console.log("[INFO] Gemini response:", geminiText);

        return geminiText; // 성공 시 Gemini 텍스트를 반환

    } catch (error) {
        console.error("[ERROR] Gemini API call failed:", error);
        return `Error: ${error.message}`; // 에러 메시지를 반환
    }
}