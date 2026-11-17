// 광고·후원 설정 — 이 파일 한 곳에서 켜고 끈다.

/**
 * 애드센스 광고 자리.
 * 승인 전에는 enabled=false (아무것도 그리지 않음).
 * 승인 후 애드센스에서 '디스플레이 광고 단위'를 만들어 슬롯 ID를 넣고 enabled=true.
 * 광고는 입력칸·버튼·결과 옆에 두지 않는다 — 설명글 사이와 페이지 하단에만 (SeoSection).
 */
export const ADS: { enabled: boolean; client: string; slots: { inContent: string; bottom: string } } = {
  enabled: false,
  client: 'ca-pub-9517850144901016',
  slots: {
    /** 설명글과 활용 사례 사이 */
    inContent: '',
    /** 자주 묻는 질문 아래 (페이지 하단) */
    bottom: '',
  },
};

/**
 * 후원 링크. 주소가 비어 있으면 버튼을 숨긴다.
 * 계좌번호·실명·개인 송금 링크는 절대 넣지 않는다.
 */
export const SUPPORT: { kofi: string; domestic: { nameKo: string; nameEn: string; url: string }; showInTools: boolean } = {
  /** 해외 — https://ko-fi.com/아이디 */
  kofi: '',
  /** 국내 — 투네이션 후원 페이지 주소 (다른 플랫폼으로 바꾸면 이름도 같이) */
  domestic: { nameKo: '투네이션', nameEn: 'Toonation', url: '' },
  /** 각 도구의 공유 버튼 아래에 작은 후원 안내 한 줄 (링크가 하나라도 있을 때만) */
  showInTools: false,
};

export const hasSupportLinks = () => Boolean(SUPPORT.kofi || SUPPORT.domestic.url);
