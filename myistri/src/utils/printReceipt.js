import formatRupiah from './rupiah';

export const printReceipt = (orderData) => {
  const printWindow = window.open('', '', 'width=300');
  if (!printWindow) return;

  // Format tanggal dan jam dari transactionDate
  const dateObj = orderData.transactionDate ? new Date(orderData.transactionDate) : new Date();
  const tanggal = dateObj.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const jam = dateObj.toLocaleTimeString('id-ID');

  const html = `
    <html>
      <head>
        <style>
          @page {
            size: 58mm auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', monospace;
            width: 58mm;
            padding: 5mm;
            margin: 0;
            font-size: 12px;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 5px 0;
          }
          .item {
            margin-bottom: 5px;
          }
          .total {
            font-weight: bold;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="margin:0;font-size:16px">${orderData.store?.name || 'ELAINA POS'}</h2>
          <p style="margin:5px 0">${tanggal}</p>
          <p style="margin:5px 0">${jam}</p>
          ${orderData.user?.name ? `<p style="margin:5px 0">Kasir: ${orderData.user.name}</p>` : ''}
        </div>
        
        <div class="divider"></div>
        
        ${orderData.customerName ? 
          `<p style="margin:5px 0">Customer: ${orderData.customerName}</p>
           <div class="divider"></div>` : 
          ''}
        
        ${orderData.transactionItems.map(item => `
          <div class="item">
            ${item.menu?.name || item.menuName || '-'}<br/>
            ${item.quantity} x ${formatRupiah(item.priceAtTransaction)} = ${formatRupiah(item.quantity * item.priceAtTransaction)}
          </div>
        `).join('')}
        
        <div class="divider"></div>
        
        <div class="total">
          <p style="margin:5px 0">
            Total: ${formatRupiah(orderData.totalAmount)}
          </p>
          <p style="margin:5px 0">
            Pembayaran: ${orderData.paymentMethod?.toUpperCase() || 'TUNAI'}
          </p>
        </div>
        
        ${orderData.customerNote
          ? `<div class="divider"></div>
             <p style="margin:5px 0">Note: ${orderData.customerNote}</p>`
          : ''
        }
        
        <div class="footer">
          <p style="margin:5px 0">Terima kasih atas kunjungan Anda!</p>
          <p style="margin:5px 0">--- ${orderData.store?.name || 'Elaina POS'} ---</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};


