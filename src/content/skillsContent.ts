import type { SkillGroupContent } from './contentModels'

export const skillsContent = {
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
}
