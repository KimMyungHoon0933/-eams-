// app/components/messeage_component/Messenger_chatwindow/x_to_messenger.js
"use client";

import MessengerContainer from "../Messenger_home/MessengerContainer";

/**
 * 메인 사이트 위에 띄우는 메신저 모달 컴포넌트
 * - onClose: 바깥 영역이나 X 버튼을 눌렀을 때 호출할 함수
 */
export default function MessengerModal({ onClose }) {
  const handleBackgroundClick = () => {
    if (onClose) onClose();
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="messenger-overlay" onClick={handleBackgroundClick}>
      <div className="messenger-modal" onClick={stopPropagation}>
        <button
          type="button"
          className="close-btn"
          onClick={onClose}
          aria-label="닫기"
          title="닫기"
        >
          ✖
        </button>
        {/* 실제 메신저 화면 */}
        <MessengerContainer />
      </div>
    </div>
  );
}
