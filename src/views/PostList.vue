<!--
  @file NewsListView.vue
  @author 이재
  @version 1.0
  @since 2025-12-11
  @description
  기술 뉴스 피드 메인 화면을 담당하는 컴포넌트로,
  뉴스 목록 조회, 검색/필터/정렬, 페이징 기능을 제공하며
  게시글 상세 모달을 통해 좋아요 및 댓글 CRUD 기능을 처리합니다.
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

        <!-- 뉴스 리스트 필터 -->
        <v-card class="filter-card" elevation="2">
          <v-card-text>
            <v-row dense align="center">
              <v-col cols="12" md="5">
                <v-text-field
                  v-model="newsSearch"
                  placeholder="🔍뉴스 검색 (제목 · 요약)"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  @keyup.enter="onSearch"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-select
                  v-model="publisherFilter"
                  :items="publisherOptions"
                  item-title="label"
                  item-value="value"
                  label="출처"
                  density="compact"
                  hide-details="auto"
                  variant="outlined"
                  clearable
                />
              </v-col>

              <v-col cols="6" md="2">
                <v-btn-toggle
                  v-model="newsSort"
                  density="compact"
                  mandatory
                  class="sort-toggle"
                >
                  <v-btn
                    value="latest"
                    size="small"
                    variant="outlined"
                  >
                    🕒 최신순
                  </v-btn>
                  <v-btn
                    value="popular"
                    size="small"
                    variant="outlined"
                  >
                    🔥 인기순
                  </v-btn>
                </v-btn-toggle>
              </v-col>

              <v-col cols="6" md="2" class="text-right">
                <v-btn
                  size="small"
                  variant="outlined"
                  color="primary"
                  @click="refreshNews"
                >
                  <v-icon size="0" start>mdi-refresh</v-icon>
                  🔄 새로고침
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 로딩 -->
        <div v-if="newsLoading" class="mt-6">
          <v-skeleton-loader type="article, article, article" />
        </div>

        <!-- 뉴스 카드 리스트 -->
        <div v-else class="feed-list">
          <v-card
            v-for="item in newsItems"
            :key="item.id"
            class="feed-card mt-4"
            variant="outlined"
            @click="openPostDetail(item)"
          >
            <v-card-text>
              <v-row no-gutters>
                <!-- 썸네일 영역 -->
                <v-col
                  cols="12"
                  md="3"
                  v-if="item.thumbnailUrl"
                  class="pr-md-4 mb-3 mb-md-0"
                >
                  <v-img
                    :src="item.thumbnailUrl"
                    :alt="item.title"
                    height="110"
                    cover
                    class="rounded-lg"
                  >
                    <template #placeholder>
                      <v-row
                        class="fill-height ma-0"
                        align="center"
                        justify="center"
                      >
                        <v-progress-circular indeterminate size="24" />
                      </v-row>
                    </template>
                  </v-img>
                </v-col>

                <!-- 텍스트 영역 -->
                <v-col :cols="item.thumbnailUrl ? 12 : 12" :md="item.thumbnailUrl ? 9 : 12">
                  <div class="feed-card-header">
                    <div class="source-chip">
                      <span class="source-name">{{ item.publisher }}</span>
                      <span class="dot">·</span>
                      <span class="time">
                        {{ formatDate(item.publishedAt || item.createdAt) }}
                      </span>
                    </div>
                    <v-chip size="x-small" label class="category-pill">
                      {{ item.sourceName || '기타' }}
                    </v-chip>
                  </div>

                  <div class="title-line">
                    <div class="title-text">
                      {{ item.title }}
                    </div>
                  </div>

                  <div class="summary">
                    {{ item.summary || '요약 정보가 없습니다.' }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions class="feed-card-actions">
              <div class="left">
                <v-btn
                  variant="text"
                  size="small"
                  color="primary"
                  @click.stop="openPostDetail(item)"
                >
                  🔍 자세히 보기
                  <v-icon size="16" end>mdi-chevron-right</v-icon>
                </v-btn>
              </div>
              <div class="right">
                <div class="meta">
                  <v-icon size="0" class="mr-1">mdi-thumb-up-outline</v-icon>
                  <span>👍{{ item.likeCount || 0 }}</span>
                </div>
                <div class="meta ml-4">
                  <v-icon size="0" class="mr-1">mdi-comment-outline</v-icon>
                  <span>💬{{ item.commentCount || 0 }}</span>
                </div>
              </div>
            </v-card-actions>
          </v-card>

          <div v-if="!newsItems.length" class="empty-text">
            조건에 맞는 뉴스가 없습니다 🥲
          </div>

          <!-- 서버 페이징 -->
          <div
            v-if="newsTotalPages > 1"
            class="mt-6 d-flex justify-center"
          >
            <v-pagination
              v-model="newsPage"
              :length="newsTotalPages"
              rounded="circle"
              total-visible="5"
              @update:model-value="onPageChange"
            />
          </div>
        </div>

        <!-- ========== 상세 모달 (댓글 + 좋아요) ========== -->
        <v-dialog
          v-model="detailDialog"
          max-width="900"
        >
          <v-card v-if="selectedPost" class="detail-card">
            <v-card-title class="d-flex justify-space-between align-center">
              <div class="detail-title">
                {{ selectedPost.title }}
              </div>
              <v-btn icon="mdi-close" variant="text" @click="detailDialog = false" />
            </v-card-title>

            <v-card-subtitle class="d-flex justify-space-between align-center mt-1">
              <div class="d-flex flex-column">
                <span class="detail-source">
                  {{ selectedPost.publisher }} · {{ selectedPost.sourceName }}
                </span>
                <span class="detail-time">
                  {{ formatDate(selectedPost.publishedAt || selectedPost.createdAt) }}
                </span>
              </div>
              <v-btn
                size="small"
                color="primary"
                variant="outlined"
                @click="openOriginal(selectedPost.originalUrl)"
              >
                📋 원문 보기
                <v-icon size="0" end>mdi-open-in-new</v-icon>
              </v-btn>
            </v-card-subtitle>

            <v-card-text>
              <v-row>
                <!-- 상세 썸네일 -->
                <v-col cols="12" md="4" v-if="selectedPost.thumbnailUrl">
                  <v-img
                    :src="selectedPost.thumbnailUrl"
                    :alt="selectedPost.title"
                    height="180"
                    cover
                    class="rounded-lg mb-3"
                  />
                </v-col>

                <v-col :cols="selectedPost.thumbnailUrl ? 12 : 12" :md="selectedPost.thumbnailUrl ? 8 : 12">
                  <div class="detail-summary">
                    {{ selectedPost.summary || '요약 정보가 없습니다.' }}
                  </div>

                  <!-- 좋아요 영역 -->
                  <div class="mt-4 d-flex align-center">
                    <v-btn
                      size="small"
                      :color="likedPost ? 'primary' : ''"
                      variant="outlined"
                      @click="toggleLike(selectedPost)"
                    >
                      <v-icon size="0" start>
                        {{ likedPost ? 'mdi-thumb-up' : 'mdi-thumb-up-outline' }}
                      </v-icon>
                      👍
                    </v-btn>
                    <span class="ml-2 text-caption">
                      {{ likeCountForSelected }}개
                    </span>
                  </div>
                </v-col>
              </v-row>

              <!-- 댓글 영역 -->
              <v-divider class="my-4" />

              <div class="comment-section">
                <div class="comment-header">
                  <span class="comment-title">✏️ 댓글</span>
                  <span class="comment-count">{{ comments.length }}개</span>
                </div>

                <!-- 댓글 입력 -->
                <div class="d-flex align-center mt-2 mb-4">
                  <v-text-field
                    v-model="newComment"
                    placeholder="댓글을 입력하세요"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                    class="flex-grow-1 mr-2"
                    @keyup.enter="createComment"
                  />
                  <v-btn
                    color="primary"
                    @click="createComment"
                    :disabled="!newComment.trim()"
                  >
                    등록
                  </v-btn>
                </div>

                <!-- 댓글 리스트 -->
                <div v-if="commentsLoading">
                  <v-skeleton-loader type="list-item-two-line, list-item-two-line" />
                </div>
                <div v-else>
                  <div
                    v-for="comment in comments"
                    :key="comment.id"
                    class="comment-item"
                  >
                    <div class="comment-top">
                      <span class="comment-writer">
                        {{ comment.userName }}
                      </span>
                      <span class="comment-time">
                        {{ formatDate(comment.createdAt) }}
                      </span>
                    </div>
                    <div class="comment-content">
                      {{ comment.content }}
                    </div>
                    <!-- 필요하면 본인 댓글일 때만 삭제/수정 노출하는 로직 추가 가능 -->
                    <div class="comment-actions"
                    v-if="comment.userName === loginUserName">
                      <v-btn
                        size="x-small"
                        variant="text"
                        color="error"
                        @click="deleteComment(comment)"
                      >
                        삭제
                      </v-btn>
                    </div>
                  </div>

                  <div v-if="!comments.length" class="empty-text">
                    아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-dialog>

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from '@/api/axios';

export default {
  name: 'NewsListView',
  data() {
    return {
      newsItems: [],
      newsLoading: false,
      newsSearch: '',
      publisherFilter: null,
      publisherOptions: [
        { label: '전체', value: null },
        { label: '우아한형제들 기술 블로그', value: '우아한형제들 기술 블로그' },
        { label: '티방 기술 블로그', value: '티빙 기술 블로그' },
        { label: '토스 기술 블로그', value: '토스 기술 블로그' },
        { label: '카카오 기술 블로그', value: '카카오 기술 블로그' },
        { label: 'ZDNET 컴퓨팅', value: 'ZDNET 컴퓨팅' },          
        { label: '전자신문 SW', value: '전자신문 SW' },
      ],
      newsSort: 'latest', // latest | popular
      newsPage: 1,
      newsPageSize: 10,
      newsTotalPages: 1,

      username: '',

      // 상세 모달 관련
      detailDialog: false,
      selectedPost: null,
      likedPost: false,         
      comments: [],
      newComment: '',
      commentsLoading: false,
      loginUserName: '',
    };
  },
  computed: {
    likeCountForSelected() {
      if (!this.selectedPost) return 0;
      return this.selectedPost.likeCount || 0;
    },
  },
  methods: {
    async loadNews() {
      this.newsLoading = true;
      try {
        const params = {
          page: this.newsPage - 1,
          size: this.newsPageSize,
        };

        if (this.newsSort === 'popular') {
          params.sort = 'likeCount,DESC';
        } else {
          params.sort = 'id,DESC';
        }

        if (this.newsSearch) params.keyword = this.newsSearch;
        if (this.publisherFilter) params.publisher = this.publisherFilter;

        const res = await api.get('/posts', { params });
        const page = res.data.result;

        this.newsItems = page.content || [];
        this.newsTotalPages = page.totalPages || 1;
        this.newsPage = (page.number || 0) + 1;
      } catch (e) {
        console.error('뉴스 로드 실패:', e);
      } finally {
        this.newsLoading = false;
      }
    },
    refreshNews() {
      this.newsPage = 1;
      this.loadNews();
    },
    onSearch() {
      this.newsPage = 1;
      this.loadNews();
    },
    onPageChange(page) {
      this.newsPage = page;
      this.loadNews();
    },
    openOriginal(url) {
      if (!url) return;
      window.open(url, '_blank');
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return '';
      return d.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
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

    // === 상세 모달 관련 ===
    async openPostDetail(post) {
      this.detailDialog = true;

      try {
        // 상세 조회 API를 호출
        const res = await api.get(`/posts/${post.id}`);

        // 서버에서 받은 데이터로 교체
        const freshPostData = res.data.result;
        this.selectedPost = freshPostData;
        this.likedPost = !!freshPostData.isLiked;

        await this.loadComments(post.id);

      } catch (e) {
        console.error("상세 정보 로딩 실패", e);
        alert("게시글 정보를 불러오는데 실패했습니다.");
        this.detailDialog = false;
      }
    },

    async loadComments(postId) {
      this.commentsLoading = true;
      try {
        const res = await api.get(`/posts/${postId}/comments`);
        this.comments = res.data.result || [];
      } catch (e) {
        console.error('댓글 목록 로드 실패:', e);
      } finally {
        this.commentsLoading = false;
      }
    },

    async createComment() {
      if (!this.selectedPost) return;
      const content = this.newComment.trim();
      if (!content) return;

      try {
        await api.post(`/posts/${this.selectedPost.id}/comments`, {
          content,
        });

        this.newComment = '';
        await this.loadComments(this.selectedPost.id);

        // 댓글 수 갱신
        const target = this.newsItems.find(p => p.id === this.selectedPost.id);
        if (target) {
          target.commentCount = (target.commentCount || 0) + 1;
        }
        this.selectedPost.commentCount = (this.selectedPost.commentCount || 0) + 1;
      } catch (e) {
        console.error('댓글 작성 실패:', e);
        alert('댓글 작성에 실패했습니다.');
      }
    },

    async deleteComment(comment) {
      const commentId = comment.id || comment.commentId;
      if (!commentId) return;

      if (!confirm('정말 이 댓글을 삭제하시겠습니까?')) return;

      try {
        await api.delete(`/comments/${commentId}`);
        await this.loadComments(this.selectedPost.id);

        // 댓글 수 갱신
        const target = this.newsItems.find(p => p.id === this.selectedPost.id);
        if (target && (target.commentCount || 0) > 0) {
          target.commentCount -= 1;
        }
        if (this.selectedPost.commentCount > 0) {
          this.selectedPost.commentCount -= 1;
        }
      } catch (e) {
        console.error('댓글 삭제 실패:', e);
        alert('댓글 삭제에 실패했습니다.');
      }
    },

    async toggleLike(post) {
      if (!post) return;

      try {
        const postId = post.id;
        const target = this.newsItems.find(p => p.id === postId);

        if (!this.likedPost) {
          // 좋아요 추가
          await api.post(`/posts/${post.id}/likes`);
          this.likedPost = true;
          this.selectedPost.isLiked = true;
          if (target) target.isLiked = true;

          if (target) target.likeCount = (target.likeCount || 0) + 1;
          this.selectedPost.likeCount = (this.selectedPost.likeCount || 0) + 1;
        } else {
          // 좋아요 취소
          await api.delete(`/posts/${post.id}/likes`);
          this.likedPost = false;
          this.selectedPost.isLiked = false;
          if (target) target.isLiked = false;

          if (target && (target.likeCount || 0) > 0) target.likeCount -= 1;
          if (this.selectedPost.likeCount > 0) this.selectedPost.likeCount -= 1;
        }
      } catch (e) {
        console.error('좋아요 처리 실패:', e);
        alert('좋아요 처리 중 오류가 발생했습니다.');
      }
    },
  },
  watch: {
    newsSort() {
      this.newsPage = 1;
      this.loadNews();
    },
    publisherFilter() {
      this.newsPage = 1;
      this.loadNews();
    },
  },
  mounted() {
    this.loginUserName = localStorage.getItem('name');
    this.loadNews();
  },
};
</script>

<style scoped>
@import './SharedStyle.css';

.detail-card {
  border-radius: 16px;
}

.detail-title {
  font-size: 20px;
  font-weight: 700;
}

.detail-source {
  font-size: 13px;
  color: #777;
}

.detail-time {
  font-size: 12px;
  color: #999;
}

.detail-summary {
  font-size: 14px;
  line-height: 1.6;
}

/* 댓글 영역 스타일 */
.comment-section {
  margin-top: 4px;
}

.comment-header {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.comment-title {
  font-weight: 600;
  font-size: 14px;
}

.comment-count {
  font-size: 12px;
  color: #888;
}

.comment-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-top {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #888;
  margin-bottom: 2px;
}

.comment-writer {
  font-weight: 500;
}

.comment-content {
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.comment-actions {
  text-align: right;
}
</style>
