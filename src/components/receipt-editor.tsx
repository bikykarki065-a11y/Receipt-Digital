import { useEffect, useState } from "react";
import { Plus, Redo2, RotateCcw, Save, Trash2, Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultReceipt, receiptTotal, type ReceiptData } from "@/lib/receipt";

type Preset = { name: string; data: ReceiptData };
const PRESETS_KEY = "receipt-studio-presets";

type Props = { data: ReceiptData; onChange: (data: ReceiptData) => void; onClose: () => void; onUndo: () => void; onRedo: () => void; canUndo: boolean; canRedo: boolean };

export function ReceiptEditor({ data, onChange, onClose, onUndo, onRedo, canUndo, canRedo }: Props) {
  const update = (patch: Partial<ReceiptData>) => onChange({ ...data, ...patch });
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState("");
  const [selected, setSelected] = useState("");
  const [presetStatus, setPresetStatus] = useState("");

  useEffect(() => {
    try { setPresets(JSON.parse(localStorage.getItem(PRESETS_KEY) ?? "[]") as Preset[]); } catch { setPresets([]); }
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z" && event.key.toLowerCase() !== "y") return;
      event.preventDefault();
      if (event.key.toLowerCase() === "y" || event.shiftKey) onRedo(); else onUndo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onUndo, onRedo]);

  function store(next: Preset[]) {
    setPresets(next);
    try { localStorage.setItem(PRESETS_KEY, JSON.stringify(next)); } catch { setPresetStatus("Could not save in this browser."); }
  }

  function savePreset() {
    const name = presetName.trim();
    if (!name) return;
    const exists = presets.some((preset) => preset.name === name);
    store([...presets.filter((preset) => preset.name !== name), { name, data: structuredClone(data) }]);
    setSelected(name); setPresetName("");
    setPresetStatus(exists ? `Updated “${name}”` : `Saved “${name}”`);
  }

  function loadPreset() {
    const preset = presets.find((entry) => entry.name === selected);
    if (!preset) return;
    onChange(structuredClone(preset.data)); setPresetStatus(`Loaded “${preset.name}”`);
  }

  function deletePreset() {
    store(presets.filter((entry) => entry.name !== selected));
    setPresetStatus(`Deleted “${selected}”`); setSelected("");
  }

  return <aside className="receipt-editor" aria-label="Receipt editor">
    <div className="editor-heading"><div><span className="eyebrow">MAKE IT YOURS</span><h2>Edit receipt</h2></div><div className="editor-history"><Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} aria-label="Undo" title="Undo (Ctrl/⌘ Z)"><Undo2 /></Button><Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} aria-label="Redo" title="Redo (Ctrl/⌘ Shift Z)"><Redo2 /></Button><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close editor" title="Close editor"><X /></Button></div></div>
    <section className="editor-presets" aria-label="Receipt presets">
      <h3>Presets</h3>
      <div className="preset-row"><input aria-label="Preset name" placeholder="Name this receipt" maxLength={40} value={presetName} onChange={(e) => setPresetName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") savePreset(); }} /><Button variant="outline" size="icon" aria-label="Save preset" title="Save preset" disabled={!presetName.trim()} onClick={savePreset}><Save /></Button></div>
      <div className="preset-row"><select aria-label="Saved presets" value={selected} onChange={(e) => setSelected(e.target.value)}><option value="">{presets.length ? "Choose a preset" : "No saved presets yet"}</option>{presets.map((preset) => <option key={preset.name} value={preset.name}>{preset.name}</option>)}</select><Button variant="outline" disabled={!selected} onClick={loadPreset}>Load</Button><Button variant="ghost" size="icon" aria-label="Delete preset" title="Delete preset" disabled={!selected} onClick={deletePreset}><Trash2 /></Button></div>
      {presetStatus && <p className="preset-status" role="status">{presetStatus}</p>}
    </section>
    <label className="editor-field">Brand name<input maxLength={45} value={data.brand} onChange={(e) => update({ brand: e.target.value })} /></label>
    <label className="editor-field">Tagline<input maxLength={60} value={data.tagline} onChange={(e) => update({ tagline: e.target.value })} /></label>
    <div className="editor-colors"><label className="editor-field">Crimson<input type="color" aria-label="Header crimson color" value={data.startColor} onChange={(e) => update({ startColor: e.target.value })} /></label><label className="editor-field">Burgundy<input type="color" aria-label="Header burgundy color" value={data.endColor} onChange={(e) => update({ endColor: e.target.value })} /></label></div>
    <div className="editor-section-title"><h3>Line items</h3><Button variant="ghost" size="icon" aria-label="Add line item" title="Add line item" disabled={data.items.length >= 12} onClick={() => update({ items: [...data.items, { id: Date.now(), qty: 1, desc: "New item", price: 0 }] })}><Plus /></Button></div>
    <div className="editor-items">{data.items.map((item, index) => {
      const changeItem = (patch: Partial<typeof item>) => update({ items: data.items.map((entry) => entry.id === item.id ? { ...entry, ...patch } : entry) });
      return <div className="editor-item" key={item.id}>
        <label className="editor-field">Description<input aria-label={`Item ${index + 1} description`} maxLength={80} value={item.desc} onChange={(e) => changeItem({ desc: e.target.value })} /></label>
        <div className="editor-item-numbers"><label className="editor-field">Qty<input aria-label={`Item ${index + 1} quantity`} type="number" min="1" max="99" step="1" value={item.qty} onChange={(e) => changeItem({ qty: Math.min(99, Math.max(1, Math.floor(Number(e.target.value)))) })} /></label><label className="editor-field">Unit price ($)<input aria-label={`Item ${index + 1} price`} type="number" min="0" max="9999" step="0.01" value={item.price} onChange={(e) => changeItem({ price: Math.min(9999, Math.max(0, Number(e.target.value))) })} /></label><Button variant="ghost" size="icon" aria-label={`Remove item ${index + 1}`} title="Remove item" onClick={() => update({ items: data.items.filter((entry) => entry.id !== item.id) })}><Trash2 /></Button></div>
      </div>;
    })}</div>
    <label className="editor-field">Total override ($)<input type="number" aria-label="Total override" min="0" max="999999" step="0.01" placeholder="Automatic" value={data.totalOverride} onChange={(e) => update({ totalOverride: e.target.value === "" ? "" : String(Math.max(0, Math.min(999999, Number(e.target.value)))) })} /></label>
    <div className="editor-total"><span>Total</span><strong>${receiptTotal(data).toFixed(2)}</strong></div>
    <Button variant="outline" className="editor-reset" onClick={() => onChange(structuredClone(defaultReceipt))}><RotateCcw />Reset receipt</Button>
  </aside>;
}