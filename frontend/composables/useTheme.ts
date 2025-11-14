import { useState, onMounted } from '#imports'

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'theme'

export function useTheme() {
  const theme = useState<Theme>('theme', () => 'dark')

  const applyTheme = (next: Theme) => {
    theme.value = next
    if (process.client) {
      document.documentElement.classList.toggle('dark', next === 'dark')
      window.localStorage.setItem(STORAGE_KEY, next)
    }
  }

  const toggleTheme = () => {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  onMounted(() => {
    if (!process.client) {
      return
    }
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === 'light' || stored === 'dark') {
      applyTheme(stored)
      return
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    applyTheme(prefersDark ? 'dark' : 'light')
  })

  return { theme, applyTheme, toggleTheme }
}
