"use client";
import { useEffect, useRef, useState } from 'react';
import Chatbot from './Chatbot';

export default function BuyBot({ cart, subtotal, onOffer }) {
  const [open, setOpen] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const idleRef = useRef(0);
  const idleTimer = useRef(null);
  const [mode, setMode] = useState('offer'); // 'offer' | 'chat'

  useEffect(() => {
    // Detect mouse leave (exit intent)
    const onLeave = (e) => {
      if (e.clientY <= 0) {
        trigger('exit_intent');
      }
    };
    // Detect tab hidden/visible
    const onVis = () => {
      if (document.hidden) setTabSwitches((c) => c + 1);
      if (document.hidden && tabSwitches >= 1) trigger('tab_switch');
    };
    // Idle detection
    const onActivity = () => { idleRef.current = 0; };
    const tick = () => {
      idleRef.current += 1;
      if (idleRef.current === 12) trigger('idle_12s');
    };

    window.addEventListener('mouseout', onLeave);
    document.addEventListener('visibilitychange', onVis);
    ['mousemove','keydown','scroll','click','touchstart'].forEach(e => window.addEventListener(e, onActivity));
    idleTimer.current = setInterval(tick, 1000);

    return () => {
      window.removeEventListener('mouseout', onLeave);
      document.removeEventListener('visibilitychange', onVis);
      ['mousemove','keydown','scroll','click','touchstart'].forEach(e => window.removeEventListener(e, onActivity));
      if (idleTimer.current) clearInterval(idleTimer.current);
    };
  }, [tabSwitches]);

  const trigger = (reason) => {
    if (open) return;
    // Simple rule engine for offer size based on cart value
    const offerPct = subtotal > 200 ? 0.12 : subtotal > 100 ? 0.08 : 0.05;
    onOffer(offerPct);
    fetch('/api/hesitation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason, cart, subtotal, ts: Date.now() }) }).catch(()=>{});
    setMode(reason === 'idle_12s' ? 'chat' : 'offer');
    setOpen(true);
  };

  const close = () => setOpen(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-3">
          <div className="font-semibold">BuyBot Assistant</div>
          <button aria-label="Close" onClick={close} className="text-gray-500 hover:text-gray-800">?</button>
        </div>
        {mode === 'offer' ? (
          <div className="p-4 space-y-3">
            <div className="text-lg">We noticed you might need a nudge ??</div>
            <div className="text-sm text-gray-600">Here's a personalized discount applied to your order.</div>
            <div className="rounded bg-green-50 text-green-800 p-3 text-sm">Discount applied automatically at checkout.</div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={close} className="px-3 py-2 rounded border text-sm">Keep Browsing</button>
              <a href="/checkout" className="px-3 py-2 rounded bg-black text-white text-sm">Complete Purchase</a>
            </div>
          </div>
        ) : (
          <div className="p-0">
            <Chatbot cart={cart} subtotal={subtotal} onClose={close} />
          </div>
        )}
      </div>
    </div>
  );
}
