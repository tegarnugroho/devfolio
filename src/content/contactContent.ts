import type { Contact } from '../types'

export const contactContent = {
  eyebrow: 'Contact', title: "Let's Connect",
  description: 'Open for open-source projects and community collaboration.',
  items: [
    { type: 'email', label: 'Email', value: 'tegar@wolkk.com', href: 'mailto:tegar@wolkk.com' },
    { type: 'linkedin', label: 'LinkedIn', value: 'linkedin.com/in/tegaranugroho', href: 'https://linkedin.com/in/tegaranugroho' },
    { type: 'github', label: 'GitHub', value: 'github.com/tegarnugroho', href: 'https://github.com/tegarnugroho' },
  ] satisfies Contact[],
}
