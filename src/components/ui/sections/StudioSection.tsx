/**
 * Studio room: the stack, the tools and the awards. Skill meters are drawn as
 * SVG strokes so they keep the hand-drawn language of the corridor.
 */

import { useMemo, type ReactNode } from 'react';
import { content } from '../../../content/portfolio';
import { DoodleIcon, SketchMeter } from '../Sketch';

export function StudioSection(): ReactNode {
  const grouped = useMemo(() => {
    const groups = new Map<string, typeof content.skills>();
    content.skills.forEach((skill) => {
      const list = groups.get(skill.group) ?? [];
      list.push(skill);
      groups.set(skill.group, list);
    });
    return Array.from(groups.entries());
  }, []);

  return (
    <>
      <section className="sheet__section" aria-labelledby="studio-stack">
        <div className="sheet__section-head">
          <h3 className="sheet__section-title" id="studio-stack">
            The stack
          </h3>
          <span className="sheet__section-note">honest numbers, not buzzword bingo</span>
        </div>

        {grouped.map(([group, skills]) => (
          <div className="skill-group" key={group} data-reveal>
            <h4 className="skill-group__title">{group}</h4>
            {skills.map((skill, index) => (
              <div className="skill" key={skill.id}>
                <span className="skill__label">{skill.label}</span>
                <span className="skill__meter">
                  <SketchMeter value={skill.level} seed={index * 13 + skill.level} />
                </span>
                <p className="skill__note">{skill.note}</p>
              </div>
            ))}
          </div>
        ))}
      </section>

      <section className="sheet__section" aria-labelledby="studio-process">
        <div className="sheet__section-head">
          <h3 className="sheet__section-title" id="studio-process">
            How the work happens
          </h3>
          <span className="sheet__section-note">four honest steps</span>
        </div>

        <div className="cards">
          <article className="card" data-reveal>
            <h4 className="card__title">1. Pencil first</h4>
            <p className="card__text">
              Every build starts as a sketch: story beats, camera moves and the moments that matter. Cheap to throw away,
              impossible to fake.
            </p>
          </article>
          <article className="card" data-reveal>
            <h4 className="card__title">2. Vertical slice</h4>
            <p className="card__text">
              One screen, fully finished, running on a real mid-tier phone before anything scales up. Budgets get
              measured here, not later.
            </p>
          </article>
          <article className="card" data-reveal>
            <h4 className="card__title">3. Build in the open</h4>
            <p className="card__text">
              Preview links from week one, written status notes every Friday, and no mystery invoices. You always know
              where the project stands.
            </p>
          </article>
          <article className="card" data-reveal>
            <h4 className="card__title">4. Hand over</h4>
            <p className="card__text">
              Documentation, tokens and a walkthrough recording, so your team can extend the work without me in the
              room.
            </p>
          </article>
        </div>
      </section>

      <section className="sheet__section" aria-labelledby="studio-certs">
        <div className="sheet__section-head">
          <h3 className="sheet__section-title" id="studio-certs">
            Certifications
          </h3>
          <span className="sheet__section-note">coursework that backs the practical work</span>
        </div>

        <div className="cards">
          {content.certifications.map((certification) => (
            <article className="award" key={certification.id} data-reveal>
              <DoodleIcon kind="certificate" alt={`${certification.title} certificate`} size={54} />
              <div>
                <h4 className="award__title">{certification.title}</h4>
                <p className="award__issuer">
                  {certification.issuer} · {certification.year}
                </p>
                <p className="award__note">{certification.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sheet__section" aria-labelledby="studio-awards">
        <div className="sheet__section-head">
          <h3 className="sheet__section-title" id="studio-awards">
            Hackathons &amp; achievements
          </h3>
          <span className="sheet__section-note">{content.awards.length} events, one podium finish</span>
        </div>

        <div className="cards">
          {content.awards.map((award, index) => (
            <article className="award" key={award.id} data-reveal>
              <DoodleIcon kind={award.kind} alt={`${award.title} illustration`} size={54} />
              <div>
                <h4 className="award__title">{award.title}</h4>
                <p className="award__issuer">
                  {award.issuer} · {award.year}
                </p>
                <p className="award__note">{award.note}</p>
                <span className="tag" style={{ marginTop: 8, display: 'inline-block' }}>
                  stamp {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}