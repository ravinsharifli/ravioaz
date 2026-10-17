// Ravio qiymət düsturu — TƏK MƏNBƏ. Kalkulyator səhifəsi və (sonra) Sanity Studio eyni funksiyanı işlədəcək.
//
// Məntiq:
//  K  = alış + kuryer + qablaşdırma + əlavə xərc          (sabit xərclər daxil)
//  Müştəri ödədiyi məbləğin 5%-i yardıma ayrılır, qalan hissədən xərclər çıxılır.
//  Hədəf xalis qazanc = istifadəçinin yazdığı məbləğ (₼). Faiz yalnız nəticə kimi göstərilir.
//  D (endirimli qiymət, hər gün satış qiyməti) elə seçilir ki, planlaşdırılan MAKSİMUM
//  kampaniya endirimi (D-nin üstündən) + 20% müştəri endirimi birlikdə olsa belə hədəf qazanc qorunsun.
//  P (üstü cızılmış qiymət) yalnız görünüş üçündür: D-dən displayPct qədər yuxarı.

export const DEFAULTS = {
  courier: 5,        // ₼, hər məhsula
  packaging: 1,      // ₼, hər məhsula
  extra: 0,          // ₼, hər məhsula üçün spontan əlavə xərc (hər dəfə əl ilə yazılır)
  aidPct: 5,         // % — müştərinin ödədiyi məbləğdən
  customerPct: 20,   // % — yeni/daimi müştəri endirimi
  reservePct: 20,    // % — planlaşdırılan MAKSİMUM kampaniya endirimi (endirimli qiymətdən)
  displayPct: 20,    // % — üstü cızılmış qiymətlə endirimli qiymət arasında görünən endirim (saytda "−20%" kimi)
  ending: 0.9,       // qiymətin sonu x.90 — "keyfiyyətli, ucuz deyil" hissi verir; .99 daha çox "yenilik" kimi oxunur
};

const r2 = (n) => Math.round(n * 100) / 100;

// Qiyməti YUXARI doğru istənilən sonluğa yuvarlaqlaşdırır (qazanc heç vaxt azalmır).
export function roundUpTo(value, ending) {
  if (!(value > 0)) return 0;
  if (!ending) return Math.ceil(value - 1e-9);
  return r2(Math.ceil(value - ending - 1e-9) + ending);
}

// Müştəri `paid` ödəyəndə xalis qazanc (₼). customer=true → əlavə 20% müştəri endirimi.
export function netProfit(paid, cost, o, customer) {
  const received = paid * (customer ? 1 - o.customerPct / 100 : 1);
  return r2(received * (1 - o.aidPct / 100) - cost - o.courier - o.packaging - (o.extra || 0));
}

export function calcPrice(cost, targetProfit, opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  if (!(cost > 0)) return null;
  const target = Math.max(0, targetProfit || 0);
  const fixed = cost + o.courier + o.packaging + (o.extra || 0);
  const keep = (1 - o.aidPct / 100) * (1 - o.customerPct / 100);
  const dRaw = (fixed + target) / (keep * (1 - o.reservePct / 100));
  const discountPrice = roundUpTo(dRaw, o.ending);
  let price = o.displayPct > 0 ? roundUpTo(discountPrice / (1 - o.displayPct / 100), o.ending) : discountPrice;
  if (o.displayPct > 0 && price <= discountPrice) price = r2(discountPrice + 1);
  const campaign = (pct) => r2(discountPrice * (1 - pct / 100));
  // Zərərsiz kampaniya həddi: kampaniya qiyməti + 20% müştəri endirimi ilə qazanc = 0
  const breakEven = 1 - fixed / (keep * discountPrice);
  return {
    price, discountPrice, target: r2(target), fixed: r2(fixed),
    pct: (profit) => r2(profit / cost * 100),
    campaign,
    breakEvenCampaignPct: Math.max(0, Math.floor(breakEven * 1000) / 10),
    profit: (paid, customer) => netProfit(paid, cost, o, customer),
    options: o,
  };
}
