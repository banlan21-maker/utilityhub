import { feedbackList, feedbackMigrated } from '@/lib/admin/data';
import { setupStatus } from '@/lib/admin/db';
import { PageHead, SetupGuide } from '../ui';
import FeedbackManager from './FeedbackManager';

export default async function FeedbackPage() {
  const res = await feedbackList();
  if (!res.ok) {
    return (
      <>
        <PageHead title="피드백" />
        <SetupGuide need={setupStatus().serviceKey ? ['sql'] : ['key']} />
      </>
    );
  }
  const migrated = feedbackMigrated(res.data);
  return (
    <>
      <PageHead title="피드백" sub="숨긴 글은 게시판에 보이지 않고, 답변은 게시판의 글 아래에 표시됩니다. 삭제는 되돌릴 수 없습니다." />
      {!migrated && <div style={{ marginBottom: '1rem' }}><SetupGuide need={['sql']} /></div>}
      <FeedbackManager rows={res.data} canManage={migrated} />
    </>
  );
}
