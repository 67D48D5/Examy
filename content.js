// content.js

// background.js로부터 메시지를 받기 위한 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 메시지 타입이 'displayResult'일 때만 실행
    if (request.type === "displayResult") {
        // 화면에 오버레이를 표시하는 함수 호출
        showOverlay(request.text);
    }
});

function showOverlay(text) {
    const OVERLAY_ID = "examy-response-overlay";

    // 매 쿼리마다 리셋: 기존 오버레이가 있다면 제거
    const existingOverlay = document.getElementById(OVERLAY_ID);
    if (existingOverlay) {
        existingOverlay.remove();
    }

    // 새 오버레이 div 요소 생성
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;

    // 요청하신 스타일 적용
    // (참고: '4포인트'는 5.3px로, 화면에서 거의 보이지 않습니다.)
    // (가독성을 위해 '14px'와 어두운 배경색으로 임의 조정했습니다.)
    overlay.style.position = 'fixed';
    overlay.style.bottom = '20px'; // 왼쪽 하단
    overlay.style.left = '20px';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // 어두운 배경
    overlay.style.color = '#FFFFFF'; // 흰색 글자 (회색보다 가독성 좋음)
    overlay.style.padding = '10px 15px';
    overlay.style.borderRadius = '8px';
    overlay.style.fontSize = '12px';
    overlay.style.fontFamily = 'sans-serif';
    overlay.style.zIndex = '999999999'; // 다른 요소들 위에 표시
    overlay.style.maxWidth = '400px'; // 너무 길어지지 않게
    overlay.style.whiteSpace = 'pre-wrap'; // Gemini 응답의 줄바꿈 유지

    // Gemini 응답 텍스트를 div에 삽입
    overlay.textContent = text;

    // 페이지의 body에 오버레이 추가
    document.body.appendChild(overlay);

    // 14초 후에 자동으로 사라지게 하기
    setTimeout(() => {
        overlay.remove();
    }, 14000); // 14000ms = 14초
}