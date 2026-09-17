import type { NavItemContent } from './contentModels'

export const navigationContent = {
  items: [
    { href: '#about', label: 'About' },
    { href: '#skills', label: 'Skills' },
    { href: '#projects', label: 'Projects' },
    { href: '#contact', label: 'Contact' },
  ] satisfies NavItemContent[],
  home: { id: 'hero', label: 'Home' },
  homeTarget: '#hero',
  menuHeading: 'Navigation',
  connectHeading: "Let's Connect",
  menuMotto: 'Build better things.',
  shortcutsLabel: 'Section shortcuts',
  openLabel: 'Open navigation', closeLabel: 'Close navigation',
  nextSectionLabel: 'Go to next section', previousSectionLabel: 'Go to previous section',
  topLabel: 'Scroll to top',
  themeLabel: (theme: 'light' | 'dark') => `Switch to ${theme} theme`,
}
