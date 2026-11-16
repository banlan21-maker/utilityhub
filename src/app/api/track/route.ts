// 방문·이벤트 기록. IP·쿠키는 저장하지 않고, 하루마다 바뀌는 해시로 그날의 방문자 수만 센다.
import { createHash } from 'node:crypto';
import { adminDb } from '@/lib/admin/db';

const BOT = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|lighthouse|pagespeed|gtmetrix|curl|wget|python|axios|node-fetch|go-http|java\//i;
const OWN_HOST = /(^|\.)theutilhub\.com$/i;
const done = () => new Response(null, { status: 204 });

const kstDay = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

export async function POST(req: Request) {
  const db = adminDb();
  if (!db) return done();

  const ua = req.headers.get('user-agent') ?? '';
  if (!ua || BOT.test(ua)) return done();
  // 다른 사이트에서 보낸 요청은 버린다
  const origin = req.headers.get('origin') ?? req.headers.get('referer') ?? '';
  try {
    const host = new URL(origin).hostname;
    if (!OWN_HOST.test(host) && host !== 'localhost') return done();
  } catch {
    return done();
  }

  let body: { p?: unknown; r?: unknown; e?: unknown };
  try {
    body = JSON.parse(await req.text());
  } catch {
    return done();
  }
  const path = String(body.p ?? '').split('?')[0].slice(0, 200);
  if (!path.startsWith('/') || path.startsWith('/admin') || path.startsWith('/api')) return done();
  const event = typeof body.e === 'string' ? body.e.replace(/[^\w:.-]/g, '').slice(0, 60) : '';

  let referrer = '';
  if (typeof body.r === 'string' && body.r) {
    try {
      const h = new URL(body.r).hostname.replace(/^www\./, '');
      if (!OWN_HOST.test(h)) referrer = h;
    } catch { /* 잘못된 주소는 무시 */ }
  }

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
  const salt = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').slice(-24);
  const visitor = createHash('sha256').update(`${salt}|${kstDay()}|${ip}|${ua}`).digest('hex').slice(0, 16);
  const seg = path.split('/')[1];

  await db.from('page_views').insert({
    path,
    locale: seg === 'ko' || seg === 'en' ? seg : null,
    referrer,
    country: req.headers.get('x-vercel-ip-country'),
    device: /Mobi|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop',
    visitor,
    kind: event ? 'ev' : 'pv',
    event: event || null,
  });

  // 가끔 180일 지난 기록을 정리 (무료 용량 보호)
  if (Math.random() < 0.01) {
    await db.from('page_views').delete().lt('created_at', new Date(Date.now() - 180 * 86400_000).toISOString());
  }
  return done();
}
