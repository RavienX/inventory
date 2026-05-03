/**
 * ============================================================
 *  Volt Cycle — eBike Shop Inventory System
 *  Single-file React component | Static data (Firebase-ready)
 * ============================================================
 *
 *  HOW TO USE:
 *  1. Drop this file into your React project's src/ folder.
 *  2. Install dependency:  npm install lucide-react
 *  3. Import in App.jsx:   import EbikeInventory from './EbikeInventory';
 *  4. Render:              <EbikeInventory />
 *
 *  FIREBASE INTEGRATION (when ready):
 *  - Replace the STATIC_ITEMS array with Firestore queries.
 *  - Replace addItem / updateItem / deleteItem stubs with
 *    Firestore addDoc / updateDoc / deleteDoc calls.
 *  - All Firebase TODO comments are marked below.
 * ============================================================
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Menu, X, Plus, Search, Pencil, Trash2, Check, AlertCircle,
  CheckCircle, Info, Zap, Package, Bike, Battery, BatteryCharging,
  Wrench, ShoppingBag, BarChart2, Settings, ChevronDown,
} from "lucide-react";

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────
const CATEGORIES = ["eBike", "Battery", "Charger", "Accessory", "Parts"];

// ─────────────────────────────────────────────
//  STATIC DATA  ← replace with Firebase queries
// ─────────────────────────────────────────────
const STATIC_ITEMS = [
  { id: "1", sku: "EBK-001", name: "Volt Pro 500W City Bike", category: "eBike", brand: "Volt", price: 89990, qty: 5, low: 2, loc: "Floor A", desc: "Aluminum frame, 500W motor, 7-speed Shimano" },
  { id: "2", sku: "EBK-002", name: "Rad Runner 750W Fat Tire", category: "eBike", brand: "Rad Power", price: 124990, qty: 2, low: 2, loc: "Floor B", desc: "Fat tire commuter, hydraulic brakes" },
  { id: "3", sku: "EBK-003", name: "GoCycle G4 Folding", category: "eBike", brand: "GoCycle", price: 199990, qty: 1, low: 2, loc: "Floor C", desc: "Foldable urban eBike, 9Ah battery" },
  { id: "4", sku: "EBK-004", name: "Trek Allant+ 7 Stagger", category: "eBike", brand: "Trek", price: 159990, qty: 0, low: 2, loc: "Floor D", desc: "Bosch mid-drive, 625Wh Powertube" },
  { id: "5", sku: "BAT-001", name: "48V 14Ah Li-Ion Battery", category: "Battery", brand: "Volt", price: 12990, qty: 8, low: 3, loc: "Shelf A1", desc: "Compatible with Volt Pro series" },
  { id: "6", sku: "BAT-002", name: "52V 17.5Ah High-Cap Pack", category: "Battery", brand: "Rad Power", price: 19990, qty: 0, low: 3, loc: "Shelf A2", desc: "Long range battery pack" },
  { id: "7", sku: "CHG-001", name: "Fast Charger 5A 48V", category: "Charger", brand: "Volt", price: 2990, qty: 12, low: 4, loc: "Shelf B1", desc: "Universal eBike fast charger" },
  { id: "8", sku: "CHG-002", name: "Bosch Standard Charger 4A", category: "Charger", brand: "Bosch", price: 5490, qty: 3, low: 3, loc: "Shelf B2", desc: "For Bosch PowerPack & Powertube" },
  { id: "9", sku: "ACC-001", name: "Smart MIPS Bike Helmet", category: "Accessory", brand: "POC", price: 8500, qty: 3, low: 3, loc: "Shelf C1", desc: "Integrated turn signals, MIPS protection" },
  { id: "10", sku: "ACC-002", name: "Quad Lock Phone Mount", category: "Accessory", brand: "Quad Lock", price: 1890, qty: 15, low: 5, loc: "Shelf C2", desc: "Waterproof, wireless charging compatible" },
  { id: "11", sku: "ACC-003", name: "eBike Rear Pannier Rack", category: "Accessory", brand: "Topeak", price: 3200, qty: 7, low: 3, loc: "Shelf C3", desc: "Universal fit, 25kg load capacity" },
  { id: "12", sku: "PRT-001", name: "Shimano XT Rear Derailleur", category: "Parts", brand: "Shimano", price: 3200, qty: 2, low: 3, loc: "Parts Bin 1", desc: "11-speed, shadow plus clutch" },
  { id: "13", sku: "PRT-002", name: "Magura MT5 Disc Brake Set", category: "Parts", brand: "Magura", price: 5800, qty: 6, low: 2, loc: "Parts Bin 2", desc: "Front + rear hydraulic set" },
  { id: "14", sku: "PRT-003", name: "Bafang LCD Display 750C", category: "Parts", brand: "Bafang", price: 2400, qty: 4, low: 2, loc: "Parts Bin 3", desc: "Color display, USB-C charging port" },
];

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
const stockStatus = (item) => {
  if (item.qty === 0) return "out";
  if (item.qty <= item.low) return "low";
  return "in";
};

const STOCK_LABELS = { in: "In Stock", low: "Low Stock", out: "Out of Stock" };

const catIcon = (cat) => {
  const props = { size: 14, strokeWidth: 1.8 };
  const map = {
    eBike: <Bike {...props} />, Battery: <Battery {...props} />,
    Charger: <BatteryCharging {...props} />, Accessory: <ShoppingBag {...props} />,
    Parts: <Wrench {...props} />,
  };
  return map[cat] ?? <Package {...props} />;
};

const uid = () => Math.random().toString(36).slice(2, 10);

// ─────────────────────────────────────────────
//  STYLES  (injected once into <head>)
// ─────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --g:        #1D9E75; --g-dk: #0F6E56; --g-lt: #E1F5EE; --g-tx: #085041;
  --a:        #BA7517; --a-lt: #FAEEDA; --a-tx: #633806;
  --r:        #E24B4A; --r-dk: #A32D2D; --r-lt: #FCEBEB; --r-tx: #501313;
  --b:        #185FA5; --b-lt: #E6F1FB; --b-tx: #042C53;
  --bg:       #F4F3EF;
  --surf:     #FFFFFF;
  --surf2:    #EEEDE8;
  --surf3:    #E5E4DE;
  --bdr:      rgba(0,0,0,.08);
  --bdr2:     rgba(0,0,0,.14);
  --tx:       #181816;
  --tx2:      #5A5955;
  --tx3:      #8A8980;
  --rad:      10px;
  --rad-lg:   15px;
  --rad-xl:   20px;
  --sh:       0 1px 3px rgba(0,0,0,.07), 0 0 0 .5px rgba(0,0,0,.07);
  --sh-md:    0 4px 20px rgba(0,0,0,.10), 0 0 0 .5px rgba(0,0,0,.06);
  --sw:       228px;
  --top:      56px;
}

html { scroll-behavior: smooth; }
body {
  font-family: 'DM Sans', system-ui, sans-serif;
  background: var(--bg); color: var(--tx);
  min-height: 100vh; font-size: 14px; line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}
button, input, select, textarea { font-family: inherit; }

/* scrollbar */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-thumb { background: var(--bdr2); border-radius: 99px; }

/* ── shell ── */
.vc-shell { display: flex; min-height: 100vh; }

/* ── sidebar ── */
.vc-sidebar {
  width: var(--sw); background: var(--surf);
  border-right: .5px solid var(--bdr2);
  position: fixed; top: 0; left: 0; bottom: 0; z-index: 60;
  display: flex; flex-direction: column;
  transition: transform .24s cubic-bezier(.4,0,.2,1);
  overflow-y: auto; overflow-x: hidden;
}
.vc-sidebar-overlay {
  display: none; position: fixed; inset: 0;
  background: rgba(0,0,0,.35); z-index: 59;
  animation: vcFade .15s ease;
}
.vc-logo {
  display: flex; align-items: center; gap: 11px;
  padding: 18px 16px 16px;
  border-bottom: .5px solid var(--bdr);
  flex-shrink: 0;
}
.vc-logo-icon {
  width: 36px; height: 36px; border-radius: 9px;
  background: var(--g);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.vc-logo-brand  { font-size: 14px; font-weight: 600; line-height: 1.2; }
.vc-logo-sub    { font-size: 11px; color: var(--tx3); }

.vc-nav         { padding: 10px 8px; flex: 1; }
.vc-nav-section { margin-bottom: 16px; }
.vc-nav-label   { font-size: 10px; font-weight: 600; color: var(--tx3); text-transform: uppercase; letter-spacing: .07em; padding: 0 8px; margin-bottom: 3px; }
.vc-nav-btn {
  display: flex; align-items: center; gap: 9px;
  width: 100%; padding: 8px 10px; border-radius: 8px;
  border: none; background: none; font-size: 13px; font-weight: 500;
  color: var(--tx2); text-align: left; cursor: pointer;
  transition: all .12s; margin-bottom: 1px;
}
.vc-nav-btn:hover  { background: var(--surf2); color: var(--tx); }
.vc-nav-btn.active { background: var(--g-lt);  color: var(--g-tx); }
.vc-nav-badge {
  margin-left: auto; background: var(--r-lt); color: var(--r-tx);
  font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 20px;
}
.vc-sidebar-foot { padding: 12px 16px; font-size: 11px; color: var(--tx3); border-top: .5px solid var(--bdr); }

/* ── main ── */
.vc-main { margin-left: var(--sw); display: flex; flex-direction: column; min-height: 100vh; transition: margin .24s cubic-bezier(.4,0,.2,1); }

/* ── topbar ── */
.vc-topbar {
  position: sticky; top: 0; z-index: 50;
  height: var(--top); padding: 0 20px;
  background: rgba(244,243,239,.88); backdrop-filter: blur(12px);
  border-bottom: .5px solid var(--bdr2);
  display: flex; align-items: center; gap: 12px;
}
.vc-topbar-title { font-size: 16px; font-weight: 600; flex: 1; color: var(--tx); }
.vc-hamburger {
  display: none; background: none; border: none;
  padding: 6px; border-radius: 7px; color: var(--tx); cursor: pointer;
}
.vc-hamburger:hover { background: var(--surf2); }

/* ── content ── */
.vc-content { padding: 22px 20px; flex: 1; }

/* ── stats ── */
.vc-stats { display: grid; grid-template-columns: repeat(5,1fr); gap: 10px; margin-bottom: 20px; }
.vc-stat {
  background: var(--surf); border-radius: var(--rad); border: .5px solid var(--bdr);
  box-shadow: var(--sh); padding: 14px 16px;
}
.vc-stat-label { font-size: 11px; color: var(--tx3); font-weight: 500; margin-bottom: 5px; }
.vc-stat-val   { font-size: 26px; font-weight: 700; line-height: 1; }
.vc-stat-val.g { color: var(--g); }
.vc-stat-val.a { color: var(--a); }
.vc-stat-val.r { color: var(--r); }
.vc-stat-val.b { color: var(--b); }
.vc-stat-sub   { font-size: 11px; color: var(--tx3); margin-top: 4px; }

/* ── toolbar ── */
.vc-toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.vc-search-wrap { position: relative; flex: 1; min-width: 180px; }
.vc-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--tx3); display: flex; pointer-events: none; }
.vc-search {
  width: 100%; padding: 9px 10px 9px 34px;
  border: .5px solid var(--bdr2); border-radius: var(--rad);
  background: var(--surf); color: var(--tx); font-size: 13px; outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.vc-search:focus { border-color: var(--g); box-shadow: 0 0 0 3px rgba(29,158,117,.12); }
.vc-search::placeholder { color: var(--tx3); }
.vc-select {
  padding: 9px 30px 9px 10px; border: .5px solid var(--bdr2); border-radius: var(--rad);
  background: var(--surf); color: var(--tx); font-size: 13px; outline: none; cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%238A8980' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 9px center;
  transition: border-color .15s;
}
.vc-select:focus { border-color: var(--g); }

/* ── buttons ── */
.vc-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 14px; border-radius: var(--rad);
  font-size: 13px; font-weight: 500; white-space: nowrap; cursor: pointer;
  border: .5px solid var(--bdr2); background: var(--surf); color: var(--tx);
  transition: all .12s;
}
.vc-btn:hover  { background: var(--surf2); }
.vc-btn:active { transform: scale(.98); }
.vc-btn.primary { background: var(--g);    color: #fff; border-color: var(--g);    }
.vc-btn.primary:hover { background: var(--g-dk); }
.vc-btn.danger  { background: var(--r);    color: #fff; border-color: var(--r);    }
.vc-btn.danger:hover  { background: var(--r-dk); }
.vc-btn.ghost   { background: transparent; border-color: transparent; }
.vc-btn.ghost:hover   { background: var(--surf2); }
.vc-btn.sm   { padding: 5px 9px; font-size: 12px; }
.vc-btn.icon { padding: 6px; }

/* ── table ── */
.vc-table-card { background: var(--surf); border-radius: var(--rad-lg); border: .5px solid var(--bdr); box-shadow: var(--sh); overflow: hidden; }
.vc-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
table.vc-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 680px; }
table.vc-table thead th {
  background: var(--surf2); padding: 10px 14px;
  text-align: left; font-size: 10px; font-weight: 700;
  color: var(--tx3); text-transform: uppercase; letter-spacing: .06em;
  border-bottom: .5px solid var(--bdr); white-space: nowrap; user-select: none;
}
table.vc-table tbody td { padding: 11px 14px; border-bottom: .5px solid var(--bdr); vertical-align: middle; }
table.vc-table tbody tr:last-child td { border-bottom: none; }
table.vc-table tbody tr { transition: background .1s; }
table.vc-table tbody tr:hover td { background: #FAFAF8; }

.vc-sku   { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--tx3); }
.vc-pname { font-weight: 500; font-size: 13px; color: var(--tx); }
.vc-pdesc { font-size: 11px; color: var(--tx3); margin-top: 2px; }
.vc-cat   { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border-radius: 20px; font-size: 11px; font-weight: 500; background: var(--surf2); color: var(--tx2); }
.vc-badge { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.vc-badge.in  { background: var(--g-lt); color: var(--g-tx); }
.vc-badge.low { background: var(--a-lt); color: var(--a-tx); }
.vc-badge.out { background: var(--r-lt); color: var(--r-tx); }
.vc-qty.in  { font-weight: 700; color: var(--tx);  }
.vc-qty.low { font-weight: 700; color: var(--a);   }
.vc-qty.out { font-weight: 700; color: var(--r);   }
.vc-loc { font-size: 12px; color: var(--tx3); }
.vc-row-actions { display: flex; gap: 4px; }

.vc-table-foot {
  padding: 10px 16px; border-top: .5px solid var(--bdr);
  display: flex; justify-content: space-between; align-items: center;
  font-size: 12px; color: var(--tx3);
}
.vc-empty { padding: 56px 20px; text-align: center; }
.vc-empty-ico  { font-size: 42px; margin-bottom: 10px; }
.vc-empty-text { font-size: 14px; color: var(--tx3); }

/* ── modal ── */
.vc-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.38);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: 16px;
  animation: vcFade .15s ease;
}
.vc-modal {
  background: var(--surf); border-radius: var(--rad-lg); box-shadow: var(--sh-md);
  width: 100%; max-width: 460px; max-height: 90dvh; overflow-y: auto;
  animation: vcUp .18s ease;
}
.vc-modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: .5px solid var(--bdr);
  position: sticky; top: 0; background: var(--surf); z-index: 1;
}
.vc-modal-head h3 { font-size: 15px; font-weight: 600; }
.vc-modal-body   { padding: 20px; }
.vc-modal-foot   {
  padding: 14px 20px; border-top: .5px solid var(--bdr);
  display: flex; justify-content: flex-end; gap: 8px;
  position: sticky; bottom: 0; background: var(--surf);
}

/* ── form ── */
.vc-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.vc-fg       { margin-bottom: 14px; }
.vc-fg:last-child { margin-bottom: 0; }
.vc-label { display: block; font-size: 12px; font-weight: 500; color: var(--tx2); margin-bottom: 5px; }
.vc-input, .vc-fselect, .vc-textarea {
  width: 100%; padding: 9px 11px;
  border: .5px solid var(--bdr2); border-radius: var(--rad);
  background: var(--surf); color: var(--tx); font-size: 13px; outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.vc-input:focus, .vc-fselect:focus, .vc-textarea:focus {
  border-color: var(--g); box-shadow: 0 0 0 3px rgba(29,158,117,.12);
}
.vc-input.err, .vc-fselect.err { border-color: var(--r) !important; }
.vc-fselect {
  appearance: none; cursor: pointer; padding-right: 28px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%238A8980' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 9px center;
}
.vc-textarea { resize: vertical; min-height: 66px; line-height: 1.5; }
.vc-ferr  { font-size: 11px; color: var(--r); margin-top: 3px; }
.vc-fhint { font-size: 11px; color: var(--tx3); margin-top: 3px; }

/* ── confirm ── */
.vc-confirm { padding: 30px 24px; text-align: center; }
.vc-confirm-icon { width: 52px; height: 52px; border-radius: 50%; background: var(--r-lt); color: var(--r); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
.vc-confirm-title { font-size: 16px; font-weight: 600; margin-bottom: 6px; }
.vc-confirm-msg   { font-size: 13px; color: var(--tx2); line-height: 1.5; margin-bottom: 22px; }
.vc-confirm-actions { display: flex; gap: 10px; justify-content: center; }

/* ── toasts ── */
.vc-toasts { position: fixed; bottom: 20px; right: 20px; z-index: 400; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
.vc-toast {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px; border-radius: var(--rad); font-size: 13px; font-weight: 500; color: #fff;
  box-shadow: var(--sh-md); animation: vcUp .2s ease;
  max-width: 300px; pointer-events: auto;
}
.vc-toast.success { background: var(--g-dk); }
.vc-toast.error   { background: var(--r-dk); }
.vc-toast.info    { background: #1A1A18;     }

/* ── animations ── */
@keyframes vcFade { from { opacity: 0 } to { opacity: 1 } }
@keyframes vcUp   { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }

/* ── responsive ── */
@media (max-width: 1100px) { .vc-stats { grid-template-columns: repeat(3,1fr); } }

@media (max-width: 768px) {
  .vc-main        { margin-left: 0 !important; }
  .vc-sidebar     { transform: translateX(-100%); }
  .vc-sidebar.open { transform: none; }
  .vc-sidebar-overlay { display: block; }
  .vc-hamburger   { display: flex; }
  .vc-stats       { grid-template-columns: repeat(2,1fr); }
  .vc-toolbar     { flex-direction: column; align-items: stretch; }
  .vc-toolbar .vc-btn.primary { justify-content: center; }
  .vc-content     { padding: 14px; }
  .vc-topbar      { padding: 0 14px; }
}

@media (max-width: 480px) {
  .vc-form-row { grid-template-columns: 1fr; }
  .vc-stats    { grid-template-columns: 1fr 1fr; }
  .vc-stat-val { font-size: 22px; }
  .vc-overlay  { align-items: flex-end; padding: 0; }
  .vc-modal    { border-radius: var(--rad-lg) var(--rad-lg) 0 0; max-width: 100%; }
  .vc-confirm-actions { flex-direction: column; }
  .vc-confirm-actions .vc-btn { justify-content: center; }
  .vc-toasts   { left: 12px; right: 12px; bottom: 12px; }
  .vc-toast    { max-width: 100%; }
}
`;

// ─────────────────────────────────────────────
//  STYLE INJECTOR
// ─────────────────────────────────────────────
function useStyles() {
  useEffect(() => {
    const id = "vc-styles";
    if (!document.getElementById(id)) {
      const tag = document.createElement("style");
      tag.id = id;
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }
    return () => {
      // Keep styles on unmount (avoids flicker if remounted)
    };
  }, []);
}

// ─────────────────────────────────────────────
//  TOAST HOOK
// ─────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = "success") => {
    const id = uid();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return { toasts, toast };
}

// ─────────────────────────────────────────────
//  INVENTORY HOOK  (wire Firebase here)
// ─────────────────────────────────────────────
function useInventory() {
  // ── TODO: replace useState with Firestore onSnapshot listener ──
  const [items, setItems] = useState(STATIC_ITEMS);

  const addItem = useCallback((form) => {
    // TODO: await addDoc(collection(db, "inventory"), form);
    setItems((prev) => [...prev, { ...form, id: uid() }]);
  }, []);

  const updateItem = useCallback((form) => {
    // TODO: await updateDoc(doc(db, "inventory", form.id), form);
    setItems((prev) => prev.map((i) => (i.id === form.id ? form : i)));
  }, []);

  const deleteItem = useCallback((id) => {
    // TODO: await deleteDoc(doc(db, "inventory", id));
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return { items, addItem, updateItem, deleteItem };
}

// ─────────────────────────────────────────────
//  SIDEBAR
// ─────────────────────────────────────────────
const NAV = [
  { id: "inventory", label: "Inventory", Icon: Package },
  { id: "bikes", label: "eBikes", Icon: Bike },
  { id: "batteries", label: "Batteries", Icon: Battery },
  { id: "analytics", label: "Analytics", Icon: BarChart2 },
  { id: "settings", label: "Settings", Icon: Settings },
];

function Sidebar({ open, onClose, active, onNav, alertCount }) {
  return (
    <>
      {open && <div className="vc-sidebar-overlay" onClick={onClose} />}
      <aside className={`vc-sidebar${open ? " open" : ""}`}>
        <div className="vc-logo">
          <div className="vc-logo-icon">
            <Zap size={18} color="#fff" strokeWidth={2.2} />
          </div>
          <div>
            <div className="vc-logo-brand">Volt Cycle</div>
            <div className="vc-logo-sub">Inventory System</div>
          </div>
        </div>

        <nav className="vc-nav">
          <div className="vc-nav-section">
            <div className="vc-nav-label">Management</div>
            {NAV.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={`vc-nav-btn${active === id ? " active" : ""}`}
                onClick={() => { onNav(id); onClose(); }}
              >
                <Icon size={15} strokeWidth={1.8} />
                {label}
                {id === "inventory" && alertCount > 0 && (
                  <span className="vc-nav-badge">{alertCount}</span>
                )}
              </button>
            ))}
          </div>
        </nav>

        <div className="vc-sidebar-foot">v1.0.0 · Volt Cycle PH</div>
      </aside>
    </>
  );
}

// ─────────────────────────────────────────────
//  STAT CARD
// ─────────────────────────────────────────────
function StatCard({ label, value, color, sub }) {
  return (
    <div className="vc-stat">
      <div className="vc-stat-label">{label}</div>
      <div className={`vc-stat-val${color ? ` ${color}` : ""}`}>{value}</div>
      {sub && <div className="vc-stat-sub">{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
//  INVENTORY TABLE
// ─────────────────────────────────────────────
function InventoryTable({ items, onEdit, onDelete }) {
  if (items.length === 0) {
    return (
      <div className="vc-table-card">
        <div className="vc-empty">
          <div className="vc-empty-ico">📦</div>
          <div className="vc-empty-text">No products found. Try adjusting your filters.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="vc-table-card">
      <div className="vc-table-scroll">
        <table className="vc-table">
          <thead>
            <tr>
              <th style={{ width: "10%" }}>SKU</th>
              <th style={{ width: "24%" }}>Product</th>
              <th style={{ width: "11%" }}>Category</th>
              <th style={{ width: "10%" }}>Brand</th>
              <th style={{ width: "10%" }}>Price</th>
              <th style={{ width: "7%" }}>Qty</th>
              <th style={{ width: "11%" }}>Status</th>
              <th style={{ width: "10%" }}>Location</th>
              <th style={{ width: "7%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const s = stockStatus(item);
              return (
                <tr key={item.id}>
                  <td><span className="vc-sku">{item.sku}</span></td>
                  <td>
                    <div className="vc-pname">{item.name}</div>
                    {item.desc && <div className="vc-pdesc">{item.desc}</div>}
                  </td>
                  <td>
                    <span className="vc-cat">
                      {catIcon(item.category)}
                      {item.category}
                    </span>
                  </td>
                  <td style={{ color: "var(--tx2)", fontSize: 13 }}>{item.brand || "—"}</td>
                  <td style={{ fontWeight: 600 }}>₱{item.price.toLocaleString()}</td>
                  <td><span className={`vc-qty ${s}`}>{item.qty}</span></td>
                  <td><span className={`vc-badge ${s}`}>{STOCK_LABELS[s]}</span></td>
                  <td><span className="vc-loc">{item.loc || "—"}</span></td>
                  <td>
                    <div className="vc-row-actions">
                      <button
                        className="vc-btn ghost sm icon"
                        title="Edit"
                        onClick={() => onEdit(item)}
                      >
                        <Pencil size={13} strokeWidth={1.8} />
                      </button>
                      <button
                        className="vc-btn ghost sm icon"
                        title="Delete"
                        style={{ color: "var(--r)" }}
                        onClick={() => onDelete(item)}
                      >
                        <Trash2 size={13} strokeWidth={1.8} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="vc-table-foot">
        <span>{items.length} product{items.length !== 1 ? "s" : ""}</span>
        <span>Total qty: {items.reduce((s, i) => s + i.qty, 0).toLocaleString()} units</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  ITEM MODAL  (Add / Edit)
// ─────────────────────────────────────────────
const EMPTY_FORM = { sku: "", name: "", category: "eBike", brand: "", price: "", qty: "", low: "3", loc: "", desc: "" };

function ItemModal({ item, onSave, onClose, existingSKUs }) {
  const isEdit = !!item?.id;
  const [form, setForm] = useState(
    item
      ? { ...item, price: String(item.price), qty: String(item.qty), low: String(item.low) }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState({});
  const firstRef = useRef(null);

  useEffect(() => { firstRef.current?.focus(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.sku.trim())
      e.sku = "SKU is required";
    else if (!isEdit && existingSKUs.includes(form.sku.trim().toUpperCase()))
      e.sku = "SKU already exists";
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.price || isNaN(+form.price) || +form.price < 0) e.price = "Enter a valid price";
    if (form.qty === "" || isNaN(+form.qty) || +form.qty < 0) e.qty = "Enter a valid quantity";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      ...form,
      id: item?.id,
      sku: form.sku.trim().toUpperCase(),
      name: form.name.trim(),
      brand: form.brand.trim(),
      price: Math.round(+form.price),
      qty: Math.max(0, Math.round(+form.qty)),
      low: Math.max(1, Math.round(+form.low) || 3),
      loc: form.loc.trim(),
      desc: form.desc.trim(),
    });
  };

  const handleKey = (e) => { if (e.key === "Escape") onClose(); };

  return (
    <div className="vc-overlay" onKeyDown={handleKey} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="vc-modal" role="dialog" aria-modal="true" aria-label={isEdit ? "Edit product" : "Add product"}>
        <div className="vc-modal-head">
          <h3>{isEdit ? "Edit Product" : "Add New Product"}</h3>
          <button className="vc-btn ghost icon" onClick={onClose} aria-label="Close">
            <X size={17} strokeWidth={1.8} />
          </button>
        </div>

        <div className="vc-modal-body">
          {/* Row 1 */}
          <div className="vc-form-row">
            <div className="vc-fg">
              <label className="vc-label">SKU *</label>
              <input
                ref={firstRef}
                className={`vc-input${errors.sku ? " err" : ""}`}
                value={form.sku}
                placeholder="e.g. EBK-005"
                onChange={(e) => set("sku", e.target.value)}
              />
              {errors.sku && <div className="vc-ferr">{errors.sku}</div>}
            </div>
            <div className="vc-fg">
              <label className="vc-label">Category *</label>
              <select className="vc-fselect" value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Product name */}
          <div className="vc-fg">
            <label className="vc-label">Product Name *</label>
            <input
              className={`vc-input${errors.name ? " err" : ""}`}
              value={form.name}
              placeholder="e.g. Volt Pro 500W City Bike"
              onChange={(e) => set("name", e.target.value)}
            />
            {errors.name && <div className="vc-ferr">{errors.name}</div>}
          </div>

          {/* Brand */}
          <div className="vc-fg">
            <label className="vc-label">Brand</label>
            <input className="vc-input" value={form.brand} placeholder="e.g. Volt, Trek, Bosch" onChange={(e) => set("brand", e.target.value)} />
          </div>

          {/* Price + Qty */}
          <div className="vc-form-row">
            <div className="vc-fg">
              <label className="vc-label">Price (₱) *</label>
              <input
                className={`vc-input${errors.price ? " err" : ""}`}
                type="number" min="0"
                value={form.price}
                placeholder="0"
                onChange={(e) => set("price", e.target.value)}
              />
              {errors.price && <div className="vc-ferr">{errors.price}</div>}
            </div>
            <div className="vc-fg">
              <label className="vc-label">Stock Quantity *</label>
              <input
                className={`vc-input${errors.qty ? " err" : ""}`}
                type="number" min="0"
                value={form.qty}
                placeholder="0"
                onChange={(e) => set("qty", e.target.value)}
              />
              {errors.qty && <div className="vc-ferr">{errors.qty}</div>}
            </div>
          </div>

          {/* Low stock alert + Location */}
          <div className="vc-form-row">
            <div className="vc-fg">
              <label className="vc-label">Low Stock Alert</label>
              <input className="vc-input" type="number" min="1" value={form.low} placeholder="3" onChange={(e) => set("low", e.target.value)} />
              <div className="vc-fhint">Alert when qty ≤ this value</div>
            </div>
            <div className="vc-fg">
              <label className="vc-label">Storage Location</label>
              <input className="vc-input" value={form.loc} placeholder="e.g. Shelf A2, Floor B" onChange={(e) => set("loc", e.target.value)} />
            </div>
          </div>

          {/* Description */}
          <div className="vc-fg">
            <label className="vc-label">Description / Notes</label>
            <textarea className="vc-textarea" value={form.desc} placeholder="Optional product specs or notes…" onChange={(e) => set("desc", e.target.value)} />
          </div>
        </div>

        <div className="vc-modal-foot">
          <button className="vc-btn" onClick={onClose}>Cancel</button>
          <button className="vc-btn primary" onClick={handleSave}>
            <Check size={14} strokeWidth={2.2} />
            {isEdit ? "Update Product" : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  DELETE CONFIRM MODAL
// ─────────────────────────────────────────────
function DeleteModal({ item, onConfirm, onClose }) {
  return (
    <div className="vc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="vc-modal" style={{ maxWidth: 360 }}>
        <div className="vc-confirm">
          <div className="vc-confirm-icon"><Trash2 size={22} strokeWidth={1.8} /></div>
          <div className="vc-confirm-title">Delete Product?</div>
          <div className="vc-confirm-msg">
            <strong>{item.name}</strong><br />
            This action cannot be undone.
          </div>
          <div className="vc-confirm-actions">
            <button className="vc-btn" onClick={onClose}>Cancel</button>
            <button className="vc-btn danger" onClick={onConfirm}>
              <Trash2 size={14} strokeWidth={1.8} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  TOAST STACK
// ─────────────────────────────────────────────
function ToastStack({ toasts }) {
  if (!toasts.length) return null;
  const icons = {
    success: <CheckCircle size={15} strokeWidth={2} />,
    error: <AlertCircle size={15} strokeWidth={2} />,
    info: <Info size={15} strokeWidth={2} />,
  };
  return (
    <div className="vc-toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`vc-toast ${t.type}`}>
          {icons[t.type]}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  ROOT COMPONENT
// ─────────────────────────────────────────────
export default function EbikeInventory() {
  useStyles();

  const { items, addItem, updateItem, deleteItem } = useInventory();
  const { toasts, toast } = useToast();

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("inventory");
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Stats ──
  const stats = useMemo(() => ({
    total: items.length,
    in: items.filter((i) => stockStatus(i) === "in").length,
    low: items.filter((i) => stockStatus(i) === "low").length,
    out: items.filter((i) => stockStatus(i) === "out").length,
    value: items.reduce((s, i) => s + i.price * i.qty, 0),
    units: items.reduce((s, i) => s + i.qty, 0),
  }), [items]);

  // ── Filtered rows ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((item) => {
      const matchQ = !q || [item.name, item.sku, item.brand, item.desc].some((v) => v?.toLowerCase().includes(q));
      const matchC = !catFilter || item.category === catFilter;
      const matchS = !stockFilter || stockStatus(item) === stockFilter;
      return matchQ && matchC && matchS;
    });
  }, [items, search, catFilter, stockFilter]);

  // ── Existing SKUs (for duplicate check) ──
  const existingSKUs = useMemo(
    () => items.filter((i) => i.id !== editItem?.id).map((i) => i.sku),
    [items, editItem]
  );

  // ── Handlers ──
  const handleAdd = (form) => {
    addItem(form);
    setAddOpen(false);
    toast("Product added successfully!", "success");
  };

  const handleUpdate = (form) => {
    updateItem(form);
    setEditItem(null);
    toast("Product updated!", "success");
  };

  const handleDelete = () => {
    deleteItem(deleteTarget.id);
    toast(`"${deleteTarget.name}" deleted.`, "error");
    setDeleteTarget(null);
  };

  return (
    <div className="vc-shell">
      {/* ── Sidebar ── */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active={activeNav}
        onNav={setActiveNav}
        alertCount={stats.low + stats.out}
      />

      {/* ── Main Area ── */}
      <div className="vc-main">
        {/* Topbar */}
        <header className="vc-topbar">
          <button className="vc-hamburger" aria-label="Toggle menu" onClick={() => setSidebarOpen((o) => !o)}>
            <Menu size={20} strokeWidth={1.8} />
          </button>
          <span className="vc-topbar-title">Inventory</span>
          <button className="vc-btn primary" onClick={() => setAddOpen(true)}>
            <Plus size={14} strokeWidth={2.2} />
            Add Product
          </button>
        </header>

        {/* Page */}
        <main className="vc-content">
          {/* Stats */}
          <div className="vc-stats">
            <StatCard label="Total Products" value={stats.total} />
            <StatCard label="In Stock" value={stats.in} color="g" />
            <StatCard label="Low Stock" value={stats.low} color="a" />
            <StatCard label="Out of Stock" value={stats.out} color="r" />
            <StatCard
              label="Inventory Value"
              value={`₱${stats.value.toLocaleString()}`}
              color="b"
              sub={`${stats.units.toLocaleString()} total units`}
            />
          </div>

          {/* Toolbar */}
          <div className="vc-toolbar">
            <div className="vc-search-wrap">
              <span className="vc-search-icon">
                <Search size={15} strokeWidth={1.8} />
              </span>
              <input
                className="vc-search"
                placeholder="Search by name, SKU, brand, description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select className="vc-select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>

            <select className="vc-select" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
              <option value="">All Stock Levels</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>

          {/* Table */}
          <InventoryTable
            items={filtered}
            onEdit={(item) => setEditItem(item)}
            onDelete={(item) => setDeleteTarget(item)}
          />
        </main>
      </div>

      {/* ── Modals ── */}
      {addOpen && (
        <ItemModal
          item={null}
          onSave={handleAdd}
          onClose={() => setAddOpen(false)}
          existingSKUs={existingSKUs}
        />
      )}
      {editItem && (
        <ItemModal
          item={editItem}
          onSave={handleUpdate}
          onClose={() => setEditItem(null)}
          existingSKUs={existingSKUs}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          item={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Toasts ── */}
      <ToastStack toasts={toasts} />
    </div>
  );
}