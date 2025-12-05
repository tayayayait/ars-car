<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1MUpIbrI7njpvwpCAsqp_VpFuyc5RGInz

## Run Locally

**Prerequisites:** Node.js

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Frontend (Vite):

- `VITE_API_BASE_URL` – 백엔드 API 서버 주소  
  - 예: `http://localhost:4000`

Backend (Express, in `server/src/index.ts`):

- `PORT` – API 서버 포트 (기본값: `4000`)
- `JWT_SECRET` – 인증 토큰 서명을 위한 시크릿 문자열 (개발용은 임의 값, 운영은 안전한 값 필수)

필요하다면 루트에 `.env` / `.env.local` 등을 만들어 위 값을 설정할 수 있습니다.

### 3. Run the app

터미널 2개에서 다음을 실행합니다.

```bash
# 1) API 서버 (Express)
npm run dev:server

# 2) 프런트엔드 (Vite)
npm run dev
```

브라우저에서 Vite 앱을 열고, `VITE_API_BASE_URL`에 설정한 포트의 API 서버가 떠 있는지 확인하세요.
