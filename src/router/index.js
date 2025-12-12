/*
 * @file router/index.js
 * @author 이재
 * @version 1.0
 * @since 2025-12-10
 * @description
 * 애플리케이션 라우팅과 인증 기반 접근 제어를 담당하는 Vue Router 설정 파일입니다.
 */

import { createRouter, createWebHistory } from "vue-router"
import LoginPage from "@/views/LoginPage.vue";
import SignUp from "@/views/SignUp.vue";
import PostList from "@/views/PostList.vue";
import ChatPage from "@/views/ChatPage.vue";
import GroupChatList from "@/views/GroupChatList.vue";
import MyChatList from "@/views/MyChatList.vue";


const routes = [
    {
        path: '/signup',
        name: 'SignUp',
        component: SignUp
    },
    {
        path: '/',
        name: 'LoginPage',
        component: LoginPage
    },
    {
        path: '/post/list',
        name: 'PostList',
        component: PostList,
        meta: { requiresAuth: true }, 
    },
    {
        path: '/chat/page/:roomId',
        name: 'ChatPage',
        component: ChatPage,
        meta: { requiresAuth: true }, 
    },
    {
        path: '/group/chat/list',
        name: 'GroupChatList',
        component: GroupChatList,
        meta: { requiresAuth: true }, 
    },
    {
        path: '/my/chat/list',
        name: 'MyChatList',
        component: MyChatList,
        meta: { requiresAuth: true }, 
    }
]

const router = createRouter({
    history: createWebHistory(), 
    routes
});

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('accessToken'); // 토큰 유무만 체크

  if (to.meta.requiresAuth && !isLoggedIn) {
    // 로그인 필요한 페이지 + 비로그인 상태면 로그인 화면으로
    return next({ path: '/' });
  }

  next();
});

export default router;