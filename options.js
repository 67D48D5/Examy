// 저장 버튼 클릭 시 API 키 저장
document.getElementById('saveButton').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;

    if (apiKey) {
        chrome.storage.local.set({ 'geminiApiKey': apiKey }, () => {
            const status = document.getElementById('status');
            status.textContent = 'API Key has been saved!';
            setTimeout(() => {
                status.textContent = '';
            }, 2000); // 2초 후 메시지 숨김
        });
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

// 옵션 페이지가 열릴 때, 저장된 키가 있으면 입력창에 표시
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['geminiApiKey'], (result) => {
        if (result.geminiApiKey) {
            document.getElementById('apiKey').value = result.geminiApiKey;
        }
    });
});