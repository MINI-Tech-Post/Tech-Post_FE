<!--
  @file ChatPage.vue
  @author 이재
  @version 1.0
  @since 2025-12-11
  @description
  실시간 채팅방 화면을 담당하는 컴포넌트로,
  채팅방 히스토리 조회 후 SockJS + STOMP 기반 WebSocket 연결을 수행하고
  메시지 구독/수신 및 전송 기능을 제공합니다.
  라우트 이동 및 컴포넌트 언마운트 시 연결을 해제하여 리소스를 정리합니다.
-->

<template>
  <v-container fluid class="feed-page">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="9">

        <!-- 공통 헤더  -->
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

        <!-- 상단 탭 네비 -->
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

        <!-- 채팅 카드 -->
        <v-card class="feed-card mt-4" elevation="3">
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="tab-title">
              👥 {{ roomName || `채팅방 #${roomId}` }}
            </div>
            <v-btn
              size="small"
              variant="text"
              @click="$router.back()"
            >
              <v-icon size="0" start>mdi-arrow-left</v-icon>
              📋 목록으로
            </v-btn>
          </v-card-title>

          <v-divider />

          <v-card-text>
            <!-- 채팅 메시지 영역 -->
            <div class="chat-box">
              <div
                v-for="(msg, index) in messages"
                :key="index"
                :class="[
                  'chat-message',
                  msg.senderId === senderId ? 'sent' : 'received'
                ]"
              >
                <div class="sender-info">
                  <strong>{{ msg.senderName }}</strong>
                </div>
                <div class="message-bubble">
                  {{ msg.message }}
                </div>
              </div>

              <div v-if="!messages.length && !loading" class="empty-text">
                아직 메시지가 없습니다. 첫 메시지를 보내보세요!
              </div>
            </div>

            <!-- 입력 영역 -->
            <div class="mt-4 d-flex align-center">
              <v-text-field
                v-model="newMessage"
                label="메시지 입력"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="flex-grow-1 mr-2"
                @keyup.enter="sendMessage"
              />
              <v-btn
                color="primary"
                @click="sendMessage"
              >
                전송
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';
import api from '@/api/axios';

export default {
  name: 'ChatRoomView',
  data() {
    return {
      roomId: null,
      roomName: '',
      senderName: null,   
      senderId: null,
      messages: [],
      newMessage: '',
      stompClient: null,
      accessToken: '',
      loading: false,
    };
  },

  async created() {
    this.roomId = this.$route.params.roomId;
    this.accessToken = localStorage.getItem('accessToken');
    this.senderId = localStorage.getItem('username');
    this.senderName = localStorage.getItem('name');

    if (this.$route.query.roomName) {
      this.roomName = this.$route.query.roomName;
    } else {
      try {
        const res = await api.get('/chats');
        const list = res.data.result || [];
        const room = list.find(r => String(r.roomId) === String(this.roomId));
        if (room) this.roomName = room.roomName;
      } catch (e) {
        console.error('채팅방 이름 로드 실패:', e);
      }
    }

    await this.loadHistory();
    this.connectWebsocket();
  },

  beforeRouteLeave(to, from, next) {
    this.disconnectWebSocket();
    next();
  },
  beforeUnmount() {
    this.disconnectWebSocket();
  },

  methods: {
    async loadHistory() {
      this.loading = true;
      try {
        const res = await api.get(`/chats/history/${this.roomId}`);
        this.messages = res.data.result || [];
        this.$nextTick(this.scrollToBottom);
      } catch (e) {
        console.error('채팅 히스토리 로드 실패:', e);
      } finally {
        this.loading = false;
      }
    },

    connectWebsocket() {
      if (this.stompClient && this.stompClient.connected) return;

      const sockJs = new SockJS(`${process.env.VUE_APP_API_BASE_URL}/connect`);
      this.stompClient = Stomp.over(sockJs);

      this.stompClient.connect(
        {
          Authorization: `Bearer ${this.accessToken}`,
        },
        () => {
          this.stompClient.subscribe(
            `/topic/${this.roomId}`,
            (message) => {
              try {
                const parsed = JSON.parse(message.body);
                this.messages.push(parsed);
                this.scrollToBottom();
              } catch (e) {
                console.error('메시지 파싱 실패:', e);
              }
            },
            {
              Authorization: `Bearer ${this.accessToken}`,
            }
          );
        },
        (error) => {
          console.error('STOMP 연결 실패:', error);
        }
      );
    },

    sendMessage() {
      if (!this.stompClient || !this.stompClient.connected) {
        alert('서버와의 연결이 끊어졌습니다. 잠시 후 다시 시도해 주세요.');
        return;
      }

      if (this.newMessage.trim() === '') return;

      const chatMessage = {
        senderId: this.senderId,
        message: this.newMessage,
        senderName: this.senderName, 
      };

      this.stompClient.send(
        `/publish/${this.roomId}`,
        JSON.stringify(chatMessage)
      );

      this.newMessage = '';
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const chatBox = this.$el.querySelector('.chat-box');
        if (chatBox) {
          chatBox.scrollTop = chatBox.scrollHeight;
        }
      });
    },

    disconnectWebSocket() {
      if(this.stompClient && this.stompClient.connected){
                this.stompClient.unsubscribe(`/topic/${this.roomId}`);
                this.stompClient.disconnect();
            }
    },

    async logout() {
      try {
        await api.post('/api/auth/logout');
      } catch (e) {
        console.error('로그아웃 요청 실패:', e);
      } finally {
        localStorage.clear();
        this.$router.push('/');
      }
    },
  },
};
</script>

<style scoped>
@import './SharedStyle.css';

.chat-box {
  height: 380px;
  overflow-y: auto;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  background-color: #fafbff;
}

.chat-message {
  max-width: 70%;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.chat-message.sent {
  margin-left: auto;
  align-items: flex-end;
}

.chat-message.received {
  margin-right: auto;
  align-items: flex-start;
}

.sender-info {
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
}

.message-bubble {
  padding: 8px 12px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

.chat-message.sent .message-bubble {
  background-color: #3a7afe;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.chat-message.received .message-bubble {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
}
</style>
