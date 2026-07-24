import { sendMetaEvent } from '../lib/metaCapi.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { event, phone } = body || {}

    if (!event) {
      return res.status(400).json({ error: 'event is required' })
    }

    await sendMetaEvent(event, req, phone)
    res.status(200).json({ ok: true })
  } catch (error) {
    console.error('CAPI endpoint xətası:', error)
    res.status(200).json({ ok: false })
  }
}