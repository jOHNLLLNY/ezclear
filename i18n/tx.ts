import { useTranslation } from 'react-i18next'
import { humanizeSlug } from './humanize'

// Our resources are under a single 'translation' namespace with nested keys (e.g., 'services.snow-removal').
// This helper lets you do: const txServices = useTx('services'); txServices('snow-removal') → looks up 'services.snow-removal'.
export function useTx(ns?: string) {
  const { t } = useTranslation() // keep default 'translation' namespace
  return (key: string, opts?: any) => {
    const fullKey = ns ? `${ns}.${key}` : key
    return String(t(fullKey, { defaultValue: humanizeSlug(fullKey), ...opts }))
  }
}

