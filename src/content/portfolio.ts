/**
 * ============================================================================
 *  MOHAMMED SAFWAN - PORTFOLIO CONTENT
 *  SINGLE SOURCE OF TRUTH FOR EVERYTHING ON THE SITE
 * ============================================================================
 *
 *  Identity, station copy, case studies, skills, experience, awards,
 *  certifications, education, socials, services, FAQ and the long-form SEO
 *  block all live here. The 3D corridor, the HTML overlay, the achievement
 *  stamps, the resume PDF and the structured data all follow this file.
 *
 *  Colours + fonts: src/styles/tokens.css
 */

import type { PortfolioContent } from '../types';

export const content: PortfolioContent = {
  identity: {
    name: 'Mohammed Safwan',
    alias: 'SAFWAN',
    title: 'Technical Lead & Full-Stack Developer',
    location: 'Mangalore, Karnataka, India',
    email: 'safwancoding1919@gmail.com',
    phone: '+91-7892104273',
    availability: 'Open to full-time roles & freelance builds',
    intro:
      'I lead a small team and own the whole delivery cycle: architecture, code, PR reviews, then shipping to the Play Store, the App Store and the web. React Native, Next.js, Firebase, PostgreSQL.',
    bio: [
      'I am a computer science engineer and technical lead who manages the entire development cycle - from writing the first line of code and reviewing every pull request to pushing releases to the Play Store, the App Store and production web.',
      'Day to day I work across React Native (Expo), Next.js, Firebase and Fastify, with PostgreSQL or Firestore behind it. I have shipped a masjid community platform live on three stores, a school ERP with 93+ API endpoints and ten role scopes, and a fashion e-commerce storefront with a full admin dashboard.',
      'As a lead I handle architecture decisions, enforce coding standards through reviews, translate business requirements into technical plans, and make sure things stay stable after launch. I like typed code, small pull requests and shipping on schedule.',
    ],
    stats: [
      { label: 'Team lead since', value: '2025' },
      { label: 'Production apps shipped', value: '4' },
      { label: 'API endpoints designed', value: '93+' },
      { label: 'Stores & platforms live on', value: '3' },
    ],
    resumeUrl: '/resume.pdf',
  },

  /** The corridor: ordered camera stops. Positions drive the 3D camera rig. */
  stations: [
    {
      id: 'corridor',
      label: 'Home',
      title: 'The Corridor',
      tagline: 'Scroll to walk the hallway. Every door is a chapter.',
      chapter: '01',
      kind: 'hero',
      camera: {
        position: [0, 1.75, 6.4],
        lookAt: [0, 1.75, -8],
        doorSide: 'right',
        doorZ: 8,
      },
    },
    {
      id: 'gallery',
      label: 'Projects',
      title: 'The Projects',
      tagline: 'Shipped apps, a masjid platform and a fashion storefront.',
      chapter: '02',
      kind: 'room',
      camera: {
        position: [-0.6, 1.72, -9.5],
        lookAt: [-1.8, 1.95, -19],
        doorSide: 'right',
        doorZ: -13,
      },
    },
    {
      id: 'studio',
      label: 'Skills & Stack',
      title: 'The Studio',
      tagline: 'The stack I ship with, and how the work actually gets done.',
      chapter: '03',
      kind: 'room',
      camera: {
        position: [0.8, 1.74, -25.5],
        lookAt: [2.4, 2.1, -36],
        doorSide: 'left',
        doorZ: -29,
      },
    },
    {
      id: 'about',
      label: 'About Me',
      title: 'The Author',
      tagline: 'Experience, education and the team-lead side of the job.',
      chapter: '04',
      kind: 'room',
      camera: {
        position: [-1.2, 1.72, -41.5],
        lookAt: [2.2, 2.2, -52],
        doorSide: 'left',
        doorZ: -45,
      },
    },
    {
      id: 'contact',
      label: 'Contact & Socials',
      title: 'The Post Room',
      tagline: 'Email, phone, LinkedIn, GitHub - pick whichever you prefer.',
      chapter: '05',
      kind: 'room',
      camera: {
        position: [0.9, 1.8, -57.5],
        lookAt: [-2.2, 1.95, -68],
        doorSide: 'right',
        doorZ: -61,
      },
    },
  ],

  projects: [
    {
      id: 'minara',
      title: 'Minara',
      subtitle: 'Masjid community platform, live on three stores',
      year: '2025',
      role: 'Full-Stack Developer & Team Lead',
      client: 'minaraapp.in',
      stack: ['React Native', 'Expo', 'TypeScript', 'Firebase', 'Zustand', 'GCP Vision'],
      summary:
        'A masjid community app with five user roles and strict role-based access control across iOS, Android and web. Prayer times, Quran reader, UPI donation tracking with OCR receipt verification, push notifications and a WhatsApp bot all run off one Firebase backend.',
      highlights: [
        'Modelled five user roles with strict RBAC enforced in security rules and at the query layer, not just in the UI.',
        'Built UPI donation tracking with Google Cloud Vision OCR so receipts get verified automatically instead of by hand.',
        'Shipped to the Google Play Store, the Apple App Store and the web (minaraapp.in) from a single Expo codebase.',
        'Integrated a WhatsApp bot for announcements and reminders alongside push notifications.',
      ],
      metrics: [
        { label: 'User roles', value: '5' },
        { label: 'Platforms shipped', value: '3' },
        { label: 'OCR verification', value: 'GCP Vision' },
      ],
      artSeed: 1207,
      featured: true,
      url: 'https://minaraapp.in',
    },
    {
      id: 'kivquo',
      title: 'Kivquo',
      subtitle: 'School ERP with 93+ API endpoints',
      year: '2026',
      role: 'Full-Stack Developer & Team Lead',
      client: 'School management platform',
      stack: ['React Native', 'Expo', 'Fastify', 'PostgreSQL', 'Firebase Auth', 'TypeScript'],
      summary:
        'A complete school management platform covering ten user roles with scoped RBAC behind a Fastify + PostgreSQL API. The academics suite handles attendance, exams and grades, timetable versioning, homework and real-time bus tracking with live location updates.',
      highlights: [
        'Designed and documented 93+ REST endpoints with scoped permissions per role and per school.',
        'Implemented timetable versioning so schedule changes stay auditable instead of overwriting history.',
        'Streamed live bus locations to parents and staff with Firebase Auth tokens guarding every subscription.',
        'Owned the architecture, review process and release cycle as technical lead on the project.',
      ],
      metrics: [
        { label: 'User roles', value: '10' },
        { label: 'API endpoints', value: '93+' },
        { label: 'Bus tracking', value: 'Real-time' },
      ],
      artSeed: 8842,
      featured: true,
    },
    {
      id: 'maison',
      title: 'Maison',
      subtitle: 'Premium fashion e-commerce platform',
      year: '2025',
      role: 'Full-Stack Developer',
      client: 'Fashion retail',
      stack: ['Next.js 16', 'React 19', 'Tailwind CSS 4', 'Prisma', 'PostgreSQL'],
      summary:
        'A premium fashion storefront built on Next.js 16 and React 19, with advanced product filtering, cart, wishlist and a three-step checkout with coupon support. An admin dashboard handles revenue analytics, product and order management, dynamic content and a points-based loyalty program.',
      highlights: [
        'Built advanced filtering and search that stays instant as the catalogue grows, with server-side pagination.',
        'Shipped a three-step checkout with coupon handling and cart persistence across sessions.',
        'Delivered an admin dashboard with revenue analytics, content controls and the full order lifecycle.',
        'Added a tiered, points-based loyalty program to bring customers back.',
      ],
      metrics: [
        { label: 'Next.js / React', value: '16 / 19' },
        { label: 'Checkout steps', value: '3' },
        { label: 'Loyalty program', value: 'Tiered' },
      ],
      artSeed: 3311,
      featured: true,
      url: 'https://github.com/Safwan-1919',
    },
    {
      id: 'expense',
      title: 'Expense Tracker',
      subtitle: 'Cross-platform money tracking with PDF reports',
      year: '2026',
      role: 'Mobile Developer',
      client: 'Personal product',
      stack: ['React Native', 'Expo', 'TypeScript', 'Firebase', 'Zustand'],
      summary:
        'A cross-platform income and expense tracker where users log transactions and photograph receipts. Time-based summaries roll everything up per day, week, month and year, and PDF reports are generated serverlessly on Firebase Cloud Functions.',
      highlights: [
        'Built the capture flow for logging transactions with receipt images attached to each entry.',
        'Implemented daily, weekly, monthly and yearly financial summaries computed from Firestore data.',
        'Generated PDF reports serverlessly with Firebase Cloud Functions, so no report logic ships in the app.',
        'Kept state predictable across platforms with Zustand stores shared between iOS and Android.',
      ],
      metrics: [
        { label: 'Summary ranges', value: '4' },
        { label: 'Reports', value: 'Serverless PDF' },
        { label: 'Platforms', value: 'iOS · Android' },
      ],
      artSeed: 5590,
      featured: false,
    },
    {
      id: 'wise',
      title: 'WISE',
      subtitle: 'Women in Safe Environment — HackSummit 2025 runner-up',
      year: '2025',
      role: 'Frontend Developer',
      client: 'GLUG · P.A. College of Engineering',
      stack: ['Next.js', 'React', 'TypeScript', 'Live Location', 'AI threat detection'],
      summary:
        'A web-based personal safety system built during HackSummit 2025 and placed as runner-up. WISE combines a voice-activated SOS, live location tracking and AI-driven threat detection behind a calm, fast interface designed for stressful moments.',
      highlights: [
        'Built the responsive interface in React and Next.js with safety-first interaction design.',
        'Wired a voice-activated SOS trigger and live location tracking for guardians and responders.',
        'Integrated AI-driven threat detection signals into the alert flow.',
        'Placed runner-up at HackSummit 2025, organised by GLUG at P.A. College of Engineering.',
      ],
      metrics: [
        { label: 'HackSummit 2025', value: 'Runner-up' },
        { label: 'SOS trigger', value: 'Voice' },
        { label: 'Tracking', value: 'Live location' },
      ],
      artSeed: 2298,
      featured: false,
    },
  ],

  skills: [
    {
      id: 'ts',
      label: 'TypeScript',
      level: 93,
      note: 'The default language for every product I build - typed APIs, shared types between app and server.',
      group: 'Languages',
    },
    {
      id: 'java',
      label: 'Java',
      level: 82,
      note: 'OOP fundamentals, collections and coursework projects; the language I learned architecture from.',
      group: 'Languages',
    },
    {
      id: 'cpp',
      label: 'C / C++',
      level: 84,
      note: 'Data structures, pointers, memory and the problem solving habit from DSA practice.',
      group: 'Languages',
    },
    {
      id: 'rn',
      label: 'React Native',
      level: 95,
      note: 'Production apps and shared components: navigation, native modules, RBAC screens, store releases.',
      group: 'Frameworks & Libraries',
    },
    {
      id: 'expo',
      label: 'Expo',
      level: 94,
      note: 'One codebase shipped to Play Store, App Store and web with EAS builds and OTA updates.',
      group: 'Frameworks & Libraries',
    },
    {
      id: 'next',
      label: 'Next.js',
      level: 92,
      note: 'App Router, server components, route handlers and caching for the fashion storefront and WISE.',
      group: 'Frameworks & Libraries',
    },
    {
      id: 'react',
      label: 'React',
      level: 93,
      note: 'Hooks, composition and performance work in products that carry real user load.',
      group: 'Frameworks & Libraries',
    },
    {
      id: 'fastify',
      label: 'Fastify',
      level: 88,
      note: 'REST APIs with schema validation and auth guards - 93+ endpoints behind the school ERP.',
      group: 'Frameworks & Libraries',
    },
    {
      id: 'node',
      label: 'Node.js',
      level: 88,
      note: 'Server runtimes, background jobs and scripts that glue the tooling together.',
      group: 'Frameworks & Libraries',
    },
    {
      id: 'js',
      label: 'JavaScript (ES6+)',
      level: 91,
      note: 'Async patterns, modules and the browser APIs the frontend depends on.',
      group: 'Web & UI',
    },
    {
      id: 'html',
      label: 'HTML & CSS',
      level: 90,
      note: 'Semantic markup, responsive layouts and accessibility that survives real content.',
      group: 'Web & UI',
    },
    {
      id: 'tailwind',
      label: 'Tailwind CSS',
      level: 92,
      note: 'Design tokens in utility form - fast to build with, still consistent at scale.',
      group: 'Web & UI',
    },
    {
      id: 'shadcn',
      label: 'shadcn/ui',
      level: 88,
      note: 'Accessible component primitives that get themed per product instead of fighting a framework.',
      group: 'Web & UI',
    },
    {
      id: 'firebase',
      label: 'Firebase (Auth · Firestore · Functions)',
      level: 94,
      note: 'Auth, Firestore, Cloud Functions and security rules with role-based access enforced server-side.',
      group: 'Backend & Cloud',
    },
    {
      id: 'gcp',
      label: 'Google Cloud Platform',
      level: 82,
      note: 'Cloud Vision OCR for donation receipts, cloud functions and the services behind the apps.',
      group: 'Backend & Cloud',
    },
    {
      id: 'salesforce',
      label: 'Salesforce (Apex · SOQL · LWC)',
      level: 84,
      note: 'Onboarding portal, an alumni portal and role-based login built during my internship.',
      group: 'Backend & Cloud',
    },
    {
      id: 'postgres',
      label: 'PostgreSQL',
      level: 90,
      note: 'Relational modelling, indexes and queries behind the ERP and e-commerce platforms.',
      group: 'Data & ORM',
    },
    {
      id: 'mysql',
      label: 'MySQL',
      level: 86,
      note: 'Schema design and reporting queries, with plenty of time in MySQL Workbench.',
      group: 'Data & ORM',
    },
    {
      id: 'mongo',
      label: 'MongoDB',
      level: 83,
      note: 'Document modelling where a relational schema would fight the shape of the data.',
      group: 'Data & ORM',
    },
    {
      id: 'prisma',
      label: 'Prisma & Drizzle ORM',
      level: 89,
      note: 'Type-safe data access and migrations that keep the API and the schema in lockstep.',
      group: 'Data & ORM',
    },
    {
      id: 'zustand',
      label: 'Zustand',
      level: 91,
      note: 'Small, predictable stores for mobile apps where context alone gets noisy.',
      group: 'State & Tooling',
    },
    {
      id: 'query',
      label: 'TanStack React Query',
      level: 89,
      note: 'Server state, caching, retries and optimistic updates without hand-rolled loading logic.',
      group: 'State & Tooling',
    },
    {
      id: 'zod',
      label: 'Zod',
      level: 89,
      note: 'Validation at the edges: request bodies, forms and environment config.',
      group: 'State & Tooling',
    },
    {
      id: 'git',
      label: 'Git & GitHub',
      level: 93,
      note: 'Branching, PR reviews and the workflow I run for the team - small PRs, clear history.',
      group: 'Tools & Platforms',
    },
    {
      id: 'sentry',
      label: 'Sentry',
      level: 85,
      note: 'Crash and performance monitoring, so production issues surface before users report them.',
      group: 'Tools & Platforms',
    },
    {
      id: 'n8n',
      label: 'N8N',
      level: 82,
      note: 'Automation flows that connect apps, notifications and internal tooling.',
      group: 'Tools & Platforms',
    },
    {
      id: 'figma',
      label: 'Figma & Canva',
      level: 84,
      note: 'Reading design files properly, and producing quick assets when no designer is in the room.',
      group: 'Tools & Platforms',
    },
    {
      id: 'releases',
      label: 'Store releases (Play · App Store)',
      level: 91,
      note: 'Signing, versioning, review submissions and staged rollouts for both stores.',
      group: 'Shipping & Team',
    },
    {
      id: 'reviews',
      label: 'Code review & mentoring',
      level: 92,
      note: 'Reviewing PRs, setting standards and helping the team grow into architecture decisions.',
      group: 'Shipping & Team',
    },
  ],

  timeline: [
    {
      period: 'January 2025 — Present',
      role: 'Technical Lead',
      company: 'Found Solutions',
      summary:
        'Leading technical initiatives and guiding the team in designing and delivering scalable software. I own architecture decisions, run code reviews, keep coding standards in place, and coordinate with stakeholders to translate business requirements into technical implementations.',
      stack: ['React Native', 'Next.js', 'TypeScript', 'Firebase', 'PostgreSQL'],
    },
    {
      period: 'January 2026 — April 2026',
      role: 'QA Engineer — Analytics',
      company: 'Unicourt Mangalore Infotech',
      summary:
        'Worked on real-world court-related projects, extracting actionable insights from complex legal datasets. Ran quality assurance and data validation to keep analytics outputs accurate, and collaborated across teams to streamline data pipelines and reporting.',
      stack: ['Data validation', 'Analytics', 'QA', 'SQL'],
    },
    {
      period: 'July 2025 — October 2025',
      role: 'Salesforce Intern',
      company: 'Novigo Solutions',
      summary:
        'Enhanced the client onboarding portal with Apex, SOQL and LWC to improve data handling and process efficiency. Designed a Salesforce Alumni Portal with Visualforce and custom objects for profiles, events and documents, and built a unified login with role-based access into multiple applications.',
      stack: ['Apex', 'SOQL', 'LWC', 'Visualforce'],
    },
  ],

  awards: [
    {
      id: 'hacksummit',
      title: 'Runner-up — HackSummit 2025',
      issuer: 'GLUG · P.A. College of Engineering',
      year: '2025',
      note: 'Built WISE (Women in Safe Environment): voice-activated SOS, live location tracking and AI-driven threat detection in React and Next.js.',
      kind: 'trophy',
    },
    {
      id: 'codemeet',
      title: 'Participant — Code Meet Hackathon',
      issuer: 'Code Meet',
      year: '2024',
      note: 'Prototyped a web solution with a team inside 24 hours - a lesson in scoping, splitting work and shipping under pressure.',
      kind: 'star',
    },
  ],

  certifications: [
    {
      id: 'cs50',
      title: 'Introduction to Computer Science (CS50)',
      issuer: 'Harvard University',
      year: '2023',
      note: 'Structures of programming: C, algorithms, memory, data structures and how computers actually work.',
    },
    {
      id: 'webdev',
      title: 'Web Development',
      issuer: 'Udemy',
      year: '2024',
      note: 'The full frontend and backend path that turned coursework into shipped products.',
    },
    {
      id: 'dsa',
      title: 'Data Structures and Algorithms',
      issuer: 'GeeksforGeeks',
      year: '2025',
      note: 'Problem solving, complexity analysis and the DSA muscle used in interviews and reviews.',
    },
  ],

  education: [
    {
      period: '2022 — 2026',
      degree: 'B.E. Computer Science & Engineering',
      institution: 'PA College of Engineering, Mangalore, Karnataka',
      detail: 'CGPA 8.6 / 10 · coursework in data structures, DBMS, operating systems and computer networks, alongside product work and hackathons.',
    },
  ],

  socials: [
    {
      id: 'email',
      label: 'Email',
      handle: 'safwancoding1919@gmail.com',
      url: 'mailto:safwancoding1919@gmail.com',
      hint: 'Best for project briefs and job opportunities.',
    },
    {
      id: 'phone',
      label: 'Phone',
      handle: '+91-7892104273',
      url: 'tel:+917892104273',
      hint: 'Weekdays, 10:00–19:00 IST.',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      handle: '/in/mohammed-safwan1919',
      url: 'https://linkedin.com/in/mohammed-safwan1919/',
      hint: 'Experience, recommendations and updates.',
    },
    {
      id: 'github',
      label: 'GitHub',
      handle: '@Safwan-1919',
      url: 'https://github.com/Safwan-1919',
      hint: 'Source code, side projects and experiments.',
    },
    {
      id: 'minara',
      label: 'Minara',
      handle: 'minaraapp.in',
      url: 'https://minaraapp.in',
      hint: 'The masjid community platform, live on the web.',
    },
  ],

  services: [
    {
      id: 'product',
      title: 'Full-Stack Product Build',
      price: 'Quoted per scope',
      blurb:
        'End-to-end delivery of a web product: architecture, API, database, admin dashboard and deployment. One person accountable for the whole cycle.',
      deliverables: [
        'Architecture and data modelling',
        'Next.js or React frontend',
        'Fastify / Node API with typed contracts',
        'PostgreSQL or Firestore data layer',
        'Admin dashboard and analytics',
        'Deployment and handover docs',
      ],
    },
    {
      id: 'mobile',
      title: 'Mobile App Delivery',
      price: 'Retainer or fixed bid',
      blurb:
        'A React Native (Expo) app taken from idea to the Play Store and the App Store - including the release work most teams underestimate.',
      deliverables: [
        'Cross-platform app (iOS · Android · web)',
        'Firebase auth and role-based access',
        'Push notifications and real-time data',
        'Store submission and staged rollout',
        'Crash monitoring with Sentry',
      ],
    },
    {
      id: 'lead',
      title: 'Technical Leadership',
      price: 'Monthly retainer',
      blurb:
        'Fractional lead support: I can own architecture, review pull requests and unblock your team while you hire or scale.',
      deliverables: [
        'Architecture and code reviews',
        'Standards and PR workflow setup',
        'Requirement-to-implementation planning',
        'Mentoring junior developers',
        'Release and deployment process',
      ],
    },
  ],

  faqs: [
    {
      q: 'What kind of work do you take on?',
      a: 'Full-stack product builds, React Native apps that need to reach the Play Store and App Store, and technical leadership for teams that need architecture and code review. I am also open to full-time roles - I am a 2026 computer science graduate.',
    },
    {
      q: 'You lead a team - how does that work on a client project?',
      a: 'I run the technical side: scoping, architecture, task breakdown, code reviews and release management. You get one accountable point of contact instead of a relay of developers, with clear weekly progress.',
    },
    {
      q: 'How do you handle app store releases?',
      a: 'I own the full release path: signing credentials, versioning, store listings, review requirements, staged rollouts and post-release monitoring with Sentry. Minara is live on both stores, so the process is already worked out.',
    },
    {
      q: 'Which stack will you use for my product?',
      a: 'It depends on the problem: React Native (Expo) plus Firebase when you need iOS, Android and web from one codebase, or Next.js with Fastify and PostgreSQL when the product is web-first with an admin dashboard. Either way the API contracts are typed end to end.',
    },
    {
      q: 'Are you available for full-time roles or freelance?',
      a: 'Both. I am based in Mangalore, Karnataka (IST) and comfortable working remotely across time zones. Send a note with the scope and timeline and I will reply within two working days.',
    },
  ],

  unlocks: [
    {
      id: 'entered',
      title: 'Welcome to the corridor',
      description: 'You stepped inside the portfolio hallway. Every door opens a chapter.',
      inlineControl: 'sound',
    },
    {
      id: 'signs-read',
      title: 'Signage reader',
      description: 'You read a door sign. Hint: the plaque under each door is clickable.',
    },
    {
      id: 'gallery-visited',
      title: 'Projects visited',
      description: 'Minara, Kivquo, Maison, the expense tracker and WISE - all with case notes.',
    },
    {
      id: 'studio-visited',
      title: 'Stack inspected',
      description: 'The full stack, the tools and how the work actually gets done.',
    },
    {
      id: 'about-visited',
      title: 'Experience reviewed',
      description: 'Three roles, one degree, two hackathons and a lot of pull requests.',
    },
    {
      id: 'contact-visited',
      title: 'Post room open',
      description: 'Email, phone, LinkedIn and GitHub - all one click away.',
    },
    {
      id: 'all-rooms',
      title: 'Corridor completed',
      description: 'You opened every room in the hallway. Thorough visitor energy.',
    },
    {
      id: 'case-opened',
      title: 'Case study opened',
      description: 'Deep-dive read. That is how hiring decisions get made.',
    },
    {
      id: 'skill-popped',
      title: 'Balloon popper',
      description: 'You burst a skill balloon. It squeaked.',
    },
    {
      id: 'pencil-found',
      title: 'Pencil found',
      description: 'You picked up the pencil from the corridor floor.',
    },
    {
      id: 'letter-sent',
      title: 'Message dispatched',
      description: 'Your message is on its way. Expect a reply within two working days.',
    },
    {
      id: 'coffee-found',
      title: 'Caffeine located',
      description: 'Found the mug. It is always half full around here.',
    },
    {
      id: 'kraft-code',
      title: 'Secret: you typed SAFWAN',
      description: 'Old-school cheat code discovered. The corridor applauds you.',
    },
    {
      id: 'sound-on',
      title: 'Ambience enabled',
      description: 'Room tone and pencil scratches are now part of the experience.',
    },
  ],

  seo: [
    {
      heading: 'Mohammed Safwan — Technical Lead and Full-Stack Developer',
      paragraphs: [
        'Mohammed Safwan is a computer science engineer, technical lead and full-stack developer based in Mangalore, Karnataka, India. He manages the entire development cycle: writing production code, reviewing pull requests, making architecture decisions, and deploying applications to the Google Play Store, the Apple App Store and the web.',
        'This portfolio is an interactive 3D hand-drawn corridor: every wall, door, print and icon is generated by code at runtime. Walk the hallway to reach the projects, the skills and stack, the experience timeline and the contact room. If you are looking for a full-stack developer who can own a product end to end, or a technical lead who can hold architecture and reviews while a team grows, this is the place to start.',
      ],
    },
    {
      heading: 'What he builds and how',
      paragraphs: [
        'The work spans cross-platform mobile apps, web platforms and the APIs behind them. A typical build pairs React Native (Expo) with Firebase for mobile products that must reach three stores from one codebase, or Next.js with Fastify and PostgreSQL for web-first products with an admin dashboard. TypeScript runs through everything, with Prisma or Drizzle for typed data access and Zod validating the edges.',
      ],
      bullets: [
        {
          strong: 'Mobile:',
          text: 'React Native and Expo apps with role-based access control, push notifications, real-time data and store releases handled end to end.',
        },
        {
          strong: 'Web:',
          text: 'Next.js and React applications with Tailwind CSS and shadcn/ui, server components, caching and checkout or dashboard flows.',
        },
        {
          strong: 'Backend:',
          text: 'Fastify and Node.js APIs with schema validation, Firebase Auth or custom auth, and PostgreSQL, MySQL, MongoDB or Firestore behind them.',
        },
        {
          strong: 'State and data:',
          text: 'Zustand and TanStack React Query for predictable client state, Prisma and Drizzle for typed data access.',
        },
        {
          strong: 'Observability and automation:',
          text: 'Sentry for crash and performance monitoring, N8N for automations, Git and GitHub for review-first workflow.',
        },
        {
          strong: 'Salesforce:',
          text: 'Apex, SOQL, LWC and Visualforce experience from an internship building onboarding, alumni and role-based login portals.',
        },
      ],
    },
    {
      heading: 'Shipped projects: Minara, Kivquo, Maison and WISE',
      paragraphs: [
        'Minara is a masjid community platform live at minaraapp.in and on both app stores. It supports five user roles with strict RBAC across iOS, Android and web, and bundles prayer times, a Quran reader, UPI donation tracking with Google Cloud Vision OCR verification, push notifications and a WhatsApp bot.',
        'Kivquo is a school ERP covering ten user roles behind a Fastify and PostgreSQL API with 93+ endpoints. It handles attendance, exams and grades, timetable versioning, homework, and real-time bus tracking with live location updates. Maison is a premium fashion e-commerce platform built on Next.js 16 and React 19 with Prisma, featuring advanced filtering, cart and wishlist, a three-step checkout with coupons, an admin dashboard with revenue analytics and a tiered loyalty program.',
        'WISE (Women in Safe Environment) was built for HackSummit 2025 at P.A. College of Engineering and placed runner-up: a web-based safety system with voice-activated SOS, live location tracking and AI-driven threat detection. An expense tracking app rounds out the set, with cross-platform transaction logging and serverless PDF report generation on Firebase Cloud Functions.',
      ],
    },
    {
      heading: 'Experience, education and certifications',
      paragraphs: [
        'Safwan has been a Technical Lead at Found Solutions since January 2025, leading technical initiatives, guiding the team on scalable software delivery, overseeing code reviews and architecture decisions, and translating business requirements into technical implementations. Before that he worked as a QA Engineer in Analytics at Unicourt Mangalore Infotech, analysing real-world court datasets and validating analytics outputs, and as a Salesforce Intern at Novigo Solutions building onboarding and alumni portals in Apex, SOQL, LWC and Visualforce.',
        'He is completing a B.E. in Computer Science and Engineering at PA College of Engineering, Mangalore (2022–2026) with a CGPA of 8.6/10, and holds certifications in CS50 from Harvard University, Web Development from Udemy and Data Structures and Algorithms from GeeksforGeeks.',
      ],
    },
    {
      heading: 'Working with Mohammed Safwan',
      paragraphs: [
        'Freelance projects, contract work, team-lead retainers and full-time roles are all welcome. He is based in Mangalore, India (IST) and works remotely with teams across time zones, replying to enquiries within two working days. Reach him by email at safwancoding1919@gmail.com, by phone at +91-7892104273, or through LinkedIn and GitHub from the contact room in the corridor.',
      ],
    },
  ],
};