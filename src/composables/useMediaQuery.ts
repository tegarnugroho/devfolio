import { onMounted, onUnmounted, ref, type Ref } from 'vue'

export function useMediaQuery(query: string): Ref<boolean> {
  const matches = ref(false)
  let mql: MediaQueryList | null = null
  let onChange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null = null

  onMounted(() => {
    mql = window.matchMedia(query)
    const update = () => { matches.value = !!mql && mql.matches }
    update()
    onChange = () => update()
    if (mql.addEventListener) mql.addEventListener('change', onChange)
    else if ((mql as any).addListener) (mql as any).addListener(onChange)
  })

  onUnmounted(() => {
    if (mql && onChange) {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange)
      else if ((mql as any).removeListener) (mql as any).removeListener(onChange)
    }
  })

  return matches
}

