<template>
  <v-container fluid class="login-page">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="login-card" elevation="10">
          <v-card-text class="text-center pb-0">
            <div class="logo">TechPost</div>
            <div class="subtitle">테크 뉴스 & 개발 커뮤니티</div>
          </v-card-text>

          <v-card-text>
            <v-form @submit.prevent="doLogin" ref="loginForm">
              <v-text-field
                v-model="username"
                label="아이디"
                type="text"
                prepend-inner-icon="mdi-email-outline"
                outlined
                dense
                hide-details="auto"
                :rules="usernameRules"
                class="mb-3"
              />

              <v-text-field
                v-model="password"
                label="비밀번호"
                type="password"
                prepend-inner-icon="mdi-lock-outline"
                outlined
                dense
                hide-details="auto"
                :rules="passwordRules"
                class="mb-4"
              />

              <v-btn
                type="submit"
                color="primary"
                block
                class="login-btn"
              >
                로그인
              </v-btn>
            </v-form>

            <div class="divider">
              <span>또는 소셜 계정으로 로그인</span>
            </div>

            <v-row class="mt-2" no-gutters>
              <v-col cols="4" class="d-flex justify-center">
                <img
                    src="@/assets/google_login.png"
                    style="max-height:40px; width:auto; cursor:pointer;"
                    @click="googleLogin()"
                />
              </v-col>
              <v-col cols="4" class="d-flex justify-center">
                <img
                    src="@/assets/kakao_login.png"
                    style="max-height:40px; width:auto; cursor:pointer;"
                    @click="kakaoLogin()"
                />
              </v-col>
              <v-col cols="4" class="d-flex justify-center">
                <img
                    src="@/assets/naver_login.png"
                    style="max-height:40px; width:auto; cursor:pointer;"
                    @click="naverLogin()"
                />
              </v-col>
            </v-row>

            <div class="signup-text mt-6 text-center">
              아직 계정이 없다면?
              <a href="/signup">회원가입</a>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from '@/api/axios';
import { jwtDecode } from 'jwt-decode';

export default {
  data() {
    return {
      username: '',
      password: '',

      usernameRules: [
        v => !!v || '아이디는 필수입니다.',
        v => (v && v.length >= 4 && v.length <= 20) || '아이디는 4~20자여야 합니다.',
        v => /^[a-zA-Z0-9]+$/.test(v) || '아이디는 영문과 숫자만 사용할 수 있습니다.',
      ],
      passwordRules: [
        v => !!v || '비밀번호는 필수입니다.',
        v => (v && v.length >= 8 && v.length <= 20) || '비밀번호는 8~20자여야 합니다.',
        v => /^(?=.*[A-Za-z])(?=.*\d).*$/ .test(v) || '비밀번호는 영문과 숫자를 포함해야 합니다.',
      ],
    };
  },
  methods: {
    async doLogin() {
        const isValid = this.$refs.loginForm.validate();
        if (!isValid) return;

        try {
            const response = await api.post('/api/auth/login', {
            username: this.username,
            password: this.password,
            });

            // 백엔드: Authorization 헤더로 Access Token 전달
            const authHeader = response.headers['authorization'];
            if (!authHeader) {
            console.error("Authorization 헤더가 없습니다.");
            alert("로그인에 실패했습니다.");
            return;
            }

            const accessToken = authHeader.split(" ")[1];

            // axios 기본 헤더에 설정
            api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
            localStorage.setItem("accessToken", accessToken);

            // JWT 디코딩
            const decoded = jwtDecode(accessToken);
            localStorage.setItem("username", decoded.sub);
            localStorage.setItem("role", decoded.role);
            localStorage.setItem("name", decoded.name);
            

            this.$router.push('/post/list');
        } catch (error) {
            console.error("로그인 오류:", error.response?.data || error.message);
            alert("아이디 또는 비밀번호를 다시 확인해주세요.");
        }
    },
    googleLogin() {
      window.location.href = `${process.env.VUE_APP_API_BASE_URL}/oauth2/authorization/google`;
    },
    kakaoLogin() {
      window.location.href = `${process.env.VUE_APP_API_BASE_URL}/oauth2/authorization/kakao`;
    },
    naverLogin() {
      window.location.href = `${process.env.VUE_APP_API_BASE_URL}/oauth2/authorization/naver`;
    },
  },
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #eef3ff, #dbe6ff);
}

.login-card {
  border-radius: 20px;
  padding-top: 24px;
  padding-bottom: 24px;
}

.logo {
  font-size: 28px;
  font-weight: 700;
  color: #3a7afe;
}

.subtitle {
  font-size: 13px;
  color: #7a7a7a;
  margin-top: 4px;
  margin-bottom: 20px;
}

.login-btn {
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.divider {
  margin: 24px 0 12px;
  position: relative;
  text-align: center;
  font-size: 12px;
  color: #aaa;
}

.divider span::before,
.divider span::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 30%;
  height: 1px;
  background-color: #e0e0e0;
}

.divider span::before {
  left: 8%;
}

.divider span::after {
  right: 8%;
}

.social-img {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  border-radius: 8px;
}

.social-img:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.signup-text {
  font-size: 13px;
  color: #666;
}

.signup-text a {
  color: #3a7afe;
  font-weight: 600;
  text-decoration: none;
}
</style>
