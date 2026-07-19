import { sendMetaPurchaseEvent } from '../lib/metaCapi.js'

// Bu endpoint HEÇ NƏYİ Sanity-də saxlamır. Yeganə işi — Meta-ya server-side
// Purchase hadisəsi göndərməkdir (reklam optimallaşdırması üçün, brauzerdəki fbq
// Pixel hadisəsinə əlavə olaraq, event_id ilə dublikat sayılmasın deyə).
// Sifariş artıq göndəriləndə WhatsApp-a göndərilib — bu sorğunun uğursuz olması
// müştəriyə heç bir təsir etmir.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

    await sendMetaPurchaseEvent({
      orderNumber: body.orderNumber,
      value: body.value,
      phone: body.phone,
      items: body.items,
      req,
    })

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Purchase tracking xətası:', error)
    return res.status(500).json({ ok: false, error: 'Tracking failed' })
  }
}