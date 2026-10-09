export type ReceiptItem = { id: number; qty: number; desc: string; price: number };
export type ReceiptData = { brand: string; tagline: string; startColor: string; endColor: string; items: ReceiptItem[]; totalOverride: string };
export const defaultReceipt: ReceiptData = {
  brand: "The Roast & Bean.", tagline: "GOOD COFFEE. GOOD COMPANY.",
  startColor: "#bd1836", endColor: "#650d28", totalOverride: "",
  items: [{ id: 1, qty: 2, desc: "Iced Caramel Oat Macchiato", price: 6.5 }, { id: 2, qty: 1, desc: "Classic Butter Croissant", price: 4.5 }],
};
export function receiptTotal(data: ReceiptData) {
  return data.totalOverride !== "" ? Number(data.totalOverride) : data.items.reduce((sum, item) => sum + item.qty * item.price, 0);
}

export async function exportReceipt(data: ReceiptData) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: [80, 180 + Math.max(0, data.items.length - 2) * 12] });
  const canvas = document.createElement("canvas");
  canvas.width = 840; canvas.height = 440;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("PDF header could not be created.");
  const gradient = context.createLinearGradient(0, 0, 840, 440);
  gradient.addColorStop(0, data.startColor); gradient.addColorStop(1, data.endColor);
  context.fillStyle = gradient; context.fillRect(0, 0, 840, 440);
  doc.addImage(canvas.toDataURL("image/png"), "PNG", 5, 5, 70, 37);
  const ink = getComputedStyle(document.documentElement).getPropertyValue("--paper-ink");
  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = 1; colorCanvas.height = 1;
  const colorContext = colorCanvas.getContext("2d");
  const rgb = (token: string) => {
    if (!colorContext) return [40, 40, 40] as const;
    colorContext.fillStyle = token; colorContext.fillRect(0, 0, 1, 1);
    const pixel = colorContext.getImageData(0, 0, 1, 1).data;
    return [pixel[0] ?? 40, pixel[1] ?? 40, pixel[2] ?? 40] as const;
  };
  doc.setTextColor(...rgb(getComputedStyle(document.documentElement).getPropertyValue("--brand-ink")));
  doc.setFont("helvetica", "bold"); doc.setFontSize(20);
  const brandLines: string[] = doc.splitTextToSize(data.brand, 60);
  doc.setFontSize(Math.min(20, 28 / Math.max(1, brandLines.length)));
  doc.text(brandLines, 10, 19);
  doc.setFont("courier", "normal"); doc.setFontSize(5.5);
  doc.text(doc.splitTextToSize(data.tagline, 60), 10, 36);
  doc.setTextColor(...rgb(ink)); doc.setFontSize(6.5);
  let y = 50;
  doc.text("YOUR DAILY DOSE OF GOOD.", 40, y, { align: "center" }); y += 5;
  doc.text("ARTISAN COFFEE ROASTERS", 40, y, { align: "center" }); y += 7;
  const rule = () => { doc.setDrawColor(...rgb(ink)); doc.setLineWidth(.15); doc.setLineDashPattern([1, 1], 0); doc.line(8, y, 72, y); y += 7; };
  rule();
  for (const [label, value] of [["ORDER", "#CR-8429"], ["DATE", "Oct 08, 09:01 PM"], ["CASHIER", "Alex R."], ["STATUS", "PAID"]] as const) {
    doc.text(label, 8, y); doc.text(value, 72, y, { align: "right" }); y += 5;
  }
  rule(); doc.text("QTY / DESCRIPTION", 8, y); doc.text("AMT", 72, y, { align: "right" }); y += 7;
  for (const item of data.items) {
    const lines: string[] = doc.splitTextToSize(`${item.qty}x ${item.desc}`, 47);
    doc.text(lines, 8, y); doc.text(`$${(item.qty * item.price).toFixed(2)}`, 72, y, { align: "right" });
    y += Math.max(8, lines.length * 3 + 3);
  }
  rule(); doc.setFont("courier", "bold"); doc.setFontSize(9); doc.text("TOTAL", 8, y);
  doc.setFontSize(14); doc.text(`$${receiptTotal(data).toFixed(2)}`, 72, y, { align: "right" }); y += 12;
  doc.setFont("courier", "normal"); doc.setFontSize(7); doc.text("A little pick-me-up.", 40, y, { align: "center" }); y += 5;
  doc.text("Thanks for stopping by.", 40, y, { align: "center" });
  y += 7;
  doc.setFillColor(...rgb(ink));
  for (let i = 0; i < 40; i++) {
    doc.rect(19 + i * 1.05, y, i % 3 === 0 ? .65 : .3, 7, "F");
  }
  doc.setFontSize(5); doc.text("8 4 2 9 0 0 1 7 5 0", 40, y + 10, { align: "center" });
  doc.setProperties({ title: `${data.brand} — Receipt #CR-8429`, subject: "80 mm print-ready receipt", creator: "Receipt Studio" });
  doc.save("receipt-CR-8429.pdf");
}