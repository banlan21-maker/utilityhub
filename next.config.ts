import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

// 옛 주소·로케일 없는 주소·www 없는 주소의 리디렉션은 src/middleware.ts 한 곳에서
// 최종 주소로 한 번에 처리한다 (여기에 두면 미들웨어보다 먼저 실행돼 단계가 늘어난다).
const nextConfig: NextConfig = {
  // 끝 슬래시 제거도 미들웨어에서 다른 규칙과 함께 한 번에 처리한다
  skipTrailingSlashRedirect: true,
  // 첫 화면 "마지막 업데이트" 표시용 (배포 시각)
  env: { BUILD_TIME: new Date().toISOString() },
};

export default withNextIntl(nextConfig);
