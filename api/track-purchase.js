import crypto from 'crypto'
import { sendMetaPurchaseEvent } from '../lib/metaCapi.js'
import {
  rateLimited, parseBody, validatePurchase, sanitizeItems, cleanPhone,
} from '../lib/apiGuard.js'

// Bu endpoint HEÇ NƏYİ Sanity-də saxlamır. Yeganə işi — Meta-ya server-side
// "Purchase" (REAL SATIŞ) hadisəsi göndərməkdir.
//
// DİQQƏT — artıq BRAUZERDƏN çağırılmır. Əvvəl sifariş WhatsApp düyməsinə basılan an buradan
// "Purchase" göndərilirdi; bu, hələ ödəniş/beh olmayan sorğunu "satış" kimi saydırırdı və
// reklam rəqəmlərini şişirdirdi. İndi brauzer "Lead" göndərir (/api/capi).
// "Purchase" yalnız beh TƏSDİQLƏNDİKDƏN sonra, server-to-server çağırılmalıdır
// (məs. Make.com və ya Sanity webhook-u sifarişin statusu "Beh ödənildi" olanda).
//
// Qoruma: sorğu başlığında gizli açar tələb olunur — x-ravio-secret: <PURCHASE_WEBHOOK_SECRET>
// (Vercel → Environment Variables). Açar quraşdırılmayıbsa endpoint bağlıdır (503).
// Əvvəlki "Origin" yoxlaması curl ilə asanlıqla saxtalaşdırılırdı — saxta "Purchase" Meta
// reklam statistikasını korlaya bilərdi.
function checkSecret(req) {
  const expected = process.env.PURCHASE_WEBHOOK_SECRET
  if (!expected) return 'disabled'
  const got = Buffer.from(String(req?.headers?.['x-ravio-secret'] || ''))
  const want = Buffer.from(expected)
  return got.length === want.length && crypto.timingSafeEqual(got, want) ? 'ok' : 'denied'
}

const recentOrders = new Map() // orderNumber -> vaxt (best-effort dublikat qoruması)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' })
  }
  const auth = checkSecret(req)
  if (auth === 'disabled') {
    return res.status(503).json({ ok: false, error: 'Disabled: PURCHASE_WEBHOOK_SECRET is not configured' })
  }
  if (auth !== 'ok') {
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
