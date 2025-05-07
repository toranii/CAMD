// ~/CAMD_/frontend/vue.config.js
const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  // (1) Babel로 변환할 의존성
  transpileDependencies: true,

  // (2) 개발 서버 설정
  devServer: {
    port: 3000,
  },

  // (3) Webpack 폴리필 설정: Node.js 코어 모듈 폴리필 제거
  configureWebpack: {
    resolve: {
      fallback: {
        http: false,
        https: false,
        stream: false,
        util: false,
        zlib: false,
        url: false,
        assert: false,
      },
    },
  },
});
