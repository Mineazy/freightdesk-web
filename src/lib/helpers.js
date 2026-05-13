export const TODAY = new Date("2025-01-23");

export function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function diffDays(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

export function toISO(d) {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
}

export const STATUS_CFG = {
  payment:   { label: "Awaiting Payment",  statusClass: "status-payment" },
  production:{ label: "In Production",     statusClass: "status-production" },
  loading:   { label: "Ready to Load",     statusClass: "status-loading" },
  transit:   { label: "In Transit",        statusClass: "status-transit" },
  delivered: { label: "Delivered",         statusClass: "status-delivered" },
};

export function getProd(o) {
  if (!o.prodStartDate) return { pct: 0, daysLeft: o.prodDays, done: false };
  const elapsed = diffDays(o.prodStartDate, TODAY);
  const pct = Math.min(100, Math.round((elapsed / o.prodDays) * 100));
  const daysLeft = Math.max(0, o.prodDays - elapsed);
  return { pct, daysLeft, done: elapsed >= o.prodDays };
}

export function dbToOrder(r) {
  return { id:r.id, supplier:r.supplier, product:r.product, status:r.status,
    depositPaid:r.deposit_paid, supplierConfirmed:r.supplier_confirmed,
    prodStartDate:r.prod_start_date, prodDays:r.prod_days,
    expLoadDate:r.exp_load_date, actLoadDate:r.act_load_date,
    bl:r.bl, container:r.container, weight:r.weight, cbm:r.cbm,
    seaDays:r.sea_days, eta_beira:r.eta_beira, eta_bulawayo:r.eta_bulawayo, notes:r.notes||"" };
}

export function orderToDB(o) {
  return { id:o.id, supplier:o.supplier, product:o.product, status:o.status,
    deposit_paid:o.depositPaid, supplier_confirmed:o.supplierConfirmed,
    prod_start_date:o.prodStartDate||null, prod_days:o.prodDays,
    exp_load_date:o.expLoadDate||null, act_load_date:o.actLoadDate||null,
    bl:o.bl||null, container:o.container||null, weight:o.weight||null, cbm:o.cbm||null,
    sea_days:o.seaDays, eta_beira:o.eta_beira||null, eta_bulawayo:o.eta_bulawayo||null, notes:o.notes||"" };
}

export function dbToSupplier(r) {
  return { id:r.id, name:r.name, contact:r.contact, phone:r.phone,
    email:r.email, country:r.country, productLine:r.product_line||"" };
}

export function supplierToDB(s) {
  return { id:s.id, name:s.name, contact:s.contact, phone:s.phone,
    email:s.email, country:s.country, product_line:s.productLine||"" };
}
