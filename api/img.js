// Bu endpoint WhatsApp sifariş mesajında göstərilən məhsul şəkli linkini
// "təmizləyir": müştəri/istehsalçı ravio.az/api/img?f=... görür, cdn.sanity.io
// və layihə ID-si heç görünmür. lib/CartDrawer.tsx-dəki toCleanImageUrl() bu
// linki qurur, bura gələndə əsl Sanity CDN ünvanına 302 ilə yönləndirir.
//
// TƏHLÜKƏSİZLİK QEYDİ: "f" parametri sərt formata (hash-eninxhündürlük.uzantı)
// uyğun olmalıdır — əks halda 400 qaytarılır. Bu, endpoint-in açıq
// yönləndirici (open redirect) kimi sui-istifadə olunmasının qarşısını alır.
const PROJECT_ID = 'w7scii42';
const DATASET = 'production';
const FILENAME_PATTERN = /^[a-f0-9]{20,64}-\d{1,5}x\d{1,5}\.(jpg|jpeg|png|webp|gif)$/i;

export default function handler(req, res) {
  const f = req.query.f;

  if (!f || typeof f !== 'string' || !FILENAME_PATTERN.test(f)) {
    return res.status(400).send('Yanlış şəkil ünvanı');
  }

  const target = `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${f}`;

  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.writeHead(302, { Location: target });
  res.end();
}
