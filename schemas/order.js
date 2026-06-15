export default {
  name: 'order',
  title: 'Sifariş',
  type: 'document',

  fields: [
    {
      name: 'orderNumber',
      title: 'Sifariş nömrəsi',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'createdAt',
      title: 'Sifariş tarixi',
      type: 'datetime',
      readOnly: true,
    },
    {
      name: 'year',
      title: 'İl',
      type: 'number',
      readOnly: true,
    },
    {
      name: 'month',
      title: 'Ay',
      type: 'number',
      readOnly: true,
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Yeni', value: 'new' },
          { title: 'Hazırlanır', value: 'preparing' },
          { title: 'Kuryerdədir', value: 'delivery' },
          { title: 'Tamamlandı', value: 'done' },
          { title: 'Ləğv edildi', value: 'cancelled' },
        ],
      },
      initialValue: 'new',
    },
    {
      name: 'customer',
      title: 'Müştəri',
      type: 'object',
      fields: [
        { name: 'name', title: 'Ad', type: 'string' },
        { name: 'phone', title: 'Telefon', type: 'string' },
        { name: 'birthDate', title: 'Doğum tarixi', type: 'string' },
      ],
    },
    {
      name: 'items',
      title: 'Məhsullar',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'productId', title: 'Məhsul ID', type: 'string' },
            { name: 'productName', title: 'Məhsul adı', type: 'string' },
            { name: 'modelName', title: 'Model', type: 'string' },
            { name: 'colorName', title: 'Rəng', type: 'string' },
            { name: 'quantity', title: 'Say', type: 'number' },
            { name: 'unitPrice', title: 'Vahid qiymət', type: 'number' },
            { name: 'totalPrice', title: 'Cəmi', type: 'number' },
            { name: 'customText', title: 'Yazı / qeyd', type: 'text' },
            { name: 'specialRequest', title: 'Xüsusi istək', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'delivery',
      title: 'Çatdırılma',
      type: 'object',
      fields: [
        { name: 'type', title: 'Çatdırılma növü', type: 'string' },
        { name: 'address', title: 'Ünvan', type: 'text' },
        { name: 'metro', title: 'Metro', type: 'string' },
        { name: 'date', title: 'Tarix', type: 'string' },
        { name: 'time', title: 'Saat', type: 'string' },
      ],
    },
    {
      name: 'financial',
      title: 'Maliyyə',
      type: 'object',
      fields: [
        { name: 'subtotal', title: 'Məhsulların cəmi', type: 'number' },
        { name: 'deliveryFee', title: 'Çatdırılma haqqı', type: 'number' },
        { name: 'total', title: 'Ümumi məbləğ', type: 'number' },
        { name: 'deposit', title: 'Beh', type: 'number' },
        { name: 'remaining', title: 'Qalıq', type: 'number' },
      ],
    },
    {
      name: 'fullMessage',
      title: 'Tam mesaj',
      type: 'text',
      rows: 8,
    },
    {
      name: 'productionMessage',
      title: 'İstehsalçı üçün mesaj',
      type: 'text',
      rows: 8,
    },
    {
      name: 'courierMessage',
      title: 'Kuryer üçün mesaj',
      type: 'text',
      rows: 8,
    },
    {
      name: 'ownerNote',
      title: 'Öz qeydin',
      type: 'text',
    },
  ],

  preview: {
    select: {
      orderNumber: 'orderNumber',
      customerName: 'customer.name',
      total: 'financial.total',
      createdAt: 'createdAt',
      status: 'status',
    },
    prepare(value) {
      const statusMap = {
        new: 'Yeni',
        preparing: 'Hazırlanır',
        delivery: 'Kuryerdədir',
        done: 'Tamamlandı',
        cancelled: 'Ləğv edildi',
      }

      return {
        title: `${value.orderNumber || 'Yeni sifariş'} - ${value.customerName || 'Müştəri'}`,
        subtitle: `${statusMap[value.status] || value.status || ''} | ${value.total || 0} AZN`,
      }
    },
  },
}