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
            <v-form @submit.prevent="doSignup" ref="signupForm">
              <v-text-field
                v-model="username"
                label="아이디"
                type="text"
                prepend-inner-icon="mdi-account-outline"
                outlined
                dense
                hide-details="auto"
                :rules="usernameRules"
                class="mb-3"
              />

              <v-text-field
                v-model="name"
                label="이름"
                type="text"
                prepend-inner-icon="mdi-card-account-details-outline"
                outlined
                dense
                hide-details="auto"
                :rules="nameRules"
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
                회원가입
              </v-btn>
            </v-form>

            <div class="signup-text mt-6 text-center">
              이미 계정이 있으신가요?
              <a @click.prevent="$router.push('/')">로그인</a>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from '@/api/axios';

export default {
  name: 'SignupView',
  data() {
    return {
      username: '',
      password: '',
      name: '',

      usernameRules: [
        v => !!v || '아이디는 필수입니다.',
        v => (v && v.length >= 4 && v.length <= 20) || '아이디는 4~20자여야 합니다.',
        v => /^[a-zA-Z0-9]+$/.test(v) || '아이디는 영문과 숫자만 사용할 수 있습니다.',
      ],
      nameRules: [
        v => !!v || '이름은 필수입니다.',
        v => (v && v.length <= 30) || '이름은 30자 이하만 가능합니다.',
      ],
      passwordRules: [
        v => !!v || '비밀번호는 필수입니다.',
        v => (v && v.length >= 8 && v.length <= 20) || '비밀번호는 8~20자여야 합니다.',
        v => /^(?=.*[A-Za-z])(?=.*\d).*$/ .test(v) || '비밀번호는 영문과 숫자를 포함해야 합니다.',
      ],
    };
  },
  methods: {
    async doSignup() {
      const isValid = this.$refs.signupForm.validate();
      if (!isValid) return;

      try {
        const signupData = {
          username: this.username,
          name: this.name,
          password: this.password,
        };

        await api.post('/api/auth/signup', signupData);

        alert('회원가입이 완료되었습니다! 이제 로그인해 주세요.');
        this.$router.push('/');
      } catch (error) {
        console.error(
          '회원가입 실패:',
          error.response?.data?.message || error.message,
        );
        alert(error.response?.data?.message || '회원가입에 실패했습니다.');
      }
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

.signup-text {
  font-size: 13px;
  color: #666;
}

.signup-text a {
  color: #3a7afe;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}
</style>
