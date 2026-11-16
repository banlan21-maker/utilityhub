// 브라우저에서 방문·버튼 이벤트를 /api/track 으로 보낸다 (실패해도 화면에는 영향 없음)

function send(data: Record<string, string>) {
  if (typeof window === 'undefined') return;
  try {
    if (navigator.doNotTrack === '1') return;
    const body = JSON.stringify(data);
    if (navigator.sendBeacon?.('/api/track', new Blob([body], { type: 'application/json' }))) return;
    fetch('/api/track', { method: 'POST', body, keepalive: true, headers: { 'content-type': 'application/json' } }).catch(() => {});
  } catch { /* 무시 */ }
}

export function trackPageView(path: string) {
  let r = '';
  try {
    // 외부 유입 경로는 첫 페이지에서만 보낸다 (사이트 안 이동은 같은 referrer가 반복됨)
    if (!sessionStorage.getItem('uh_ref')) {
      r = document.referrer;
      sessionStorage.setItem('uh_ref', '1');
    }
  } catch { /* 저장소 막힘 */ }
  send({ p: path, r });
}

/** 도구 안 주요 버튼 사용 횟수 (예: trackEvent('tile:upload')) */
export function trackEvent(name: string) {
  if (typeof window === 'undefined') return;
  send({ p: window.location.pathname, e: name });
}
