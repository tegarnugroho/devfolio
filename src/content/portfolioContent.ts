import { siteContent } from './siteContent'
import { navigationContent } from './navigationContent'
import { heroContent } from './heroContent'
import { aboutContent } from './aboutContent'
import { skillsContent } from './skillsContent'
import { projectsContent } from './projectsContent'
import { showcaseContent } from './showcaseContent'
import { contactContent } from './contactContent'
import { footerContent } from './footerContent'
import { blueprintContent } from './blueprintContent'

export type { NavItemContent, SkillGroupContent } from './contentModels'

// Static content is recursively frozen; runtime UI state remains in components.
function freezeContent<T extends object>(value: T): T {
  Object.values(value).forEach(child => {
    if (child !== null && typeof child === 'object') freezeContent(child)
  })
  return Object.freeze(value)
}

// Each section owns its copy in a separate content file.
export const portfolioContent = freezeContent({
  site: siteContent,
  navigation: navigationContent,
  hero: heroContent,
  about: aboutContent,
  skills: skillsContent,
  projects: projectsContent,
  showcase: showcaseContent,
  contact: contactContent,
  footer: footerContent,
  blueprint: blueprintContent,
})
