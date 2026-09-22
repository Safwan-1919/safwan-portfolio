/**
 * KRAFT - Premium 3D Hand-Drawn Portfolio Theme
 * Shared domain types for the experience.
 */

/** Every navigable station of the corridor. */
export type StationId = 'corridor' | 'gallery' | 'studio' | 'about' | 'contact';

/** How a station is presented once the camera arrives. */
export type StationKind = 'hero' | 'room';

export interface Station {
  id: StationId;
  /** Short handwritten label used in the nav + 3D signage. */
  label: string;
  /** Longer editorial title used in panels + SEO copy. */
  title: string;
  /** One-line teaser shown under the label. */
  tagline: string;
  /** Handwritten "chapter" number, e.g. "02". */
  chapter: string;
  kind: StationKind;
  /** Camera anchor for the station. */
  camera: {
    position: [number, number, number];
    lookAt: [number, number, number];
    /** Signed offset for the door that opens this station. */
    doorSide: 'left' | 'right';
    doorZ: number;
  };
}

export interface Project {
  id: string;
  title: string;
  /** Handwritten subtitle. */
  subtitle: string;
  year: string;
  role: string;
  client: string;
  /** Comma separated stack, used for the sketch tags. */
  stack: string[];
  summary: string;
  highlights: string[];
  metrics: { label: string; value: string }[];
  /** Seed used to procedurally draw the wall art for this project. */
  artSeed: number;
  /** External case study link (optional). */
  url?: string;
  featured: boolean;
}

export interface Skill {
  id: string;
  label: string;
  level: number; // 0 - 100, drives the hand-drawn meter
  note: string;
  group: SkillGroup;
}

export type SkillGroup =
  | 'Languages'
  | 'Frameworks & Libraries'
  | 'Web & UI'
  | 'Backend & Cloud'
  | 'Data & ORM'
  | 'State & Tooling'
  | 'Tools & Platforms'
  | 'Shipping & Team';

export interface TimelineEntry {
  period: string;
  role: string;
  company: string;
  summary: string;
  stack: string[];
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  year: string;
  note: string;
  /** Sketch texture kind drawn on the pinned certificate. */
  kind: 'trophy' | 'certificate' | 'star' | 'medal';
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  year: string;
  note: string;
}

export interface EducationEntry {
  period: string;
  degree: string;
  institution: string;
  detail: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface SocialLink {
  id: string;
  label: string;
  handle: string;
  url: string;
  /** Handwritten hint rendered as a tooltip. */
  hint: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface ServiceCard {
  id: string;
  title: string;
  price: string;
  blurb: string;
  deliverables: string[];
}

export interface Unlock {
  id: string;
  title: string;
  description: string;
  /** Optional inline control rendered inside the popup (sound toggle). */
  inlineControl?: 'sound';
}

export interface SeoBlock {
  heading: string;
  paragraphs: string[];
  bullets?: { strong: string; text: string }[];
}


export interface PortfolioContent {
  identity: {
    name: string;
    alias: string;
    title: string;
    location: string;
    email: string;
    phone: string;
    availability: string;
    intro: string;
    bio: string[];
    stats: Stat[];
    resumeUrl: string;
  };
  stations: Station[];
  projects: Project[];
  skills: Skill[];
  timeline: TimelineEntry[];
  awards: Award[];
  certifications: Certification[];
  education: EducationEntry[];
  socials: SocialLink[];
  services: ServiceCard[];
  faqs: FaqItem[];
  seo: SeoBlock[];
  unlocks: Unlock[];
}