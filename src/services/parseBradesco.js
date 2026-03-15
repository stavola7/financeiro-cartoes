import { categorizar } from '../utils/categorizar'

export function parseBradesco(binary) {
  const strings = []
  let cur = ''

  for (let i = 0; i < binary.length; i++) {
    const c = binary.charCodeAt(i)
    if (c >= 32 && c <= 126) {
      cur += binary[i]
    } else {
      if (cur.length > 4) strings.push(cur)
      cur = ''
    }
  }
  if (cur.length > 4) strings.push(cur)

  // Mostra as primeiras strings para debug
  const debug = strings.slice(0, 80).join(' | ')
  throw new Error('DEBUG: ' + debug)
}