import { sendMetaEvent } from '../lib/metaCapi.js'
import { isAllowedOrigin, rateLimited, parseBody, cleanPhone, ALLOWED_EVENTS, ORDER_NUMBER_RE } from '../lib/apiGuard.js'

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
    const { event, phone, eventId, value, contentIds } = body || {}

    if (!event) {
      return res.status(400).json({ error: 'event is required' })
    }
    if (!ALLOWED_EVENTS.has(String(event))) {
      return res.status(400).json({ error: 'event not allowed' })
    }

    // İxtiyari sahələr — "Lead" kimi hadisələr üçün (CartDrawer.tsx handleWhatsApp)
    const extra = {}
    if (eventId !== undefined) {
      if (!ORDER_NUMBER_RE.test(String(eventId))) return res.status(400).json({ error: 'bad eventId' })
      extra.eventId = String(eventId)
    }
    if (value !== undefined) {
      const v = Number(value)
      if (!Number.isFinite(v) || v < 0 || v > 5000) return res.status(400).json({ error: 'bad value' })
      extra.value = v
    }
    if (Array.isArray(contentIds)) {
      extra.contentIds = contentIds.slice(0, 30).map((x) => String(x).slice(0, 100)).filter(Boolean)
    }

    await sendMetaEvent(String(event), req, cleanPhone(phone), extra)
    res.status(200).json({ ok: true })
  } catch (error) {
    console.error('CAPI endpoint xətası:', error)
    res.status(200).json({ ok: false })
  }
}
