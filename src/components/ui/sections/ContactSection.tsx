/**
 * Post room: services, socials, the letter form and the FAQ.
 *
 * NOTE: this is a static theme - the form validates locally and then either
 * posts to `VITE_CONTACT_ENDPOINT` (Formspree, Basin, your own API, ...) when
 * that variable is set, or opens the visitor's mail client.
 */

import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { content } from '../../../content/portfolio';
import { useExperience } from '../../../lib/store';

const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined;

interface LetterState {
  name: string;
  email: string;
  company: string;
  scope: string;
  budget: string;
  message: string;
}

const EMPTY_LETTER: LetterState = {
  name: '',
  email: '',
  company: '',
  scope: 'full-stack product',
  budget: '₹50k – ₹1.5L',
  message: '',
};

export function ContactSection(): ReactNode {
  const { unlock } = useExperience();
  const [letter, setLetter] = useState<LetterState>(EMPTY_LETTER);
  const [status, setStatus] = useState('');
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(content.faqs[0]?.q ?? null);

  const scopes = useMemo(
    () => ['full-stack product', 'mobile app (RN · Expo)', 'web platform', 'technical leadership', 'other'],
    [],
  );

  const update =
    (key: keyof LetterState) =>
    (event: { target: { value: string } }): void =>
      setLetter((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!letter.name.trim() || !letter.email.includes('@') || letter.message.trim().length < 12) {
      setStatus('Almost — I need a name, a valid email and a few more words in the message.');
      return;
    }

    setStatus('Folding the letter…');

    if (ENDPOINT) {
      try {
        const response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(letter),
        });
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        setStatus('Sent. Thank you — expect a reply within two working days.');
        setSent(true);
        unlock('letter-sent');
        setLetter(EMPTY_LETTER);
        return;
      } catch {
        setStatus('The endpoint refused the letter, so I opened your mail client instead.');
      }
    }

    const subject = encodeURIComponent(
      `Project enquiry — ${letter.name}${letter.company ? ` (${letter.company})` : ''}`,
    );
    const body = encodeURIComponent(
      `Name: ${letter.name}\nEmail: ${letter.email}\nCompany: ${letter.company || '—'}\nScope: ${letter.scope}\nBudget: ${letter.budget}\n\n${letter.message}`,
    );
    window.location.href = `mailto:${content.identity.email}?subject=${subject}&body=${body}`;
    setStatus('Your mail client is open with the letter pre-filled. Send it when ready.');
    setSent(true);
    unlock('letter-sent');
  };

  return (
    <>
      <section className="sheet__section" aria-labelledby="contact-letter">
        <div className="sheet__section-head">
          <h3 className="sheet__section-title" id="contact-letter">
            Write a letter
          </h3>
          <span className="sheet__section-note">{content.identity.availability}</span>
        </div>

        <form className="letter" onSubmit={handleSubmit} noValidate>
          <div className="letter__row">
            <label className="field">
              <span className="field__label">Your name</span>
              <input
                className="field__input"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={letter.name}
                onChange={update('name')}
                placeholder="Jordan Bell"
              />
            </label>

            <label className="field">
              <span className="field__label">Email</span>
              <input
                className="field__input"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={letter.email}
                onChange={update('email')}
                placeholder="you@company.com"
              />
            </label>
          </div>

          <div className="letter__row">
            <label className="field">
              <span className="field__label">Company (optional)</span>
              <input
                className="field__input"
                name="company"
                type="text"
                autoComplete="organization"
                value={letter.company}
                onChange={update('company')}
                placeholder="Studio, brand or product team"
              />
            </label>

            <label className="field">
              <span className="field__label">What do you need?</span>
              <select className="field__select" name="scope" value={letter.scope} onChange={update('scope')}>
                {scopes.map((scope) => (
                  <option key={scope} value={scope}>
                    {scope}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field__label">Budget signal</span>
              <select className="field__select" name="budget" value={letter.budget} onChange={update('budget')}>
                {['under ₹50k', '₹50k – ₹1.5L', '₹1.5L – ₹4L', '₹4L+', 'not sure yet'].map((band) => (
                  <option key={band} value={band}>
                    {band}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            <span className="field__label">The story so far</span>
            <textarea
              className="field__textarea"
              name="message"
              required
              value={letter.message}
              onChange={update('message')}
              placeholder="What are you building, who is it for, and when does it need to launch?"
            />
            <span className="field__hint">
              {ENDPOINT
                ? 'Posts to your configured endpoint.'
                : 'No backend configured — this opens your mail client with everything pre-filled.'}
            </span>
          </label>

          <div className="letter__actions">
            <button type="submit" className="sketch-btn sketch-btn--solid">
              Send the letter <span className="sketch-btn__arrow">→</span>
            </button>
            <p className={`letter__status${sent ? ' is-sent' : ''}`} role="status" aria-live="polite">
              {status}
            </p>
          </div>
        </form>
      </section>

      <section className="sheet__section" aria-labelledby="contact-services">
        <div className="sheet__section-head">
          <h3 className="sheet__section-title" id="contact-services">
            Ways to work together
          </h3>
          <span className="sheet__section-note">indicative ranges, always scoped per project</span>
        </div>

        <div className="cards">
          {content.services.map((service) => (
            <article className="card service" key={service.id} data-reveal>
              <h4 className="card__title">{service.title}</h4>
              <p className="service__price">{service.price}</p>
              <p className="card__text">{service.blurb}</p>
              <ul className="bullet-list">
                {service.deliverables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="sheet__section" aria-labelledby="contact-socials">
        <div className="sheet__section-head">
          <h3 className="sheet__section-title" id="contact-socials">
            Or find me here
          </h3>
          <span className="sheet__section-note">replies within two working days</span>
        </div>

        <div className="cards">
          {content.socials.map((social) => (
            <a
              className="social"
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer me"
              data-reveal
            >
              <span>
                <span className="social__label">{social.label}</span>
                <span className="social__handle"> {social.handle}</span>
              </span>
              <span className="social__hint">{social.hint} ↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="sheet__section" aria-labelledby="contact-faq">
        <div className="sheet__section-head">
          <h3 className="sheet__section-title" id="contact-faq">
            Before you ask
          </h3>
          <span className="sheet__section-note">the five questions I always get</span>
        </div>

        {content.faqs.map((faq) => {
          const open = openFaq === faq.q;
          return (
            <div className={`faq${open ? ' is-open' : ''}`} key={faq.q}>
              <button
                type="button"
                className="faq__question"
                aria-expanded={open}
                onClick={() => setOpenFaq(open ? null : faq.q)}
              >
                {faq.q}
                <span className="faq__mark" aria-hidden="true">
                  +
                </span>
              </button>
              <div className="faq__answer">
                <div>{faq.a}</div>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}