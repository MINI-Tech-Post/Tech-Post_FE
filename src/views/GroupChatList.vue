<!--
  @file GroupChatList.vue
  @author 이재
  @version 1.0
  @since 2025-12-11
  @description
  전체 공개 그룹 채팅방 목록을 조회하는 화면 컴포넌트로,
  채팅방 목록 조회, 채팅방 생성, 채팅방 참여(입장) 기능을 제공하며
  채팅 페이지로의 라우팅을 담당합니다.
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
            <div class="tab-title">📋 전체 채팅방 목록</div>
            <v-btn
              size="small"
              color="primary"
              variant="outlined"
              @click="createRoom"
            >
              <v-icon size="0" start>mdi-plus</v-icon>
              ✨ 채팅방 생성
            </v-btn>
          </v-card-text>
        </v-card>

        <div v-if="loading" class="mt-4">
          <v-skeleton-loader type="article, article" />
        </div>

        <v-card
          v-for="room in groupChatList"
          :key="room.roomid"
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
            <v-chip size="small" color="primary" variant="tonal">
              🟢 입장
            </v-chip>
          </v-card-text>
        </v-card>

        <div v-if="!groupChatList.length && !loading" class="empty-text">
          아직 생성된 채팅방이 없습니다. 첫 채팅방을 만들어보세요!
        </div>

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from '@/api/axios';

export default {
  name: 'GroupChatList',
  data() {
    return {
      groupChatList: [],
      loading: false,
    };
  },
  methods: {
    async loadGroupChatList() {
      this.loading = true;
      try {
        const res = await api.get('/chats');
        this.groupChatList = res.data.result || [];
      } catch (e) {
        console.error('전체 채팅방 목록 로드 실패:', e);
      } finally {
        this.loading = false;
      }
    },
    async enterRoom(roomId) {
      try {
        await api.post(`/chats/${roomId}/join`);
        this.$router.push(`/chat/page/${roomId}`);
      } catch (e) {
        console.error("채팅방 참여 실패", e);
        alert(e.response?.data?.message || '채팅방 입장에 실패했습니다.');
      }
    },
    async createRoom() {
      const roomName = window.prompt('생성할 채팅방 이름을 입력하세요.');
      if (!roomName) return;

      try {
        await api.post('/chats', null, {
          params: { roomName },
        });
        alert('채팅방이 생성되었습니다.');
        this.loadGroupChatList();
      } catch (e) {
        console.error('채팅방 생성 실패:', e);
        alert('채팅방 생성 중 오류가 발생했습니다.');
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
    this.loadGroupChatList();
  },
};
</script>

<style scoped>
@import './SharedStyle.css';
</style>
