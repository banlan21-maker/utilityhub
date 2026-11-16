-- theutilhub 관리자 공간 설정 (Supabase → SQL Editor 에 통째로 붙여 넣고 Run)
-- 여러 번 실행해도 안전하다 (if not exists / or replace).

-- 1) 피드백 관리용 컬럼: 숨기기·답변
alter table public.feedback add column if not exists hidden boolean not null default false;
alter table public.feedback add column if not exists reply text;
alter table public.feedback add column if not exists replied_at timestamptz;

-- 1-1) 피드백 접근 규칙: 방문자(공개 키)는 숨기지 않은 글 읽기 + 새 글 쓰기만.
--      답변·숨김은 서버 키(관리자)만 바꿀 수 있고, 남이 글을 고치거나 지울 수 없다.
--      기존 정책은 모두 지우고 아래 두 개만 남긴다.
alter table public.feedback enable row level security;
do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'feedback' loop
    execute format('drop policy %I on public.feedback', p.policyname);
  end loop;
end $$;
create policy "feedback_read_visible" on public.feedback
  for select to anon, authenticated using (hidden = false);
create policy "feedback_insert_plain" on public.feedback
  for insert to anon, authenticated with check (hidden = false and reply is null and replied_at is null);

-- 2) 방문 기록 — 개인을 알아볼 수 있는 값(IP·쿠키)은 저장하지 않는다.
--    visitor 는 날마다 바뀌는 해시라 하루 단위 방문자 수 세기에만 쓰인다.
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  path text not null,
  locale text,
  referrer text,
  country text,
  device text,
  visitor text,
  kind text not null default 'pv',   -- pv = 페이지 조회, ev = 버튼 이벤트
  event text
);
create index if not exists page_views_created_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx on public.page_views (path);
-- RLS 를 켜고 정책을 만들지 않으면 공개 키로는 읽기·쓰기가 막히고 서버 키만 접근한다.
alter table public.page_views enable row level security;

-- 3) 사이트 점검 기록
create table if not exists public.site_audits (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  total int not null,
  failed int not null,
  warned int not null default 0,
  results jsonb not null
);
alter table public.site_audits enable row level security;

-- 4) 통계 함수 (한국 시간 기준 날짜)
create or replace function public.admin_daily(days int)
returns table(day date, views bigint, visitors bigint)
language sql stable as $$
  select (created_at at time zone 'Asia/Seoul')::date as day,
         count(*) as views,
         count(distinct visitor) as visitors
  from public.page_views
  where kind = 'pv' and created_at >= now() - make_interval(days => days)
  group by 1
  order by 1;
$$;

create or replace function public.admin_top(days int, dim text, lim int default 20)
returns table(key text, views bigint, visitors bigint)
language sql stable as $$
  select case dim
           when 'path' then path
           when 'referrer' then coalesce(nullif(referrer, ''), '(direct)')
           when 'country' then coalesce(country, '?')
           when 'device' then coalesce(device, '?')
           when 'locale' then coalesce(locale, '?')
           else event
         end as key,
         count(*) as views,
         count(distinct visitor) as visitors
  from public.page_views
  where created_at >= now() - make_interval(days => days)
    and ((dim = 'event' and kind = 'ev') or (dim <> 'event' and kind = 'pv'))
  group by 1
  order by 2 desc
  limit lim;
$$;

-- 통계 함수는 서버 키로만 실행
revoke all on function public.admin_daily(int) from public, anon, authenticated;
revoke all on function public.admin_top(int, text, int) from public, anon, authenticated;
grant execute on function public.admin_daily(int) to service_role;
grant execute on function public.admin_top(int, text, int) to service_role;

-- 5) 사이트 설정 (첫 화면 방문자 숫자 표시 기준 등) — 관리자 화면에서 바꾼다
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
