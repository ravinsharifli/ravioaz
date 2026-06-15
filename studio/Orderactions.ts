// ═══════════════════════════════════════════════════════════════
//  RAVIO — ORDER DOCUMENT ACTIONS
//  Bu düymələr Sanity Studio-da hər sifarişin üstündə görünür.
//  Bu faylı: studio/orderActions.ts  kimi saxla
// ═══════════════════════════════════════════════════════════════
//
//  📋 İSTEHSALÇIYA GÖNDƏR  → yalnız məhsul adı, model, yazı göndərir
//  🚚 KURYERƏ GÖNDƏR        → yalnız çatdırılma məlumatı göndərir
//  ✅ HAZIRDIR               → status "ready" edir
//  🟢 ÇATDIRILDI            → status "delivered" edir
//
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { useDocumentOperation, useToast } from 'sanity'

// ── MAKE.COM WEBHOOK URL-LƏRİ ─────────────────────────────────
// Make.com-da scenario yaratdıqdan sonra bu URL-ləri dəyişdirəcəksən.
// İndi "PLACEHOLDER" yazılıb — hazır olduqda əvəzlənəcək.

const MAKE_MANUFACTURER_WEBHOOK =
  import.meta.env.VITE_MAKE_MANUFACTURER_WEBHOOK ||
  'PLACEHOLDER_MANUFACTURER_WEBHOOK'

const MAKE_COURIER_WEBHOOK =
  import.meta.env.VITE_MAKE_COURIER_WEBHOOK ||
  'PLACEHOLDER_COURIER_WEBHOOK'


// ═══════════════════════════════════════════════════════════════
//  1. İSTEHSALÇIYA GÖNDƏR
//     Yalnız istehsal üçün lazım olan məlumatlar gedir:
//     məhsul adı, model, rəng, say, yazı, xüsusi istək
//     HEÇ BİR QİYMƏT, MÜŞTƏRİ TELEFONU göndərilmir
// ═══════════════════════════════════════════════════════════════
export function SendToManufacturerAction(props) {
  const { id, type, draft, published } = props
  const doc = draft || published
  const { patch, commit } = useDocumentOperation(id, type)
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // İstehsalçı seçilmədisə düyməni deaktiv et
  const manufacturerSelected = Boolean(doc?.manufacturer?._ref)
  const alreadySent = ['manufacturing', 'ready', 'in_transit', 'delivered'].includes(doc?.status)

  return {
    label: isLoading ? '⏳ Göndərilir...' : '📋 İstehsalçıya Göndər',
    tone: 'positive',
    disabled: isLoading || !manufacturerSelected || alreadySent || !doc,
    title: !manufacturerSelected
      ? 'Əvvəlcə istehsalçı seç'
      : alreadySent
        ? 'Artıq göndərilib'
        : 'İstehsal məlumatlarını göndər',

    onHandle: async () => {
      if (!doc) return

      const confirmed = window.confirm(
        `"${doc.manufacturer?.name || 'İstehsalçı'}"ya sifariş göndərilsin?\n\n` +
        `📦 ${doc.items?.length || 0} məhsul\n` +
        `📋 ${doc.orderNumber}\n\n` +
        `⚠️ Qiymət və müştəri məlumatları göndərilmir — yalnız istehsal üçün lazım olanlar.`
      )
      if (!confirmed) return

      setIsLoading(true)
      try {
        // Yalnız istehsal üçün lazım olan məlumatlar
        const manufacturerPayload = {
          orderNumber:      doc.orderNumber,
          manufacturerName: doc.manufacturer?.name || '',
          manufacturerPhone:doc.manufacturer?.phone || '',
          items: (doc.items || []).map(item => ({
            productName:    item.productName || '',
            modelName:      item.modelName   || '',
            colorName:      item.colorName   || '',
            quantity:       item.quantity    || 1,
            customText:     item.customText  || '',
            specialRequest: item.specialRequest || '',
          })),
          ownerNote: doc.ownerNotes || '',
        }

        // Make.com webhookuna göndər
        const resp = await fetch(MAKE_MANUFACTURER_WEBHOOK, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(manufacturerPayload),
        })

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

        // Statusu yenilə
        patch.execute([{
          set: {
            status: 'manufacturing',
            sentToManufacturerAt: new Date().toISOString(),
          },
        }])
        commit.execute()

        toast.push({
          status:      'success',
          title:       '✅ İstehsalçıya göndərildi!',
          description: `${doc.manufacturer?.name || ''} WhatsApp-da məlumat alacaq.`,
        })
      } catch (err) {
        console.error('Manufacturer webhook error:', err)
        toast.push({
          status:      'error',
          title:       '❌ Göndərilmədi',
          description: 'Make.com webhook URL-ni yoxla. (studio/orderActions.ts)',
        })
      }
      setIsLoading(false)
    },
  }
}


// ═══════════════════════════════════════════════════════════════
//  2. KURYERƏ GÖNDƏR
//     Yalnız çatdırılma üçün lazım olan məlumatlar gedir:
//     müştəri adı, telefon, ünvan, tarix, qalan məbləğ
//     İSTEHSAL SIRRI (qiymət, endirim kodu) göndərilmir
// ═══════════════════════════════════════════════════════════════
export function SendToCourierAction(props) {
  const { id, type, draft, published } = props
  const doc = draft || published
  const { patch, commit } = useDocumentOperation(id, type)
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const courierSelected = Boolean(doc?.courierProvider?._ref)
  const orderReady = ['ready', 'pending', 'manufacturing'].includes(doc?.status)
  const alreadyDelivered = doc?.status === 'delivered' || doc?.status === 'cancelled'

  return {
    label: isLoading ? '⏳ Göndərilir...' : '🚚 Kuryerə Göndər',
    tone: 'primary',
    disabled: isLoading || !courierSelected || alreadyDelivered || !doc,
    title: !courierSelected
      ? 'Əvvəlcə kuryer seç'
      : alreadyDelivered
        ? 'Sifariş artıq tamamlanıb'
        : 'Çatdırılma məlumatlarını göndər',

    onHandle: async () => {
      if (!doc) return

      const del = doc.delivery || {}
      const fin = doc.financial || {}

      const confirmed = window.confirm(
        `"${doc.courierProvider?.name || 'Kuryer'}"ə çatdırılma göndərilsin?\n\n` +
        `👤 Müştəri: ${doc.customer?.name || ''}\n` +
        `📍 ${del.type === 'metro' ? 'Metro: ' + del.metro : 'Ünvan: ' + del.address}\n` +
        `📅 ${del.date || ''} ${del.time ? '· Saat ' + del.time : ''}\n` +
        `💰 Qalan məbləğ: ${fin.remaining?.toFixed(2) || '0'}₼`
      )
      if (!confirmed) return

      setIsLoading(true)
      try {
        // Kuryer üçün yalnız çatdırılma məlumatları
        const courierPayload = {
          orderNumber:   doc.orderNumber,
          courierName:   doc.courierProvider?.name  || '',
          courierPhone:  doc.courierProvider?.phone || '',
          courierType:   doc.courierProvider?.type  || 'whatsapp',

          // Columba API üçün əlavə
          columbaApiToken: doc.courierProvider?.apiToken || '',

          customer: {
            name:  doc.customer?.name  || '',
            phone: doc.customer?.phone || '',
          },
          delivery: {
            type:    del.type    || '',
            metro:   del.metro   || '',
            address: del.address || '',
            date:    del.date    || '',
            time:    del.time    || '',
          },
          pickup: {
            manufacturerName:  doc.manufacturer?.name  || '',
            manufacturerPhone: doc.manufacturer?.phone || '',
          },
          financial: {
            total:     fin.total     || 0,
            deposit:   fin.deposit   || 0,
            remaining: fin.remaining || 0,
          },
        }

        // Make.com webhookuna göndər
        const resp = await fetch(MAKE_COURIER_WEBHOOK, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(courierPayload),
        })

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

        // Statusu yenilə
        patch.execute([{
          set: {
            status: 'in_transit',
            sentToCourierAt: new Date().toISOString(),
          },
        }])
        commit.execute()

        toast.push({
          status:      'success',
          title:       '🚚 Kuryerə göndərildi!',
          description: `${doc.courierProvider?.name || ''} məlumat aldı.`,
        })
      } catch (err) {
        console.error('Courier webhook error:', err)
        toast.push({
          status:      'error',
          title:       '❌ Göndərilmədi',
          description: 'Make.com webhook URL-ni yoxla. (studio/orderActions.ts)',
        })
      }
      setIsLoading(false)
    },
  }
}


// ═══════════════════════════════════════════════════════════════
//  3. HAZIRDIR
//     İstehsalçı "hazır" dediyi zaman bas.
//     Status "ready" olur, tarix qeyd edilir.
// ═══════════════════════════════════════════════════════════════
export function MarkReadyAction(props) {
  const { id, type, draft, published } = props
  const doc = draft || published
  const { patch, commit } = useDocumentOperation(id, type)
  const toast = useToast()

  const canMarkReady = doc?.status === 'manufacturing' || doc?.status === 'pending'

  return {
    label: '✅ Hazırdır (istehsalçı bildirdi)',
    tone: 'positive',
    disabled: !canMarkReady || !doc,
    title: canMarkReady ? 'İstehsal tamamlandı' : 'Bu status üçün uyğun deyil',

    onHandle: () => {
      patch.execute([{
        set: {
          status:  'ready',
          readyAt: new Date().toISOString(),
        },
      }])
      commit.execute()
      toast.push({
        status: 'success',
        title:  '✅ Status: Hazırdır',
        description: 'İndi kuryeri seçib "Kuryerə Göndər" basa bilərsən.',
      })
    },
  }
}


// ═══════════════════════════════════════════════════════════════
//  4. ÇATDIRILDI
//     Kuryer çatdırdıqdan sonra bas.
//     Sifariş "Çatdırılmış Sifarişlər" bölməsinə keçir.
// ═══════════════════════════════════════════════════════════════
export function MarkDeliveredAction(props) {
  const { id, type, draft, published } = props
  const doc = draft || published
  const { patch, commit } = useDocumentOperation(id, type)
  const toast = useToast()

  const canMarkDelivered = ['in_transit', 'ready', 'manufacturing', 'pending'].includes(doc?.status)

  return {
    label: '🟢 Çatdırıldı ✓',
    tone: 'positive',
    disabled: !canMarkDelivered || doc?.status === 'delivered' || !doc,
    title: doc?.status === 'delivered' ? 'Artıq çatdırılıb' : 'Sifarişi tamamla',

    onHandle: () => {
      const confirmed = window.confirm(
        `"${doc?.orderNumber}" sifarişi çatdırılmış kimi işarələnsin?\n\n` +
        `Bu sifariş "Çatdırılmış Sifarişlər" bölməsinə keçəcək.`
      )
      if (!confirmed) return

      patch.execute([{
        set: {
          status:      'delivered',
          deliveredAt: new Date().toISOString(),
        },
      }])
      commit.execute()
      toast.push({
        status: 'success',
        title:  '🟢 Çatdırıldı!',
        description: `${doc?.orderNumber} uğurla tamamlandı.`,
      })
    },
  }
}