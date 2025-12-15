/*
 * @file api/axios.js
 * @author 이재
 * @version 1.0
 * @since 2025-12-11
 * @description
 * Axios 공통 인스턴스를 정의한 파일로,
 * 요청 인터셉터를 통해 JWT Access Token을 자동으로 헤더에 주입하고
 * 토큰 만료 시 Refresh Token 기반 재발급 로직을 수행합니다.
 * 응답 인터셉터에서는 401 오류 발생 시 원 요청을 재시도하거나
 * 재발급 실패 시 로그아웃 처리를 담당합니다.
 */

import axios from "axios";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  withCredentials: true,
});

// === 요청 인터셉터 ===
api.interceptors.request.use(
  async (config) => {
    let accessToken = localStorage.getItem("accessToken");

    // accessToken이 존재하면 header에 추가
    if (accessToken) {
      const decoded = jwtDecode(accessToken);
      const now = Math.floor(Date.now() / 1000);

      // Access Token이 만료됐다면 Refresh Token으로 재발급 시도
      if (decoded.exp < now) {
        console.log("⏰ Access Token 만료됨 → 재발급 시도 중...");
        const success = await reissueToken();
        if (!success) {
          console.warn("Refresh Token 재발급 실패 → 로그아웃");
          localStorage.clear();
          window.location.href = "/";
          // throw new Error("토큰 재발급 실패");
          return Promise.reject("토큰 재발급 실패");
        }
        accessToken = localStorage.getItem("accessToken"); // 새 토큰 다시 가져오기
      }
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// === 응답 인터셉터 ===
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Access Token이 만료되어 401 에러가 발생한 경우
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const success = await reissueToken();
      if (success) {
        originalRequest.headers.Authorization = `Bearer ${localStorage.getItem("accessToken")}`;
        return api(originalRequest); // 원래 요청 재시도
      } else {
        localStorage.clear();
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

// === Refresh Token 재발급 함수 ===
async function reissueToken() {
  try {
    const response = await axios.post(
      `${process.env.VUE_APP_API_BASE_URL}/api/auth/reissue`, {}, {withCredentials: true}
    );

    const newAccessToken = response.data.accessToken;

    localStorage.setItem("accessToken", newAccessToken);

    console.log("토큰 재발급 완료");
    return true;
  } catch (err) {
    console.error("토큰 재발급 실패:", err.response?.data || err);
    return false;
  }
}

export default api;
