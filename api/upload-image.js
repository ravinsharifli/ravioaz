// api/upload-image.js — müştəri şəklini imgbb-yə SERVERDƏN yükləyir.
// imgbb API açarı artıq brauzerə düşmür (əvvəl VITE_IMGBB_API_KEY JS paketinə yazılırdı —
// hər kəs onu görüb öz şəkillərini sənin hesabına yükləyə bilərdi).
//
// Vercel-də Environment Variable əlavə et:  IMGBB_API_KEY   (Production + Preview)
// Sonra Vercel-dəki köhnə VITE_IMGBB_API_KEY-i SİL və imgbb hesabında açarı YENİLƏ.
import { isAllowedOrigin, rateLimited, parseBody } from '../lib/apiGuard.js'

const MAX_BASE64_CHARS = 4_000_000 // ≈3 MB şəkil; Vercel funksiya sorğu limiti 4.5 MB-dır
const EXPIRATION_SECONDS = '604800' // 7 gün — şəkil sonra imgbb-dən avtomatik silinir

function looksLikeImage(b64) {
  // Yalnız JPEG / PNG / WEBP (fayl başlığına görə — uzantıya yox)
  const head = Buffer.from(b64.slice(0, 24), 'base64')
  const jpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff
  const png = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47
  const webp = head.slice(0, 4).toString('ascii') === 'RIFF' && head.slice(8, 12).toString('ascii') === 'WEBP'
  return jpeg || png || webp
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Only POST allowed' })
  }
  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ ok: false, error: 'Forbidden' })
  }
  if (rateLimited(req, 'upload-image', 8)) {
    return res.status(429).json({ ok: false, error: 'Too many requests' })
  }

  const key = process.env.IMGBB_API_KEY
  if (!key) {
    console.error('IMGBB_API_KEY Vercel-də quraşdırılmayıb')
    return res.status(500).json({ ok: false, error: 'Upload not configured' })
  }

  const body = parseBody(req)
  let b64 = typeof body?.image === 'string' ? body.image : ''
  b64 = b64.replace(/^data:image\/[a-z+]+;base64,/i, '')
  if (!b64 || b64.length > MAX_BASE64_CHARS || !/^[A-Za-z0-9+/]+={0,2}$/.test(b64) || !looksLikeImage(b64)) {
    return res.status(400).json({ ok: false, error: 'Invalid image' })
  }

  try {
    const form = new FormData()
    form.append('image', b64)
    form.append('expiration', EXPIRATION_SECONDS)
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      body: form,
    })
    const data = await response.json().catch(() => null)
    if (!response.ok || !data?.success || !data?.data?.url) {
      console.error('imgbb yükləmə xətası, status:', response.status)
      return res.status(502).json({ ok: false, error: 'Upload failed' })
    }
    return res.status(200).json({ ok: true, url: data.data.url })
  } catch (error) {
    console.error('imgbb sorğu xətası:', error?.message || error)
    return res.status(502).json({ ok: false, error: 'Upload failed' })
  }
}
