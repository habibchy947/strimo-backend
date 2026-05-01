import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

export interface IInvoiceData {
  transactionId: string;
  paidAt: Date;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  itemName: string;
  itemType: 'SUBSCRIPTION' | 'PURCHASE';
}

export const generateInvoicePdfBuffer = async (data: IInvoiceData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Header
      doc
        .fillColor('#444444')
        .fontSize(20)
        .text('Strimo', 50, 57)
        .fontSize(10)
        .text('Strimo Inc.', 200, 50, { align: 'right' })
        .text('123 Streaming Street', 200, 65, { align: 'right' })
        .text('Dhaka, Bangladesh', 200, 80, { align: 'right' })
        .moveDown();

      // Line
      doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();

      // Invoice Info
      doc
        .fillColor('#444444')
        .fontSize(20)
        .text('Invoice', 50, 120);

      doc
        .fontSize(10)
        .text(`Invoice Number: ${data.transactionId}`, 50, 150)
        .text(`Invoice Date: ${new Date(data.paidAt).toLocaleDateString()}`, 50, 165)
        .text(`Balance Due: ${data.amount} ${data.currency.toUpperCase()}`, 50, 180)

        .text(data.customerName, 300, 150, { align: 'right' })
        .text(data.customerEmail, 300, 165, { align: 'right' })
        .moveDown();

      // Table Header
      const tableTop = 220;
      doc
        .fontSize(10)
        .text('Item', 50, tableTop)
        .text('Description', 150, tableTop)
        .text('Unit Cost', 280, tableTop, { width: 90, align: 'right' })
        .text('Quantity', 370, tableTop, { width: 90, align: 'right' })
        .text('Line Total', 460, tableTop, { width: 90, align: 'right' });

      doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Table Row
      const rowTop = tableTop + 30;
      doc
        .fontSize(10)
        .text(data.itemType, 50, rowTop)
        .text(data.itemName, 150, rowTop)
        .text(`${data.amount} ${data.currency.toUpperCase()}`, 280, rowTop, { width: 90, align: 'right' })
        .text('1', 370, rowTop, { width: 90, align: 'right' })
        .text(`${data.amount} ${data.currency.toUpperCase()}`, 460, rowTop, { width: 90, align: 'right' });

      doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, rowTop + 15).lineTo(550, rowTop + 15).stroke();

      // Summary
      const subtotalTop = rowTop + 50;
      doc
        .fontSize(10)
        .text('Subtotal', 370, subtotalTop, { width: 90, align: 'right' })
        .text(`${data.amount} ${data.currency.toUpperCase()}`, 460, subtotalTop, { width: 90, align: 'right' });

      const totalTop = subtotalTop + 20;
      doc
        .fontSize(10)
        .fillColor('#000000')
        .text('Total', 370, totalTop, { width: 90, align: 'right' })
        .text(`${data.amount} ${data.currency.toUpperCase()}`, 460, totalTop, { width: 90, align: 'right' });

      // Footer
      doc
        .fontSize(10)
        .fillColor('#444444')
        .text('Thank you for your business.', 50, 700, { align: 'center', width: 500 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
