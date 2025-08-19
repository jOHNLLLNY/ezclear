import { useTranslation } from 'react-i18next'
import { humanizeSlug } from './humanize'

export function useTx(ns?: string | string[]) {
  const { t } = useTranslation(ns ?? ['common','job','services','categories','buttons'])
  // Always coerce to string to satisfy ReactNode usage in RN Text
  return (key: string, opts?: any) => String(t(key, { defaultValue: humanizeSlug(key), ...opts }))
}

