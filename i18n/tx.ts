import { useTranslation } from 'react-i18next'
import { humanizeSlug } from './humanize'

export function useTx(ns?: string | string[]) {
  const { t } = useTranslation(ns ?? ['common','job','services','categories','buttons'])
  return (key: string, opts?: any) => t(key, { defaultValue: humanizeSlug(key), ...opts })
}

