/*
 * @file plugins/vuetify.js
 * @author 이재
 * @version 1.0
 * @since 2025-12-10
 * @description
 * 애플리케이션 전반에서 사용되는 Vuetify 설정 및 테마 정의를 담당합니다.
 */


import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,

  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#3A7AFE',
          secondary: '#6C8EFF',
          background: '#F5F7FF'
        },
      },
    },
  },
})
