import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ReceiptData } from "../types";

interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export const generateReceipt = (data: ReceiptData) => {
  const doc = new jsPDF({
    unit: "mm",
    format: [80, 150],
  }) as ExtendedJsPDF;

  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  // Header - Dynamic na ito base sa pinasa nating data
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12); // Ginawa nating 12 para safe sa mahabang pangalan
  doc.text(data.shopName || "KREIZZYY SHOP", centerX, 10, { align: "center" });
  
  doc.setFontSize(7); // Mas maliit ng konti para sa address
  doc.setFont("helvetica", "normal");
  doc.text(data.address || "Polangui, Albay, Philippines", centerX, 14, { align: "center" });
  
  doc.setFontSize(7);
  doc.text(`TRX: ${data.id.slice(0, 8).toUpperCase()}`, centerX, 18, { align: "center" });
  doc.text(new Date().toLocaleString(), centerX, 22, { align: "center" });

  doc.line(5, 25, 75, 25);

  // Table of Items
  autoTable(doc, {
    startY: 28,
    margin: { left: 5, right: 5 },
    head: [["Item", "Qty", "Price", "Total"]],
    body: data.items.map((item) => [
      item.name.toUpperCase(), // Uppercase para sa resibo look
      item.quantity.toString(),
      item.price.toFixed(2),
      (item.price * item.quantity).toFixed(2),
    ]),
    theme: "plain",
    styles: { fontSize: 7, cellPadding: 1, font: "helvetica" },
    headStyles: { fontStyle: "bold", textColor: [0, 0, 0] },
  });

  const finalY = doc.lastAutoTable?.finalY || 100;
  const marginY = finalY + 5;

  // Footer / Totals
  doc.line(5, marginY, 75, marginY);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("TOTAL:", 5, marginY + 5);
  doc.text(`PHP ${data.total.toFixed(2)}`, 75, marginY + 5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Payment: ${data.paymentMethod}`, 5, marginY + 10);
  
  doc.setFont("helvetica", "italic");
  doc.text("Thank you for your purchase!", centerX, marginY + 20, { align: "center" });

  doc.save(`receipt-${data.id.slice(0, 8)}.pdf`);
};