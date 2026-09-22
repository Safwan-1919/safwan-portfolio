/**
 * Author room: biography, career timeline, awards and the long-form field notes
 * that also serve as the crawlable copy of the page.
 */

import type { ReactNode } from 'react';
import { content } from '../../../content/portfolio';
import { DoodleIcon } from '../Sketch';
import { Longform } from '../Hud';

export function AboutSection(): ReactNode {
  const identity = content.identity;

  return (
    <>
      <section className="sheet__section" aria-labelledby="about-bio">
        <div className="sheet__section-head">
          <h3 className="sheet__section-title" id="about-bio">
            Who is holding the pencil
          </h3>
          <span className="sheet__section-note">{identity.location}</span>
        </div>

        {identity.bio.map((paragraph) => (
          <p className="sheet__prose" key={paragraph.slice(0, 24)} data-reveal>
            {paragraph}
          </p>
        ))}

        <dl className="metrics" style={{ marginTop: 24 }}>
          {identity.stats.map((stat) => (
            <div key={stat.label} data-reveal>
              <dt className="metrics__label">{stat.label}</dt>
              <dd className="metrics__value">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <div className="card__actions" style={{ marginTop: 20 }}>
          <a className="sketch-btn" href={identity.resumeUrl} download>
            Download the CV <span className="sketch-btn__arrow">↓</span>
          </a>
          <a className="sketch-btn sketch-btn--ghost" href={`mailto:${identity.email}`}>
            {identity.email}
          </a>
        </div>
      </section>

      <section className="sheet__section" aria-labelledby="about-timeline">
        <div className="sheet__section-head">
          <h3 className="sheet__section-title" id="about-timeline">
            The long way round
          </h3>
          <span className="sheet__section-note">roles, internships and one team lead seat</span>
        </div>

        <ol className="timeline">
          {content.timeline.map((entry) => (
            <li className="timeline__item" key={`${entry.company}-${entry.period}`} data-reveal>
              <p className="timeline__period">{entry.period}</p>
              <h4 className="timeline__role">{entry.role}</h4>
              <p className="timeline__company">{entry.company}</p>
              <p className="timeline__summary">{entry.summary}</p>
              <div className="timeline__stack">
                {entry.stack.map((tech) => (
                  <span className="tag" key={tech}>
                    {tech}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="sheet__section" aria-labelledby="about-education">
        <div className="sheet__section-head">
          <h3 className="sheet__section-title" id="about-education">
            Education
          </h3>
          <span className="sheet__section-note">{content.education[0]?.degree ?? 'Education'}</span>
        </div>

        <ol className="timeline">
          {content.education.map((entry) => (
            <li className="timeline__item" key={entry.degree} data-reveal>
              <p className="timeline__period">{entry.period}</p>
              <h4 className="timeline__role">{entry.degree}</h4>
              <p className="timeline__company">{entry.institution}</p>
              <p className="timeline__summary">{entry.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="sheet__section" aria-labelledby="about-awards">
        <div className="sheet__section-head">
          <h3 className="sheet__section-title" id="about-awards">
            Pinned to the studio wall
          </h3>
          <span className="sheet__section-note">hackathons, podiums and one 24-hour sprint</span>
        </div>

        <div className="cards">
          {content.awards.map((award) => (
            <article className="award" key={award.id} data-reveal>
              <DoodleIcon kind={award.kind} alt={`${award.title} sketch`} size={54} />
              <div>
                <h4 className="award__title">{award.title}</h4>
                <p className="award__issuer">
                  {award.issuer} · {award.year}
                </p>
                <p className="award__note">{award.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sheet__section" aria-labelledby="about-notes">
        <div className="sheet__section-head">
          <h3 className="sheet__section-title" id="about-notes">
            Field notes
          </h3>
          <span className="sheet__section-note">the long version, for readers and robots</span>
        </div>
        <Longform visible />
      </section>
    </>
  );
}