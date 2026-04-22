export default {
  name: 'order',
  title: '📦 Sifarişlər',
  type: 'document',
  fields: [
    {
      name: 'orderId',
      title: 'Sifariş №',
      type: 'string',
      readOnly: true,
      description: 'Avtomatik yaranır',
    },
    {
      name: 'status',
      title: '📊 Status',
      type: 'string',
      options: {
        list: [
          { title: '🟡 Yeni', value: 'new' },
          { title: '🔵 Hazırlanır', value: 'preparing' },
          { title: '🟢 Hazırdır', value: 'ready' },
          { title: '🚚 Yolda', value: 'shipped' },
          { title: '✅ Tamamlandı', value: 'done' },
          { title: '❌ Ləğv edildi', value: 'cancelled' },
        ],
        layout: 'radio',
      },
      initialValue: 'new',
    },
    {
      name: 'customerName',
      title: '👤 Müştəri adı',
      type: 'string',
    },
    {
      name: 'phone',
      title: '📞 Telefon',
      type: 'string',
    },
    {
      name: 'deliveryMethod',
      title: '🚚 Çatdırılma üsulu',
      type: 'string',
    },
    {
      name: 'deliveryDetails',
      title: '📍 Çatdırılma detalları',
      type: 'string',
    },
    {
      name: 'totalAmount',
      title: '💰 Ümumi məbləğ (₼)',
      type: 'number',
    },
    {
      name: 'depositAmount',
      title: '💳 Beh (50%) (₼)',
      type: 'number',
    },
    {
      name: 'items',
      title: '🛍 Məhsullar',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'productName', title: 'Məhsul', type: 'string' },
            { name: 'modelName',   title: 'Model',   type: 'string' },
            { name: 'colorName',   title: 'Rəng',    type: 'string' },
            { name: 'quantity',    title: 'Say',     type: 'number' },
            { name: 'price',       title: 'Qiymət',  type: 'number' },
            { name: 'customText',  title: 'Yazı/Qeyd', type: 'string' },
            { name: 'boxType',     title: 'Qutu',    type: 'string' },
          ],
          preview: {
            select: {
              title: 'productName',
              qty: 'quantity',
              price: 'price',
            },
            prepare({ title, qty, price }) {
              return {
                title: title || 'Məhsul',
                subtitle: `${qty} ədəd · ${price} ₼`,
              };
            },
          },
        },
      ],
    },
    {
      name: 'note',
      title: '📝 Admin qeyd',
      type: 'text',
      description: 'Özün üçün qeyd. Müştəriyə görünmür.',
    },
    {
      name: 'createdAt',
      title: '📅 Sifariş tarixi',
      type: 'datetime',
      readOnly: true,
    },
  ],
  preview: {
    select: {
      title: 'customerName',
      orderId: 'orderId',
      status: 'status',
      totalAmount: 'totalAmount',
      createdAt: 'createdAt',
    },
    prepare({ title, orderId, status, totalAmount, createdAt }) {
      const statusEmoji = {
        new: '🟡',
        preparing: '🔵',
        ready: '🟢',
        shipped: '🚚',
        done: '✅',
        cancelled: '❌',
      };
      const date = createdAt ? new Date(createdAt).toLocaleDateString('az-AZ') : '';
      return {
        title: `${statusEmoji[status] || '🟡'} ${title || 'Müştəri'} — ${orderId || ''}`,
        subtitle: `${totalAmount ? totalAmount + ' ₼' : ''} · ${date}`,
      };
    },
  },
  orderings: [
    {
      title: 'Tarixə görə (yeni əvvəl)',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
    {
      title: 'Statusa görə',
      name: 'statusAsc',
      by: [{ field: 'status', direction: 'asc' }],
    },
  ],
}