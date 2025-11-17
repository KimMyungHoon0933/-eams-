// src/utils/toast.js (새로 만드는 파일)

/**
 * 간단한 토스트 메시지를 표시하는 유틸리티 함수입니다.
 * 실제 프로젝트에서는 alert 대신 라이브러리(react-toastify 등)를 사용합니다.
 * @param {string} msg 표시할 메시지
 */
export const toast = (msg) => {
    // 현재는 alert으로 동작합니다.
    alert(msg); 
    // 실제로는 아래와 같이 구현될 수 있습니다:
    // import { toast } from 'react-toastify';
    // toast(msg);
};