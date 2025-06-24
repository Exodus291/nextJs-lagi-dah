import formatRupiah from './rupiah';
import { BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer';

export const printReceipt = async (orderData) => {
  const dateObj = orderData.transactionDate ? new Date(orderData.transactionDate) : new Date();
  const tanggal = dateObj.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const jam = dateObj.toLocaleTimeString('id-ID');

  await BluetoothEscposPrinter.printText(
    `${orderData.store?.name || 'ELAINA POS'}\r\n`, {}
  );
  await BluetoothEscposPrinter.printText(
    `${tanggal} ${jam}\r\n`, {}
  );
  if (orderData.user?.name) {
    await BluetoothEscposPrinter.printText(
      `Kasir: ${orderData.user.name}\r\n`, {}
    );
  }
  if (orderData.customerName) {
    await BluetoothEscposPrinter.printText(
      `Customer: ${orderData.customerName}\r\n`, {}
    );
  }
  await BluetoothEscposPrinter.printText('------------------------------\r\n', {});
  for (const item of orderData.transactionItems) {
    await BluetoothEscposPrinter.printText(
      `${item.menu?.name || item.menuName || '-'}\r\n`, {}
    );
    await BluetoothEscposPrinter.printText(
      `${item.quantity} x ${formatRupiah(item.priceAtTransaction)} = ${formatRupiah(item.quantity * item.priceAtTransaction)}\r\n`, {}
    );
  }
  await BluetoothEscposPrinter.printText('------------------------------\r\n', {});
  await BluetoothEscposPrinter.printText(
    `Total: ${formatRupiah(orderData.totalAmount)}\r\n`, {}
  );
  await BluetoothEscposPrinter.printText(
    `Pembayaran: ${orderData.paymentMethod?.toUpperCase() || 'TUNAI'}\r\n`, {}
  );
  if (orderData.customerNote) {
    await BluetoothEscposPrinter.printText(
      `Note: ${orderData.customerNote}\r\n`, {}
    );
  }
  await BluetoothEscposPrinter.printText('\r\nTerima kasih atas kunjungan Anda!\r\n', {});
  await BluetoothEscposPrinter.printText(`--- ${orderData.store?.name || 'Elaina POS'} ---\r\n\r\n`, {});
};
