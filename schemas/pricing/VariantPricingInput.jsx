// Variantın içindəki qiymət kalkulyatoru (Sanity Studio).
// Alış qiyməti və xalis qazancı yazırsan → "Əsas qiymət" (price) və "Endirimli qiymət" (discountPrice)
// avtomatik doldurulur. Alış qiyməti, qazanc və əlavə xərc heç yerdə SAXLANMIR (dataset açıqdır) —
// yalnız hesablanmış satış qiymətləri yazılır.
import {useEffect, useMemo, useRef, useState} from 'react'
import {set, useClient} from 'sanity'
import {calcPrice, DEFAULTS} from './pricingFormula'

const SETTINGS_QUERY = `coalesce(*[_id == "drafts.siteSettings"][0], *[_id == "siteSettings"][0]){
  pricingCourier, pricingPackaging, pricingAidPct, pricingCustomerPct,
  pricingCampaignPct, pricingDisplayPct, pricingEnding
}`

// Eyni formada 10 variant var — tənzimləmələri hər biri üçün ayrıca çəkməmək üçün qısa keş.
let cache = {at: 0, promise: null}
function loadSettings(client) {
  if (!cache.promise || Date.now() - cache.at > 30000) {
    cache = {at: Date.now(), promise: client.fetch(SETTINGS_QUERY).catch(() => null)}
  }
  return cache.promise
}

const pick = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d)
function toOpts(raw) {
  const r = raw || {}
  const ending = parseFloat(r.pricingEnding)
  return {
    courier: pick(r.pricingCourier, DEFAULTS.courier),
    packaging: pick(r.pricingPackaging, DEFAULTS.packaging),
    aidPct: pick(r.pricingAidPct, DEFAULTS.aidPct),
    customerPct: pick(r.pricingCustomerPct, DEFAULTS.customerPct),
    reservePct: pick(r.pricingCampaignPct, DEFAULTS.reservePct),
    displayPct: pick(r.pricingDisplayPct, DEFAULTS.displayPct),
    ending: Number.isFinite(ending) ? ending : DEFAULTS.ending,
  }
}

const num = (v) => {
  const x = parseFloat(String(v).replace(',', '.'))
  return Number.isFinite(x) ? x : null
}
const fmt = (n) => (Math.round(n * 100) / 100).toFixed(2)

const box = {
  border: '1px solid var(--card-border-color, rgba(128,128,128,.4))',
  borderRadius: 4,
  padding: 12,
  marginBottom: 16,
}
const muted = {color: 'var(--card-muted-fg-color, #8a8a8a)', fontSize: 13}
const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  font: 'inherit',
  fontSize: 16, // iOS-da yaxınlaşmanın qarşısını alır
  padding: '8px 10px',
  borderRadius: 3,
  border: '1px solid var(--card-border-color, rgba(128,128,128,.5))',
  background: 'var(--card-bg-color, transparent)',
  color: 'var(--card-fg-color, inherit)',
}

function Field({label, value, onChange, disabled, placeholder}) {
  return (
    <label style={{display: 'block', fontSize: 13, fontWeight: 600}}>
      {label}
      <input
        type="text"
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{...inputStyle, marginTop: 4}}
      />
    </label>
  )
}

export function VariantPricingInput(props) {
  const {value, onChange, renderDefault, readOnly} = props
  const client = useClient({apiVersion: '2024-01-01'})
  const [cfg, setCfg] = useState(null)
  const [cost, setCost] = useState('')
  const [profit, setProfit] = useState('')
  const [extra, setExtra] = useState('')
  const touched = useRef(false)
  const latest = useRef({value, onChange})
  latest.current = {value, onChange}
  const clientRef = useRef(client)
  clientRef.current = client

  // Tənzimləmələr yalnız panel açılanda bir dəfə yüklənir (client-in kimliyindən asılı olmayaraq).
  useEffect(() => {
    let alive = true
    loadSettings(clientRef.current).then((raw) => alive && setCfg(toOpts(raw)))
    return () => {
      alive = false
    }
  }, [])

  const costN = num(cost)
  const profitN = num(profit)
  const extraN = num(extra) || 0
  const result = useMemo(() => {
    if (!cfg || !(costN > 0) || profitN === null || profitN < 0) return null
    return calcPrice(costN, profitN, {...cfg, extra: extraN})
  }, [cfg, costN, profitN, extraN])

  const price = result ? result.price : null
  const discountPrice = result ? result.discountPrice : null

  // Yalnız istifadəçi alış/qazanc/əlavə xərci dəyişəndə yazır (köhnə məhsulu açmaq heç nəyi dəyişmir).
  useEffect(() => {
    if (!touched.current || readOnly || price === null) return undefined
    const t = setTimeout(() => {
      const cur = latest.current.value || {}
      if (cur.price === price && cur.discountPrice === discountPrice) return
      latest.current.onChange([set(price, ['price']), set(discountPrice, ['discountPrice'])])
    }, 500)
    return () => clearTimeout(t)
  }, [price, discountPrice, readOnly])

  const edit = (setter) => (v) => {
    touched.current = true
    setter(v)
  }

  const applied = result && value && value.price === price && value.discountPrice === discountPrice
  const worst = result ? result.profit(result.campaign(cfg.reservePct), true) : null
  const badge = result && price > discountPrice ? Math.round((1 - discountPrice / price) * 100) : 0

  return (
    <div>
      <div style={box}>
        <div style={{fontWeight: 700, marginBottom: 10}}>🧮 Qiymət kalkulyatoru</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10}}>
          <Field label="Alış qiyməti (₼)" value={cost} onChange={edit(setCost)} disabled={readOnly} placeholder="məs. 5" />
          <Field label="Xalis qazanc (₼)" value={profit} onChange={edit(setProfit)} disabled={readOnly} placeholder="məs. 3" />
          <Field label="Əlavə xərc (₼)" value={extra} onChange={edit(setExtra)} disabled={readOnly} placeholder="0" />
        </div>

        {!cfg && <p style={{...muted, margin: '10px 0 0'}}>Tənzimləmələr yüklənir…</p>}
        {cfg && !result && (
          <p style={{...muted, margin: '10px 0 0'}}>
            Alış qiymətini və qalmasını istədiyin xalis qazancı yaz. Əsas qiymət və Endirimli qiymət aşağıda avtomatik
            doldurulacaq. Bu rəqəmlər heç yerdə saxlanmır, yalnız hesablanmış qiymətlər yazılır.
          </p>
        )}
        {result && (
          <div style={{marginTop: 12}}>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'baseline'}}>
              <div>
                <div style={muted}>Əsas qiymət</div>
                <div style={{fontSize: 20, fontWeight: 700, textDecoration: 'line-through', opacity: 0.7}}>{fmt(price)} ₼</div>
              </div>
              <div>
                <div style={muted}>Endirimli qiymət</div>
                <div style={{fontSize: 24, fontWeight: 800}}>{fmt(discountPrice)} ₼</div>
              </div>
              {badge > 0 && <div style={{fontWeight: 700}}>−{badge}%</div>}
            </div>
            <p style={{...muted, margin: '8px 0 0'}}>
              Qazanc alışa görə {result.pct(profitN)}%. Müştəri {cfg.customerPct}% endirim seçəndə {fmt(result.profit(discountPrice, true))} ₼, ən pis halda ({cfg.reservePct}% kampaniya + {cfg.customerPct}% müştəri) {fmt(worst)} ₼ qalır.
            </p>
            <p style={{margin: '8px 0 0', fontSize: 13, fontWeight: 600}}>
              {applied ? '✅ Qiymətlər aşağıdakı xanalara yazıldı.' : '⏳ Qiymətlər yazılır…'}
            </p>
          </div>
        )}
        {cfg && (
          <p style={{...muted, margin: '10px 0 0', fontSize: 12}}>
            Xərclər: kuryer {cfg.courier} ₼ · qablaşdırma {cfg.packaging} ₼ · yardım {cfg.aidPct}% · əlavə {fmt(extraN)} ₼. Dəyişmək üçün: Sayt tənzimləmələri → Qiymət kalkulyatoru.
          </p>
        )}
      </div>
      {renderDefault(props)}
    </div>
  )
}
