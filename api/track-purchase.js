import { sendMetaPurchaseEvent } from '../lib/metaCapi.js'
import {
  isAllowedOrigin, rateLimited, parseBody, validatePurchase, sanitizeItems, cleanPhone,
} from '../lib/apiGuard.js'

// Bu endpoint HEÇ NƏYİ Sanity-də saxlamır. Yeganə işi — Meta-ya server-side
// Purchase hadisəsi göndərməkdir (reklam optimallaşdırması üçün, brauzerdəki fbq
// Pixel hadisəsinə əlavə olaraq, event_id ilə dublikat sayılmasın deyə).
// Sifariş artıq göndəriləndə WhatsApp-a göndərilib — bu sorğunun uğursuz olması
// müştəriyə heç bir təsir etmir.
//
// Qoruma (lib/apiGuard.js): yalnız ravio.az mənşəyi, sorğu limiti, sərt sahə yoxlaması.
// Əvvəl bu endpoint hər kəsə açıq idi — kimsə saxta "Purchase" göndərib Meta
// reklam statistikasını korlaya bilərdi.
const recentOrders = new Map() // orderNumber -> vaxt (best-effort dublikat qoruması)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' })
  }
  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ ok: false, error: 'Forbidden' })
  }
  if (rateLimited(req, 'track-purchase', 10)) {
    return res.status(429).json({ ok: false, error: 'Too many requests' })
  }

  const body = parseBody(req)
  const problem = validatePurchase(body)
  if (problem) {
    return res.status(400).json({ ok: false, error: problem })
  }

  const now = Date.now()
  for (const [k, t] of recentOrders) if (now - t > 10 * 60_000) recentOrders.delete(k)
  if (recentOrders.has(body.orderNumber)) {
    return res.status(200).json({ ok: true, duplicate: true })
  }
  recentOrders.set(body.orderNumber, now)

  try {
    await sendMetaPurchaseEvent({
      orderNumber: body.orderNumber,
      value: Number(body.value),
      phone: cleanPhone(body.phone),
      items: sanitizeItems(body.items),
      req,
    })

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Purchase tracking xətası:', error)
    return res.status(500).json({ ok: false, error: 'Tracking failed' })
  }
}
