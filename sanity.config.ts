// ═══════════════════════════════════════════════════════════════
//  RAVIO — SANITY KONFİQURASİYASI
//  Bu faylı sanity.config.ts ilə əvəzlə
// ═══════════════════════════════════════════════════════════════

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schameTypes'
import {
  SendToManufacturerAction,
  SendToCourierAction,
  MarkReadyAction,
  MarkDeliveredAction,
} from './studio/orderActions'

export default defineConfig({
  name:  'default',
  title: '🛍 Ravio Admin',

  projectId: 'w7scii42',
  dataset:   'production',

  // ── PLUGİNLƏR ─────────────────────────────────────────────
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Ravio')
          .items([

            // ── SİFARİŞLƏR ──────────────────────────────────
            S.listItem()
              .title('🟡 Aktiv Sifarişlər')
              .child(
                S.documentList()
                  .title('Aktiv Sifarişlər')
                  .schemaType('order')
                  .filter('_type == "order" && status != "delivered" && status != "cancelled"')
                  .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
              ),

            S.listItem()
              .title('🟢 Çatdırılmış Sifarişlər')
              .child(
                S.documentList()
                  .title('Çatdırılmış Sifarişlər')
                  .schemaType('order')
                  .filter('_type == "order" && status == "delivered"')
                  .defaultOrdering([{ field: 'deliveredAt', direction: 'desc' }])
              ),

            S.divider(),

            // ── BİZNES TƏRƏFDAŞLARI ─────────────────────────
            S.listItem()
              .title('🔧 İstehsalçılar')
              .child(
                S.documentTypeList('manufacturer').title('İstehsalçılar')
              ),

            S.listItem()
              .title('🚚 Kuryerlər')
              .child(
                S.documentTypeList('courierProvider').title('Kuryerlər')
              ),

            S.divider(),

            // ── MƏHSULLAR ────────────────────────────────────
            S.listItem()
              .title('🛍 Məhsullar')
              .child(
                S.documentTypeList('product').title('Məhsullar')
              ),

            S.listItem()
              .title('📑 Kateqoriyalar')
              .child(
                S.documentTypeList('category').title('Kateqoriyalar')
              ),

            S.divider(),

            // ── SAYT TƏNZİMLƏMƏLƏRİ ─────────────────────────
            S.listItem()
              .title('⚙️ Sayt Tənzimləmələri')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
                  .title('Sayt Tənzimləmələri')
              ),
          ]),
    }),
  ],

  // ── SXEMLƏR ───────────────────────────────────────────────
  schema: {
    types: schemaTypes,
  },

  // ── DOCUMENT ACTIONs (DÜYMƏLƏR) ──────────────────────────
  //  "Sifariş" sənədinə xüsusi düymələr əlavə edilir.
  //  Digər sənəd tiplərində standart davranış saxlanılır.
  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'order') {
        return [
          // Ravio xüsusi düymələri (sifariş iş axını)
          SendToManufacturerAction,
          MarkReadyAction,
          SendToCourierAction,
          MarkDeliveredAction,
          // Sanity standart düymələri (Publish, Delete, s.)
          ...prev,
        ]
      }
      return prev
    },
  },
})