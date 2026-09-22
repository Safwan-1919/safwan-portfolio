/**
 * Gallery room: the case-study exhibition. Cards are hand-drawn SVG prints;
 * selecting one expands a full case study underneath.
 */

import { useMemo, useState, type ReactNode } from 'react';
import { content } from '../../../content/portfolio';
import { SketchThumb } from '../Sketch';

export interface GallerySectionProps {
  focusedProject: string | null;
  onFocusProject: (projectId: string) => void;
}

export function GallerySection({ focusedProject, onFocusProject }: GallerySectionProps): ReactNode {
  const projects = content.projects;
  const [selected, setSelected] = useState<string | null>(focusedProject ?? projects[0]?.id ?? null);
  const activeId = focusedProject ?? selected;
  const active = useMemo(() => projects.find((project) => project.id === activeId) ?? projects[0], [projects, activeId]);

  const select = (projectId: string) => {
    setSelected(projectId);
    onFocusProject(projectId);
  };

  return (
    <>
      <section className="sheet__section" aria-labelledby="gallery-grid">
        <div className="sheet__section-head">
          <h3 className="sheet__section-title" id="gallery-grid">
            The exhibition
          </h3>
          <span className="sheet__section-note">{projects.length} selected works · hung left to right</span>
        </div>

        <div className="cards">
          {projects.map((project) => (
            <article
              key={project.id}
              className={`card${project.featured ? ' card--featured' : ''}`}
              data-reveal
            >
              <SketchThumb
                seed={project.artSeed}
                title={project.title}
                meta={`${project.year} · ${project.role}`}
              />
              <h4 className="card__title">{project.title}</h4>
              <p className="card__subtitle">{project.subtitle}</p>
              <p className="card__text">{project.summary}</p>
              <div className="card__meta">
                {project.stack.slice(0, 4).map((tech) => (
                  <span className="tag" key={tech}>
                    {tech}
                  </span>
                ))}
              </div>
              <div className="card__actions">
                <button type="button" className="sketch-btn sketch-btn--small" onClick={() => select(project.id)}>
                  Read the case study
                </button>
                {project.url ? (
                  <a className="card__link" href={project.url} target="_blank" rel="noopener noreferrer">
                    visit site ↗
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      {active ? (
        <section className="sheet__section" aria-labelledby="gallery-detail">
          <div className="sheet__section-head">
            <h3 className="sheet__section-title" id="gallery-detail">
              {active.title}
            </h3>
            <span className="sheet__section-note">
              {active.client} · {active.year}
            </span>
          </div>

          <div className="cards">
            <article className="card" data-reveal>
              <h4 className="card__title">The brief</h4>
              <p className="card__text">{active.summary}</p>
              <dl className="metrics">
                {active.metrics.map((metric) => (
                  <div key={metric.label}>
                    <dt className="metrics__label">{metric.label}</dt>
                    <dd className="metrics__value">{metric.value}</dd>
                  </div>
                ))}
              </dl>
            </article>

            <article className="card" data-reveal>
              <h4 className="card__title">What I did</h4>
              <ul className="bullet-list">
                {active.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <div className="card__meta">
                <span className="tag">{active.role}</span>
                {active.stack.map((tech) => (
                  <span className="tag" key={tech}>
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          </div>
        </section>
      ) : null}
    </>
  );
}