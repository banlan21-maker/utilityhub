import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import NavigationActions from '@/app/components/NavigationActions';
import ContactForm from './ContactForm';
import s from './contact.module.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const BASE = 'https://www.theutilhub.com';
  const title = isKo ? '문의하기 | Utility Hub' : 'Contact Us | Utility Hub';
  const description = isKo
    ? '버그 신고, 기능 제안, 비즈니스 문의를 보내주세요. 영업일 기준 1~3일 이내 답변합니다.'
    : 'Send bug reports, feature suggestions, or business inquiries. We respond within 1–3 business days.';
  const canonical = `${BASE}/${locale}/contact`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ko: `${BASE}/ko/contact`,
        en: `${BASE}/en/contact`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Utility Hub',
      locale: isKo ? 'ko_KR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Contact' });

  const labels = {
    introTitle: t('intro_title'),
    introBody: t('intro_body'),
    typeBug: t('type_bug'),
    typeFeature: t('type_feature'),
    typeBusiness: t('type_business'),
    typeOther: t('type_other'),
    labelName: t('label_name'),
    labelEmail: t('label_email'),
    labelType: t('label_type'),
    labelMessage: t('label_message'),
    placeholderName: t('placeholder_name'),
    placeholderEmail: t('placeholder_email'),
    placeholderMessage: t('placeholder_message'),
    btnSend: t('btn_send'),
    sendNote: t('send_note'),
    emailLabel: t('email_label'),
  };

  return (
    <main className={s.main}>
      <NavigationActions />

      <header className={s.hero}>
        <div className={s.heroIcon}>✉️</div>
        <h1 className={s.heroTitle}>{t('title')}</h1>
      </header>

      <ContactForm labels={labels} />
    </main>
  );
}
