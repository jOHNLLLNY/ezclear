import AsyncStorage from '@react-native-async-storage/async-storage'

const keyForYm = (ym: string) => `ai_cap_${ym}`
export const ymNow = () => {
  const d = new Date()
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export async function isAiCapped(): Promise<boolean> {
  try { return (await AsyncStorage.getItem(keyForYm(ymNow()))) === '1' } catch { return false }
}
export async function setAiCapped(): Promise<void> {
  try { await AsyncStorage.setItem(keyForYm(ymNow()), '1') } catch {}
}

export function includesCapError(e: any): boolean {
  const msg = String(e?.message || e || '')
  return msg.includes('USER_BUDGET_EXCEEDED') || msg.includes('PROJECT_BUDGET_EXCEEDED') || msg.includes('402')
}

