<!--
  @file MyChatList.vue
  @author 이재
  @version 1.0
  @since 2025-12-11
  @description
  사용자가 현재 참여 중인 채팅방 목록을 조회하는 화면 컴포넌트로,
  채팅방 입장 및 채팅방 나가기 기능을 제공하며
  개인 채팅방 관리를 위한 UI를 담당합니다.
-->

<template>
  <v-container fluid class="feed-page">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="9">

        <!-- 공통 헤더 + 네비 -->
        <div class="feed-header">
          <div>
            <div class="logo">TechPost</div>
            <div class="subtitle">테크 뉴스 & 개발 커뮤니티</div>
          </div>
          <v-btn
            size="small"
            variant="outlined"
            class="my-btn"
            @click="logout"
          >
            <v-icon size="0" start>mdi-logout</v-icon>
            👋 로그아웃
          </v-btn>
        </div>

        <div class="nav-tabs">
          <v-btn
            variant="text"
            class="nav-btn"
            :class="{ active: $route.path.startsWith('/post/list') }"
            @click="$router.push('/post/list')"
          >
            📰 뉴스 리스트
          </v-btn>

          <v-btn
            variant="text"
            class="nav-btn"
            :class="{ active: $route.path.startsWith('/group/chat/list') }"
            @click="$router.push('/group/chat/list')"
          >
            👥 전체 채팅방
          </v-btn>

          <v-btn
            variant="text"
            class="nav-btn"
            :class="{ active: $route.path.startsWith('/my/chat/list') }"
            @click="$router.push('/my/chat/list')"
          >
            👤 내 채팅방
          </v-btn>
        </div>

        <v-card class="filter-card" elevation="2">
          <v-card-text class="d-flex align-center justify-space-between">
            <div class="tab-title">👤 내가 참여 중인 채팅방</div>
            <v-btn
              size="small"
              color="primary"
              variant="outlined"
              @click="loadMyChatList"
            >
            <v-icon size="0" start>mdi-refresh</v-icon>
              🔄 새로고침
            </v-btn>
          </v-card-text>
        </v-card>

        <div v-if="loading" class="mt-4">
          <v-skeleton-loader type="article, article" />
        </div>

        <v-card
          v-for="room in myChatList"
          :key="room.roomId"
          class="feed-card mt-3"
          variant="outlined"
          @click="enterRoom(room.roomId)"
        >
        <v-card-text class="d-flex justify-space-between align-center">
          <div>
            <div class="chat-room-title">🗨️ {{ room.roomName }}</div>
            <div class="chat-room-meta">
              👥 참여자 {{ room.participantCount }}명
            </div>
          </div>  

          <!-- 오른쪽 액션 영역: 입장 + 나가기 -->
          <div class="d-flex align-center">
            <v-btn
              size="small"
              variant="tonal"
              color="primary"
              class="mr-2"
              @click.stop="enterRoom(room.roomId)"
            >
              🟢 입장
            </v-btn>

            <v-btn
              size="small"
              variant="tonal"
              color="error"
              @click.stop="leaveRoom(room.roomId)"
            >
              🔴 나가기
            </v-btn>
          </div>
        </v-card-text>
        </v-card>

        <div v-if="!myChatList.length && !loading" class="empty-text">
          참여 중인 채팅방이 없습니다.
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from '@/api/axios';

export default {
  name: 'MyChatList',
  data() {
    return {
      myChatList: [],
      loading: false,
    };
  },
  methods: {
    async loadMyChatList() {
      this.loading = true;
      try {
        const res = await api.get('/chats/my');
        this.myChatList = res.data.result || res.data.data || [];
      } catch (e) {
        console.error('내 채팅방 목록 로드 실패:', e);
      } finally {
        this.loading = false;
      }
    },
    enterRoom(roomId) {
      this.$router.push(`/chat/page/${roomId}`);
    },
    async leaveRoom(roomId) {
      const ok = confirm('정말 이 채팅방에서 나가시겠습니까?');
      if (!ok) return;

      try {
        await api.delete(`/chats/${roomId}/leave`);
        // 나간 방을 리스트에서 제거
        this.myChatList = this.myChatList.filter(
          (room) => room.roomId !== roomId
        );
      } catch (e) {
        console.error('채팅방 나가기 실패:', e);
        alert('채팅방 나가기 중 오류가 발생했습니다.');
      }
    },
    async logout() {
      try {
        await api.post('/api/auth/logout');
      } catch (e) {
        console.error('로그아웃 요청 실패', e);
      } finally {
        localStorage.clear();
        this.$router.push('/');
      }
    },
  },
  mounted() {
    this.loadMyChatList();
  },
};
</script>

<style scoped>
@import './SharedStyle.css';
</style>
