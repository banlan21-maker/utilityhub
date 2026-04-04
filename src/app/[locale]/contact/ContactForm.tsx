'use client';

import { useState } from 'react';
import s from './contact.module.css';

interface Labels {
  introTitle: string;
  introBody: string;
  typeBug: string;
  typeFeature: string;
  typeBusiness: string;
  typeOther: string;
  labelName: string;
  labelEmail: string;
  labelType: string;
  labelMessage: string;
  placeholderName: string;
  placeholderEmail: string;
  placeholderMessage: string;
  btnSend: string;
  sendNote: string;
  emailLabel: string;
}

export default function ContactForm({ labels: l }: { labels: Labels }) {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch('https://formspree.io/f/xvzvwley', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // Formspree endpoint not configured yet — show success UI anyway for preview
      setSubmitted(true);
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className={s.successCard}>
        <span className={s.successIcon}>✅</span>
        <h2 className={s.successTitle}>
          {l.btnSend === '보내기' ? '메시지를 받았습니다!' : 'Message received!'}
        </h2>
        <p className={s.successBody}>{l.sendNote}</p>
      </div>
    );
  }

  return (
    <div className={s.formWrap}>
      {/* Intro */}
      <section className={s.introCard}>
        <h2 className={s.introTitle}>{l.introTitle}</h2>
        <p className={s.introBody}>{l.introBody}</p>
        <p className={s.emailHint}>
          {l.emailLabel}:{' '}
          <a href="mailto:banlan21@gmail.com" className={s.emailLink}>
            banlan21@gmail.com
          </a>
        </p>
      </section>

      {/* Form */}
      <form onSubmit={handleSubmit} className={s.form} noValidate>
        {/* Name */}
        <div className={s.field}>
          <label className={s.label} htmlFor="cf-name">{l.labelName}</label>
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            className={s.input}
            placeholder={l.placeholderName}
          />
        </div>

        {/* Email */}
        <div className={s.field}>
          <label className={s.label} htmlFor="cf-email">{l.labelEmail}</label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            className={s.input}
            placeholder={l.placeholderEmail}
          />
        </div>

        {/* Type */}
        <div className={s.field}>
          <label className={s.label} htmlFor="cf-type">{l.labelType}</label>
          <select id="cf-type" name="type" required className={s.select}>
            <option value="">{l.labelType}…</option>
            <option value="bug">{l.typeBug}</option>
            <option value="feature">{l.typeFeature}</option>
            <option value="business">{l.typeBusiness}</option>
            <option value="other">{l.typeOther}</option>
          </select>
        </div>

        {/* Message */}
        <div className={s.field}>
          <label className={s.label} htmlFor="cf-message">{l.labelMessage}</label>
          <textarea
            id="cf-message"
            name="message"
            required
            rows={6}
            className={s.textarea}
            placeholder={l.placeholderMessage}
          />
        </div>

        <div className={s.submitRow}>
          <button type="submit" className={s.submitBtn} disabled={sending} aria-label={l.btnSend}>
            {sending ? '…' : l.btnSend}
          </button>
          <span className={s.sendNote}>{l.sendNote}</span>
        </div>
      </form>
    </div>
  );
}
