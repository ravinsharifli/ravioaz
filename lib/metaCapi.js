// Meta Conversions API (server-side) — WhatsApp sifarişləri backend-dən Meta-ya göndərir.
// Bu, brauzerdəki fbq() Pixel hadisəsini TƏKRARLAMIR, ona əlavə olaraq göndərir (dedup: event_id = orderNumber).
import crypto from 'crypto';

const PIXEL_ID = '1660843438327381'; // meta-pixel.js və index.html-dəki ID ilə eynidir
const GRAPH_API_VERSION = 'v23.0';

function sha256(value) {
  return crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');
}

// Azərbaycan nömrələrini Meta-nın gözlədiyi formata (994XXXXXXXXX) çevirir
function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('994')) return digits;
  if (digits.startsWith('0')) return `994${digits.slice(1)}`;
  return `994${digits}`;
}

// Cookie header-dən _fbp / _fbc dəyərlərini oxuyur (bunlar hash EDİLMİR — Meta-nın öz brauzer ID-ləridir)
function parseCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function sendMetaPurchaseEvent({ orderNumber, value, currency = 'AZN', phone, items, req }) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) {
    console.error('META_CAPI_TOKEN Vercel-də quraşdırılmayıb — server-side Meta hadisəsi göndərilmədi');
    return null;
  }

  const userData = {};
  const normalizedPhone = normalizePhone(phone);
  if (normalizedPhone) {
    userData.ph = [sha256(normalizedPhone)];
  }
  const forwardedFor = req?.headers?.['x-forwarded-for'];
  if (forwardedFor) {
    userData.client_ip_address = String(forwardedFor).split(',')[0].trim();
  }
  if (req?.headers?.['user-agent']) {
    userData.client_user_agent = req.headers['user-agent'];
  }
  // Pixel-in brauzerdə qoyduğu _fbp/_fbc cookie-ləri (eyni domendən gələn sorğuda avtomatik gəlir) — Event Match Quality-ni yüksəldir
  const cookieHeader = req?.headers?.cookie;
  const fbp = parseCookie(cookieHeader, '_fbp');
  const fbc = parseCookie(cookieHeader, '_fbc');
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const customData = { currency, value };
  if (Array.isArray(items) && items.length > 0) {
    const contents = items
      .filter((i) => i?.productId)
      .map((i) => ({
        id: i.productId,
        quantity: i.quantity || 1,
        item_price: i.unitPrice,
      }));
    if (contents.length > 0) {
      customData.contents = contents;
      customData.content_ids = contents.map((c) => c.id);
      customData.content_type = 'product';
    }
  }

  const payload = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: String(orderNumber),
        action_source: 'website',
        event_source_url: 'https://ravio.az',
        user_data: userData,
        custom_data: customData,
      },
    ],
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events?access_token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    const result = await response.json();
    if (!response.ok) {
      console.error('Meta CAPI xətası:', result);
    }
    return result;
  } catch (error) {
    console.error('Meta CAPI göndərmə xətası:', error);
    return null;
  }
}

export async function sendMetaEvent(eventName, req, phone) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) {
    console.error('META_CAPI_TOKEN Vercel-də quraşdırılmayıb');
    return null;
  }

  const userData = {};
  const normalizedPhone = normalizePhone(phone);
  if (normalizedPhone) {
    userData.ph = [sha256(normalizedPhone)];
  }
  const forwardedFor = req?.headers?.['x-forwarded-for'];
  if (forwardedFor) {
    userData.client_ip_address = String(forwardedFor).split(',')[0].trim();
  }
  if (req?.headers?.['user-agent']) {
    userData.client_user_agent = req.headers['user-agent'];
  }
  const cookieHeader = req?.headers?.cookie;
  const fbp = parseCookie(cookieHeader, '_fbp');
  const fbc = parseCookie(cookieHeader, '_fbc');
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const eventData = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: req?.headers?.['referer'] || 'https://ravio.az',
    user_data: userData,
  };

  // Vercel-də META_TEST_EVENT_CODE dəyəri əlavə etsən, testlər Events Manager-də görünər.
  // Test bitəndə Vercel-dən sadəcə həmin dəyişəni silərsən, kodu dəyişmək lazım deyil.
  if (process.env.META_TEST_EVENT_CODE) {
    eventData.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  const payload = { data: [eventData] };

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events?access_token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    const result = await response.json();
    if (!response.ok) {
      console.error('Meta CAPI xətası:', result);
    }
    return result;
  } catch (error) {
    console.error('Meta CAPI göndərmə xətası:', error);
    return null;
  }
}