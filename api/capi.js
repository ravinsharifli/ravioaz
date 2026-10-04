import { sendMetaEvent } from '../lib/metaCapi.js'
import { isAllowedOrigin, rateLimited, parseBody, cleanPhone, ALLOWED_EVENTS } from '../lib/apiGuard.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' })
  }
  // Yalnız ravio.az-dan gələn, limit daxilindəki sorğular
  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ ok: false, error: 'Forbidden' })
  }
  if (rateLimited(req, 'capi', 20)) {
    return res.status(429).json({ ok: false, error: 'Too many requests' })
  }

  try {
    const body = parseBody(req)
    const { event, phone } = body || {}

    if (!event) {
      return res.status(400).json({ error: 'event is required' })
    }
    if (!ALLOWED_EVENTS.has(String(event))) {
      return res.status(400).json({ error: 'event not allowed' })
    }

    await sendMetaEvent(String(event), req, cleanPhone(phone))
    res.status(200).json({ ok: true })
  } catch (error) {
    console.error('CAPI endpoint xətası:', error)
    res.status(200).json({ ok: false })
  }
}
