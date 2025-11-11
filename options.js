// 저장 버튼 클릭 시 API 키 저장
document.getElementById('saveButton').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;
    const modelName = document.getElementById('modelName').value;

    if (apiKey) {
        chrome.storage.local.set(
            {
                'geminiApiKey': apiKey,
                'geminiModel': modelName || 'gemini-2.5-flash' // 기본값
            },
            () => {
                const status = document.getElementById('status');
                status.textContent = 'Saved!';
                setTimeout(() => {
                    status.textContent = '';
                }, 2000);
            }
        );
    } else {
        const status = document.getElementById('status');
        status.textContent = 'Please enter the API Key.';
        status.style.color = 'red';
        setTimeout(() => {
            status.textContent = '';
            status.style.color = 'green';
        }, 2000);
    }
});

// 옵션 페이지가 열릴 때, 저장된 값들을 입력창에 표시
document.addEventListener('DOMContentLoaded', () => {
    // apiKey와 geminiModel을 함께 불러옴
    chrome.storage.local.get(['geminiApiKey', 'geminiModel'], (result) => {
        if (result.geminiApiKey) {
            document.getElementById('apiKey').value = result.geminiApiKey;
        }
        if (result.geminiModel) {
            document.getElementById('modelName').value = result.geminiModel;
        }
    });
});