import { latestAudit } from '@/lib/admin/data';
import { PageHead } from '../ui';
import AuditRunner from './AuditRunner';

export default async function AuditPage() {
  const last = await latestAudit();
  return (
    <>
      <PageHead
        title="사이트 점검"
        sub="사이트맵의 모든 페이지를 검색엔진이 처음 받는 서버 HTML로 검사합니다 — h1 1개, noindex 없음, canonical = 자기 주소, 제목·설명, 구조화 데이터, 본문 양, 영문 페이지의 한글."
      />
      <AuditRunner last={last.ok ? last.data : null} canSave={last.ok} />
    </>
  );
}
