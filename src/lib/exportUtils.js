import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { fmtDate, addDays, diffDays, getProd } from "./helpers";

// Shared PDF branding header
function pdfHeader(doc, title, subtitle) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(22, 27, 34);
  doc.rect(0, 0, W, 28, "F");
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 28, W, 2, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(230, 237, 243);
  doc.text("FREIGHTDESK", 14, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(110, 118, 129);
  doc.text("ZW / MZ Corridor · Beira–Bulawayo", 14, 20);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(230, 237, 243);
  doc.text(title, W - 14, 12, { align: "right" });
  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(110, 118, 129);
    doc.text(subtitle, W - 14, 20, { align: "right" });
  }
  return 38; // y cursor after header
}

// Footer with page numbers
function pdfFooter(doc) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(33, 38, 45);
    doc.line(14, H - 14, W - 14, H - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 118, 129);
    doc.text(`Generated ${new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })} · FreightDesk`, 14, H - 8);
    doc.text(`Page ${i} of ${pages}`, W - 14, H - 8, { align: "right" });
  }
}

// Small label+value block used in single-order PDF
function pdfField(doc, x, y, label, value, emptyColor) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(110, 118, 129);
  doc.text(label.toUpperCase(), x, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(value === "—" || value === "Pending" || value === "Not started" ? (emptyColor || 110) : 230);
  if (typeof emptyColor === "string") doc.setTextColor(emptyColor);
  doc.text(value, x, y + 5.5);
  return y + 14;
}

export async function exportOrderPDF(o) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const STATUS_LABELS = { payment:"Awaiting Payment", production:"In Production", loading:"Ready to Load", transit:"In Transit", delivered:"Delivered" };

  let y = pdfHeader(doc, o.id, `${o.supplier}`);

  // Status badge row
  doc.setFillColor(30, 37, 48);
  doc.roundedRect(14, y, W - 28, 14, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(96, 165, 250);
  doc.text("STATUS", 20, y + 5.5);
  doc.setTextColor(230, 237, 243);
  doc.text(STATUS_LABELS[o.status] || o.status, 45, y + 5.5);
  doc.setTextColor(110, 118, 129);
  doc.text("PRODUCT", 100, y + 5.5);
  doc.setTextColor(230, 237, 243);
  doc.text(o.product || "—", 120, y + 5.5);
  y += 20;

  // Section renderer
  const section = (title, yPos) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 118, 129);
    doc.text(title.toUpperCase(), 14, yPos);
    doc.setDrawColor(33, 38, 45);
    doc.line(14, yPos + 1.5, W - 14, yPos + 1.5);
    return yPos + 7;
  };

  // ── Payment & Verification ──
  y = section("Payment & Verification", y);
  const col1 = 14, col2 = W / 2 + 3;
  doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(110,118,129);
  doc.text("DEPOSIT PAID", col1, y);
  doc.text("SUPPLIER CONFIRMED", col2, y);
  doc.setFont("helvetica", "bold"); doc.setFontSize(9.5);
  doc.setTextColor(o.depositPaid ? 52 : 248, o.depositPaid ? 211 : 113, o.depositPaid ? 153 : 113);
  doc.text(o.depositPaid ? "✓ Confirmed" : "✗ Pending", col1, y + 5.5);
  doc.setTextColor(o.supplierConfirmed ? 52 : 248, o.supplierConfirmed ? 211 : 113, o.supplierConfirmed ? 153 : 113);
  doc.text(o.supplierConfirmed ? "✓ Confirmed" : "✗ Pending", col2, y + 5.5);
  y += 18;

  // ── Production Timeline ──
  y = section("Production Timeline", y);
  const prodEnd = o.prodStartDate ? fmtDate(addDays(o.prodStartDate, o.prodDays)) : "—";
  const { pct, daysLeft } = getProd(o);
  pdfField(doc, col1, y, "Production Start", o.prodStartDate ? fmtDate(o.prodStartDate) : "Not started");
  pdfField(doc, col2, y, `Expected End (${o.prodDays}d)`, o.prodStartDate ? prodEnd : "—");
  y += 14;
  if (o.prodStartDate) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(110,118,129);
    doc.text(`PROGRESS  ${pct}%  ·  ${daysLeft} DAYS REMAINING`, col1, y);
    y += 3.5;
    doc.setFillColor(33, 38, 45);
    doc.roundedRect(col1, y, W - 28, 4, 1, 1, "F");
    const barColor = daysLeft <= 14 ? [245,158,11] : pct >= 100 ? [52,211,153] : [167,139,250];
    doc.setFillColor(...barColor);
    doc.roundedRect(col1, y, Math.max(1, (W - 28) * pct / 100), 4, 1, 1, "F");
    y += 10;
  }

  // ── Loading Details ──
  y = section("Loading Details", y);
  pdfField(doc, col1, y, "Bill of Lading", o.bl || "—");
  pdfField(doc, col2, y, "Container Number", o.container || "—");
  y += 14;
  pdfField(doc, col1, y, "Weight", o.weight ? `${o.weight} tonnes` : "—");
  pdfField(doc, col2, y, "Volume", o.cbm ? `${o.cbm} CBM` : "—");
  y += 14;
  pdfField(doc, col1, y, "Expected Load Date", o.expLoadDate ? fmtDate(o.expLoadDate) : "—");
  pdfField(doc, col2, y, "Actual Load Date", o.actLoadDate ? fmtDate(o.actLoadDate) : "—");
  y += 14;
  if (o.expLoadDate && o.actLoadDate) {
    const v = diffDays(o.expLoadDate, o.actLoadDate);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(110,118,129);
    doc.text("LOAD VARIANCE", col1, y);
    doc.setFont("helvetica", "bold"); doc.setFontSize(9.5);
    doc.setTextColor(v === 0 ? 110 : v > 0 ? 248 : 52, v === 0 ? 118 : v > 0 ? 113 : 211, v === 0 ? 129 : v > 0 ? 113 : 153);
    doc.text(v === 0 ? "On time" : v > 0 ? `+${v}d late` : `${v}d early`, col1, y + 5.5);
    y += 14;
  }

  // ── Transit & ETA ──
  y = section("Transit & ETA", y);
  pdfField(doc, col1, y, "ETA Beira Port", o.eta_beira ? fmtDate(o.eta_beira) : "Pending");
  pdfField(doc, col2, y, "ETA Bulawayo", o.eta_bulawayo ? fmtDate(o.eta_bulawayo) : "Pending");
  y += 14;
  if (o.actLoadDate) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(110,118,129);
    doc.text(`SEA FREIGHT: ${o.seaDays} days  ·  INLAND HAULAGE: +7 days`, col1, y);
    y += 8;
  }

  // ── Notes ──
  if (o.notes) {
    y = section("Notes", y);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(139,148,158);
    const noteLines = doc.splitTextToSize(o.notes, W - 28);
    doc.text(noteLines, 14, y);
    y += noteLines.length * 5 + 6;
  }

  pdfFooter(doc);
  doc.save(`${o.id}_shipping_order.pdf`);
}

export async function exportBulkPDF(orders) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const STATUS_LABELS = { payment:"Awaiting Payment", production:"In Production", loading:"Ready to Load", transit:"In Transit", delivered:"Delivered" };

  let y = pdfHeader(doc, "Orders Report", `${orders.length} orders · ${new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}`);

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [["Order ID", "Supplier", "Product", "Status", "B/L Number", "ETA Beira", "ETA Bulawayo", "Variance"]],
    body: orders.map(o => {
      const v = o.expLoadDate && o.actLoadDate ? (diffDays(o.expLoadDate, o.actLoadDate) > 0 ? `+${diffDays(o.expLoadDate, o.actLoadDate)}d` : `${diffDays(o.expLoadDate, o.actLoadDate)}d`) : "—";
      return [o.id, o.supplier, o.product, STATUS_LABELS[o.status] || o.status, o.bl || "—", o.eta_beira ? fmtDate(o.eta_beira) : "Pending", o.eta_bulawayo ? fmtDate(o.eta_bulawayo) : "Pending", v];
    }),
    styles: { font: "helvetica", fontSize: 8, cellPadding: 3.5, textColor: [230, 237, 243], fillColor: [22, 27, 34], lineColor: [33, 38, 45], lineWidth: 0.3 },
    headStyles: { fillColor: [30, 37, 48], textColor: [110, 118, 129], fontStyle: "bold", fontSize: 7, halign: "left" },
    alternateRowStyles: { fillColor: [19, 23, 30] },
    columnStyles: {
      0: { textColor: [96, 165, 250], fontStyle: "bold" },
      3: { textColor: [167, 139, 250] },
      7: { textColor: [34, 211, 238] },
    },
  });

  pdfFooter(doc);
  doc.save(`freightdesk_orders_${new Date().toISOString().split("T")[0]}.pdf`);
}

export function exportCSV(orders) {
  const rows = [["Order ID","Supplier","Product","Status","B/L","Container","Weight(t)","CBM","ETA Beira","ETA Bulawayo","Load Variance"]];
  orders.forEach(o => {
    const v = o.expLoadDate && o.actLoadDate ? diffDays(o.expLoadDate, o.actLoadDate)+"d" : "—";
    rows.push([o.id,o.supplier,o.product,o.status,o.bl||"",o.container||"",o.weight||"",o.cbm||"",o.eta_beira||"",o.eta_bulawayo||"",v]);
  });
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(rows.map(r=>r.join(",")).join("\n"));
  a.download = "freight_orders.csv";
  a.click();
}
