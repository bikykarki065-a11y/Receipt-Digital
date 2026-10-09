import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Coffee, Printer, Scissors, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

const order = {
  id: "#CR-8429",
  date: "Oct 08, 09:01 PM",
  cashier: "Alex R.",
  items: [
    { qty: 2, desc: "Iced Caramel Oat Macchiato", price: 13 },
    { qty: 1, desc: "Classic Butter Croissant", price: 4.5 },
  ],
};

function Receipt() {
  return (
    <article className="receipt-paper" aria-label="Order receipt">
      <div className="receipt-brand">
        <div className="brand-topline"><Coffee size={20} strokeWidth={1.5} /><span>EST. 2018</span></div>
        <h2>The Roast<br /><span>& Bean.</span></h2>
        <div className="brand-bottomline"><span>GOOD COFFEE. GOOD COMPANY.</span><ArrowUpRight size={15} /></div>
      </div>
      <div className="receipt-body">
        <div className="receipt-intro"><span>YOUR DAILY DOSE OF GOOD.</span><span>ARTISAN COFFEE ROASTERS</span></div>
        <div className="receipt-rule" />
        <dl className="order-meta">
          <div><dt>ORDER</dt><dd className="font-semibold">{order.id}</dd></div>
          <div><dt>DATE</dt><dd>{order.date}</dd></div>
          <div><dt>CASHIER</dt><dd>{order.cashier}</dd></div>
          <div><dt>STATUS</dt><dd className="paid"><Check size={10} /> PAID</dd></div>
        </dl>
        <div className="receipt-rule" />
        <div className="item-heading"><span>QTY / DESCRIPTION</span><span>AMT</span></div>
        <div className="receipt-items">{order.items.map((item) => <div key={item.desc}><span className="item-qty">{item.qty}×</span><span className="item-name">{item.desc}</span><span>${item.price.toFixed(2)}</span></div>)}</div>
        <div className="receipt-rule" />
        <div className="receipt-total"><span>TOTAL</span><strong>${order.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</strong></div>
        <div className="receipt-thanks">A little pick-me-up.<br /><span>Thanks for stopping by.</span></div>
        <div className="barcode" aria-hidden="true" />
        <div className="barcode-number">8 4 2 9 0 0 1 7 5 0</div>
      </div>
    </article>
  );
}

export function ReceiptPrinter() {
  const [state, setState] = useState<"printed" | "printing" | "torn">("printed");
  const [audio, setAudio] = useState(false);
  const [count, setCount] = useState(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    void audioContext.current?.close();
  }, []);

  function playSound(kind: "print" | "tear" | "toggle", enabled = audio) {
    if (!enabled) return;
    try {
      const context = audioContext.current ?? new AudioContext();
      audioContext.current = context;
      void context.resume();
      const duration = kind === "print" ? 2.2 : kind === "tear" ? 0.22 : 0.08;
      const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t = i / context.sampleRate;
        data[i] = (Math.random() * 2 - 1) * (kind === "print" ? 0.35 + 0.3 * Math.sin(t * 150) : Math.exp(-t * 16));
      }
      const source = context.createBufferSource();
      const gain = context.createGain();
      gain.gain.value = kind === "print" ? 0.045 : 0.1;
      source.buffer = buffer;
      source.connect(gain);
      gain.connect(context.destination);
      source.start();
    } catch { /* Audio may be unavailable in the browser. */ }
  }

  function print() {
    if (state === "printing") return;
    setState("printing");
    playSound("print");
    timer.current = setTimeout(() => { setState("printed"); setCount((value) => value + 1); }, 2500);
  }

  return (
    <div className="studio-shell">
      <header className="studio-header">
        <a href="/" className="studio-logo"><span className="logo-mark"><Printer size={19} strokeWidth={1.6} /></span><span>receipt<span className="logo-light">.studio</span></span></a>
        <div className="header-status"><span className="status-dot" /> ALL SYSTEMS GOOD <span className="header-version">V.01</span></div>
      </header>

      <main className="workspace">
        <div className="workspace-heading"><span className="eyebrow">THE EVERYDAY, REIMAGINED</span><h1>A moment. On paper.</h1></div>
        <div className="printer-scene">
          <div className="scene-label scene-label-left"><span className="label-line" /><span>THERMAL PRINTING</span><strong>Small details.<br />Lasting impressions.</strong></div>
          <div className="printer-hardware">
            <div className="machine-top"><span className="machine-wordmark">R<span className="wordmark-period">.</span></span><span className="machine-status"><span className={`status-dot ${state === "printing" ? "is-printing" : ""}`} />{state === "printing" ? "PRINTING" : "READY"}</span></div>
            <div className="machine-slot"><div className="slot-inner" /></div>
            <div className="machine-base"><span>THERMAL / 80 MM</span><span className="machine-lines">|||</span></div>
          </div>
          <div className={`paper-viewport ${state}`} key={state === "printing" ? `print-${count}` : "receipt"}>
            {state === "torn" && <div className="paper-stub" />}
            <div className="paper-motion"><Receipt /></div>
          </div>
          <div className="scene-label scene-label-right"><span className="label-line" /><span>ORDER {order.id}</span><strong>Freshly brewed.<br />Perfectly printed.</strong><span className="label-index">01 / 01</span></div>
          <div className="floor-shadow" />
        </div>

        <div className="control-area">
          <nav className="control-dock" aria-label="Receipt controls">
            <Button variant="ghost" className="dock-button" disabled={state === "printing"} onClick={print}><Printer size={17} /><span>{state === "printing" ? "PRINTING" : "RE-PRINT"}</span></Button>
            <span className="dock-divider" />
            <Button variant="ghost" className="dock-button" disabled={state !== "printed"} onClick={() => { setState("torn"); playSound("tear"); }}><Scissors size={17} /><span>TEAR</span></Button>
            <span className="dock-divider" />
            <Button variant="ghost" className={`dock-button ${audio ? "audio-on" : ""}`} aria-pressed={audio} onClick={() => { playSound("toggle", !audio); setAudio(!audio); }} title={audio ? "Mute printer sounds" : "Enable printer sounds"}>{audio ? <Volume2 size={17} /> : <VolumeX size={17} />}<span>AUDIO</span><span className="audio-indicator" /></Button>
          </nav>
          <div className="print-status" role="status"><span className={`status-dot ${state === "printing" ? "is-printing" : ""}`} />{state === "printing" ? "Printing your little moment" : state === "torn" ? "Receipt torn. A fresh one awaits." : "Your receipt is ready"}</div>
        </div>
      </main>
      <footer className="studio-footer"><span>A LITTLE ANALOG IN A DIGITAL WORLD.</span><span>DESIGNED TO FEEL SOMETHING <span className="footer-spark">✳</span></span></footer>
    </div>
  );
}