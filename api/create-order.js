import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'w7scii42',
  dataset: 'production',
  apiVersion: '2026-02-09',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' })
  }

  if (!process.env.SANITY_WRITE_TOKEN) {
    return res.status(500).json({ error: 'SANITY_WRITE_TOKEN is missing' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const now = new Date()

    const doc = {
      _type: 'order',
      orderNumber: body.orderNumber,
      createdAt: body.createdAt || now.toISOString(),
      year: body.year || now.getFullYear(),
      month: body.month || now.getMonth() + 1,
      status: body.status || 'new',

      customer: body.customer || {},
      items: body.items || [],
      delivery: body.delivery || {},
      financial: body.financial || {},

      fullMessage: body.fullMessage || '',
      productionMessage: body.productionMessage || '',
      courierMessage: body.courierMessage || '',
      ownerNote: '',
    }

    const result = await client.create(doc)

    return res.status(200).json({
      ok: true,
      id: result._id,
      orderNumber: result.orderNumber,
    })
  } catch (error) {
    console.error('Create order error:', error)
    return res.status(500).json({
      ok: false,
      error: 'Order could not be created',
    })
  }
}