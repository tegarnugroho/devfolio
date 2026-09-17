import type { Contact, Project } from '../types'

export interface NavItemContent { href: string; label: string }
export interface SkillGroupContent {
  label: string
  description: string
  icon: 'platforms' | 'frameworks' | 'networking' | 'storage' | 'tooling'
  items: string[]
}

// Static content is recursively frozen; runtime UI state remains in components.
function freezeContent<T extends object>(value: T): T {
  Object.values(value).forEach(child => {
    if (child !== null && typeof child === 'object') freezeContent(child)
  })
  return Object.freeze(value)
}

export const portfolioContent = freezeContent({
  site: {
    name: 'Tegar', brandPeriod: '.', language: 'en',
    favicon: '/favicon.ico', icon192: '/favicon-192.png', icon512: '/favicon-512.png',
    title: 'Tegar - Flutter Developer',
    description: 'Professional portfolio of Tegar Flutter developer specializing in modern mobile apps.',
    socialDescription: 'Full-stack developer portfolio built with Vue 3 + TypeScript.',
    portfolioName: 'Tegar Portfolio',
    manifestDescription: 'Portfolio of Tegar, a Flutter Developer.',
  },
  navigation: {
    items: [
      { href: '#about', label: 'About' },
      { href: '#skills', label: 'Skills' },
      { href: '#projects', label: 'Projects' },
      { href: '#contact', label: 'Contact' },
    ] satisfies NavItemContent[],
    home: { id: 'hero', label: 'Home' },
    homeTarget: '#hero',
    shortcutsLabel: 'Section shortcuts',
    openLabel: 'Open navigation', closeLabel: 'Close navigation',
    nextSectionLabel: 'Go to next section', previousSectionLabel: 'Go to previous section',
    topLabel: 'Scroll to top',
    themeLabel: (theme: 'light' | 'dark') => `Switch to ${theme} theme`,
  },
  hero: {
    eyebrow: 'Flutter Developer',
    description: 'I build reliable cross-platform experiences focused on performance, intuitive UI, and maintainable architecture.',
    projectsLabel: 'View Projects', projectsTarget: '#projects',
    contactLabel: 'Contact', contactTarget: '#contact',
    motto: ['Build', 'Better', 'Things'], location: ['Jakarta,', 'Indonesia'],
  },
  about: {
    title: 'About', eyebrow: 'A little bit about me',
    greeting: 'Hi, I’m Tegar Nugroho',
    paragraphs: [
      "I’m a Flutter developer focused on building accessible, high‑performance applications.",
      "I favor clean architecture and maintainable code so every product feels smooth, consistent, and easy to evolve.",
      "I’ve shipped mobile, web, and desktop projects with a strong emphasis on performance, consistency, and scalability.",
      "At Wolkk (remote), I build cross‑platform solutions that combine clear design with robust engineering."
    ],
    role: 'Flutter Developer', company: 'Wolkk', startedLabel: 'Started in 2023',
    image: '/assets/user.png', imageAlt: 'Tegar Nugroho',
    alternateImage: '/assets/user-cute.png', alternateImageAlt: 'Alternate illustration of Tegar Nugroho',
    sliderLabel: 'Portrait comparison: drag left or right',
    sliderValue: (percent: number) => `${percent} percent normal portrait`,
  },
  skills: {
    eyebrow: 'Skills', title: 'What I Use',
    description: 'Tools and technologies built for high-performance cross-platform apps with clean, sustainable architecture.',
    groups: [
      {
        label: 'Languages & Platforms',
        description: 'Core languages and platforms I use to build cross-platform applications.',
        icon: 'platforms',
        items: ['Flutter', 'Dart', 'Android', 'iOS', 'Flutter Web', 'Flutter Desktop'],
      },
      {
        label: 'Frameworks & State',
        description: 'Frameworks and state management for scalable and maintainable apps.',
        icon: 'frameworks',
        items: ['Riverpod', 'BLoC', 'Cubit', 'Clean Architecture', 'GetIt/Injectable'],
      },
      {
        label: 'Networking',
        description: 'Networking and real-time communication tools.',
        icon: 'networking',
        items: ['Dio', 'HTTP', 'WebSocket'],
      },
      {
        label: 'Data & Storage',
        description: 'Local storage solutions and caching strategies.',
        icon: 'storage',
        items: ['SQLite (sqflite)', 'Hive', 'Shared Preferences', 'Local Caching'],
      },
      {
        label: 'Tooling',
        description: 'Development tools and productivity for a better workflow.',
        icon: 'tooling',
        items: ['Git', 'CI/CD', 'Android SDK', 'VS Code', 'Jira', 'Trello'],
      },
    ] satisfies SkillGroupContent[],
  },
  projects: {
    eyebrow: 'Projects', title: 'Selected Work',
    description: "A collection of projects I've built, from mobile and desktop apps to web experiences.",
    note: ['Focused on solving real problems', 'with clean design and maintainable code.'],
    previousLabel: '‹ Prev', nextLabel: 'Next ›',
    previousPageLabel: 'Previous page', nextPageLabel: 'Next page',
    pageLabel: (page: number, total: number) => `Page ${page} of ${total}`,
    detailsLabel: 'View project details', detailsHint: 'View details +',
    projectDetailsLabel: (title: string) => `View ${title} project details`,
    screenshotAlt: (title: string) => `${title} screenshot`,
    imageCount: (count: number) => `${count} images`,
    liveLabel: 'Live', codeLabel: 'Code',
    items: [
      {
        title: 'Table Parser - Flutter Package',
        description:
          'Parse structured data from table formats into usable models for Dart & Flutter. Efficient and reliable.',
        tech: [
          "Dart",
          "Flutter",
          "Data Parsing",
          "Table Parser",
        ],
        link: 'https://pub.dev/packages/table_parser',
        repo: 'https://github.com/tegarnugroho/table_parser',
        image: '/assets/table-parser/image.png',
        images: [
          '/assets/table-parser/image.png',
        ],
      },
      {
        title: 'VSCode Clone Personal Website',
        description:
          'Personal website built with Flutter Web, featuring Visual Studio Code-inspired interface with sidebar navigation, terminal panel, and dark mode theme for unique user experience.',
        tech: [
          "Flutter Web",
          "Dart",
          "Responsive Design",
          "Dark Mode",
          "Web Development",],
        link: 'https://tegar-nugroho.web.app/',
        repo: '#',
        image: '/assets/vscode/vscode-banner.png',
        images: [
          'assets/vscode/vscode-banner.png',
        ],
      },
      {
        title: 'Stationary POS - Retail Point-of-Sale System',
        description:
          'A Windows-based POS solution featuring transaction processing, purchase journals, stock management, secondary customer display, and multi-payment support. Built with Flutter using Clean Architecture, BLoC Cubit, and real-time WebSocket integration.',
        tech: [
          "Flutter for Windows",
          "BLoC Cubit",
          "Clean Architecture",
          "WebSocket",
          "CI/CD",
        ],
        link: '#',
        repo: '#',
        image: '/assets/engelhorn/1.png',
        images: [
          '/assets/engelhorn/1.png',
          '/assets/engelhorn/2.png',
          '/assets/engelhorn/3.png',
        ],
      },
      {
        title: 'EAA Pad - Self-Checkout Ordering App',
        description:
          'A Windows-based self-checkout app for food and beverage ordering with full accessibility support including voice guidance and visual markers. Built using Flutter with Clean Architecture and BLoC Cubit.',
        tech: [
          "Flutter for Windows",
          "BLoC Cubit",
          "Clean Architecture",
          "Accessibility",
          "CI/CD",
        ],
        link: '#',
        repo: '#',
        image: '/assets/eaapad/eaapad-3.png',
        images: [
          '/assets/eaapad/eaapad-1.png',
          '/assets/eaapad/eaapad-2.png',
          '/assets/eaapad/eaapad-3.png',
        ],
      },
      {
        title: 'ANKER Store App - Flexible Retail Commerce Solution',
        description:
          'A scalable retail store app with seamless backend integration and headless architecture. Runs on any device including mobile, tablets, checkout, and self-checkout terminals.',
        tech: [
          "Flutter",
          "Headless Architecture",
          "Cloud Deployment",
          "POS Integration",
        ],
        link: '#',
        repo: '#',
        image: '/assets/anker/anker-2.png',
        images: [
          '/assets/anker/anker-1.png',
          '/assets/anker/anker-2.png',
          '/assets/anker/anker-3.png',
        ],
      },
      {
        title: 'Excel Translator - Excel to Localization Files(Flutter Package)',
        description:
          'Convert Excel translation sheets into localization files for Flutter apps automatically. Simple, fast, and consistent.',
        tech: [
          "Dart",
          "Flutter",
          "Localization",
          "Excel Parser",
        ],
        link: 'https://pub.dev/packages/excel_translator',
        repo: 'https://github.com/tegarnugroho/excel_translator',
        image: '/assets/excel-translator/image.png',
        images: [
          '/assets/excel-translator/image.png',
        ],
      },
      {
        title: 'Danafix - Online Loan Application',
        description: 'Mobile app for seamless online loan applications, offering features like document upload, real-time status tracking, and secure data handling for a smooth user experience.',
        tech: [
          "Flutter",
          "Financial APIs",
          "KYC Integration",
          "Payment Gateway",
          "Security",],
        link: '#',
        repo: '#',
        image: '/assets/danafix/danafix-banner.png',
        images: [
          '/assets/danafix/danafix.png',
          '/assets/danafix/danafix-2.png',
        ],
      },
      {
        title: 'Tribelio - Brand & Influencer Platform',
        description: 'Platform for brands and influencers to build communities with exclusive content, membership management, engagement tracking, and audience monetization tools.',
        tech: [
          "Flutter",
          "Community Features",
          "Content Management",
          "Email Marketing",
          "Event Management",],
        link: 'https://tribelio.com/',
        repo: '#',
        image: 'assets/tribelio/tribelio-banner.jpeg',
        images: [
          'assets/tribelio/tribelio-1.webp',
          'assets/tribelio/tribelio-2.webp',
          'assets/tribelio/tribelio-3.webp',
          'assets/tribelio/tribelio-4.webp',
        ],
      },
      {
        title: 'Cicle - Remote Team Tool',
        description: 'Platform for remote teams to collaborate with integrated tools for project management, communication, and file sharing.',
        tech: [
          "Flutter",
          "Real-time Communication",
          "Project Management",
          "Team Collaboration",
          "Analytics",],
        link: 'https://cicle.app/tentang/',
        repo: '#',
        image: '/assets/cicle/cicle-banner.png',
        images: [
          '/assets/cicle/cicle-1.webp',
          '/assets/cicle/cicle-2.webp',
          '/assets/cicle/cicle-3.webp',
          '/assets/cicle/cicle-4.webp',
        ],
      },
      {
        title: 'IZILOH - Innovative Laundry App',
        description: 'A laundry service app offering scheduling, real-time tracking, and secure payments for a seamless user experience.',
        tech: [
          "Flutter",
          "Real-time Tracking",
          "Push Notifications",
          "Payment Integration",
          "Booking System",],
        link: 'https://iziloh.com/',
        repo: '#',
        image: '/assets/iziloh/iziloh-banner.jpg',
        images: [
          '/assets/iziloh/iziloh-1.webp',
          '/assets/iziloh/iziloh-2.webp',
          '/assets/iziloh/iziloh-3.webp',
          '/assets/iziloh/iziloh-4.webp',
        ],
      },
      {
        title: 'Waroong Retjeh - Restaurant App',
        description: 'A restaurant app offering online ordering, table reservation, and menu management for a seamless dining experience.',
        tech: [
          "Flutter",
          "Real-time Tracking",
          "Push Notifications",
          "Payment Integration",
          "Booking System",],
        link: 'http://waroongretjeh.dev.ittron.co.id/',
        repo: '#',
        image: '/assets/waroong-retjeh/waroong-retjeh-banner.png',
        images: [
          '/assets/waroong-retjeh/waroong-retjeh-1.png',
          '/assets/waroong-retjeh/waroong-retjeh-2.png',
          '/assets/waroong-retjeh/waroong-retjeh-3.png',
        ],
      },
      {
        title: 'Flambe - Food Delivery App',
        description: 'A food delivery app offering online ordering, real-time tracking, and secure payments for a seamless user experience.',
        tech: [
          "Flutter",
          "Real-time Tracking",
          "Push Notifications",
          "Payment Integration",
          "Booking System",],
        link: '#',
        repo: '#',
        image: '/assets/flambe/flambe-1.png',
        images: [
          '/assets/flambe/flambe-1.png',
          '/assets/flambe/flambe-2.png',
        ],
      },
      {
        title: 'NU Card - Electronic Wallet App',
        description: 'A digital wallet app offering secure payments, transaction tracking, and financial management tools for users.',
        tech: [
          "Flutter",
          "KYC Integration",
          "Push Notifications",
          "Payment Integration",
          "Booking System",],
        link: '#',
        repo: '#',
        image: '/assets/nucard/nucard-1.png',
        images: [
          '/assets/nucard/nucard-1.png',
          '/assets/nucard/nucard-2.png',
        ],
      },

    ] satisfies Omit<Project, 'id'>[],
  },
  showcase: {
    previousImageLabel: 'Previous image', nextImageLabel: 'Next image',
    closeLabel: 'Close project dialog', galleryLabel: 'Gallery images',
    fallbackTitle: 'Project gallery', fallbackProject: 'Project',
    descriptionLabel: 'Project description', stackLabel: 'Tech stack',
    projectLabel: 'View Project', codeLabel: 'View Code',
    unavailableLabel: 'Image unavailable.', retryLabel: 'Retry',
    imageLabel: (index: number) => `View image ${index}`,
    screenshotAlt: (title: string, index: number, total: number) => `${title} screenshot ${index} of ${total}`,
  },
  contact: {
    eyebrow: 'Contact', title: "Let's Connect",
    description: 'Open for open-source projects and community collaboration.',
    items: [
      { type: 'email', label: 'Email', value: 'tegar@wolkk.com', href: 'mailto:tegar@wolkk.com' },
      { type: 'linkedin', label: 'LinkedIn', value: 'linkedin.com/in/tegaranugroho', href: 'https://linkedin.com/in/tegaranugroho' },
      { type: 'github', label: 'GitHub', value: 'github.com/tegarnugroho', href: 'https://github.com/tegarnugroho' },
    ] satisfies Contact[],
  },
  footer: { owner: 'Tegar.' },
})
