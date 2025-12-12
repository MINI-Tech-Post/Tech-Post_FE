  <!-- 
  @file App.vue
	@author 이재
	@version 1.0
	@since 2025-12-10
	@description 
  애플리케이션의 전역 루트 컴포넌트로, OAuth 로그인 후 URL 쿼리로 전달된 Access Token을 처리하고 사용자 인증 상태를 초기화합니다.
  -->

<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';

const router = useRouter();

onMounted(() => {
  // 현재 URL 확인용 디버깅
  console.log('[APP] current location:', window.location.href);
  console.log('[APP] search:', window.location.search);

  // URLSearchParams로 직접 쿼리 파싱
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get('accessToken');

  console.log('[APP] accessToken from query:', accessToken);

  if (accessToken) {
    // 토큰 저장
    localStorage.setItem('accessToken', accessToken);
    // JWT 디코딩
    const decoded = jwtDecode(accessToken);
    localStorage.setItem("username", decoded.sub);
    localStorage.setItem("role", decoded.role);
    localStorage.setItem("name", decoded.name);

    // 쿼리 없는 깨끗한 주소로 이동
    router.replace({ path: '/post/list' });
  }
});
</script>

<style>
</style>
