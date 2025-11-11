"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import BuyBot from '../../components/BuyBot';

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const idleTimer = useRef(null);
  const [idleMs, setIdleMs] = useState(0);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('buybot_cart') || '[]');
    setCart(saved);
  }, []);

  useEffect(() => {
    const onActivity = () => {
      setIdleMs(0);
      if (idleTimer.current) clearInterval(idleTimer.current);
      idleTimer.current = setInterval(() => setIdleMs((ms) => ms + 1000), 1000);
    };
    ['mousemove','keydown','scroll','click','touchstart'].forEach(e => window.addEventListener(e, onActivity));
    onActivity();
    return () => {
      ['mousemove','keydown','scroll','click','touchstart'].forEach(e => window.removeEventListener(e, onActivity));
      if (idleTimer.current) clearInterval(idleTimer.current);
    };
  }, []);

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const discountAmt = useMemo(() => Math.min(subtotal * discount, 30), [subtotal, discount]);
  const total = useMemo(() => Math.max(subtotal - discountAmt, 0), [subtotal, discountAmt]);

  const startStripe = async () => {
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, total })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Stripe unavailable, switching to demo confirmation.');
        alert('Payment simulated. Order confirmed!');
        localStorage.removeItem('buybot_cart');
        window.location.href = '/';
      }
    } catch (e) {
      alert('Stripe error, using demo flow.');
      alert('Payment simulated. Order confirmed!');
      localStorage.removeItem('buybot_cart');
      window.location.href = '/';
    }
  };

  const startRazorpay = async () => {
    try {
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(total * 100) })
      });
      const data = await res.json();
      if (!data || !data.orderId || !data.key) {
        alert('Razorpay unavailable, switching to demo confirmation.');
        alert('Payment simulated. Order confirmed!');
        localStorage.removeItem('buybot_cart');
        window.location.href = '/';
        return;
      }
      const options = {
        key: data.key,
        amount: data.amount,
        currency: 'INR',
        name: 'BuyBot Store',
        description: 'Test Transaction',
        order_id: data.orderId,
        handler: function () {
          alert('Payment successful!');
          localStorage.removeItem('buybot_cart');
          window.location.href = '/';
        },
        prefill: { email: 'demo@example.com' }
      };
      // Load script dynamically
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => {
        // eslint-disable-next-line no-undef
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(s);
    } catch (e) {
      alert('Razorpay error, using demo flow.');
      alert('Payment simulated. Order confirmed!');
      localStorage.removeItem('buybot_cart');
      window.location.href = '/';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <div className="rounded border bg-white p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className="border rounded p-2" placeholder="First name" />
            <input className="border rounded p-2" placeholder="Last name" />
            <input className="border rounded p-2 col-span-2" placeholder="Email" />
            <input className="border rounded p-2 col-span-2" placeholder="Address" />
          </div>
        </div>
        <div className="rounded border bg-white p-4">
          <div className="text-sm text-gray-600">Idle for: {Math.floor(idleMs/1000)}s</div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded border bg-white p-4 space-y-2">
          <h2 className="font-semibold">Order Summary</h2>
          {cart.length === 0 && <div className="text-sm text-gray-500">No items. Add some from the store.</div>}
          {cart.map(i => (
            <div key={i.id} className="flex items-center justify-between text-sm">
              <div>{i.name} ? {i.qty}</div>
              <div>${(i.qty * i.price).toFixed(2)}</div>
            </div>
          ))}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>Subtotal</div><div>${subtotal.toFixed(2)}</div>
          </div>
          {discountAmt > 0 && (
            <div className="flex items-center justify-between text-sm text-green-700">
              <div>Discount</div><div>-${discountAmt.toFixed(2)}</div>
            </div>
          )}
          <div className="flex items-center justify-between border-t pt-2 font-medium">
            <div>Total</div><div>${total.toFixed(2)}</div>
          </div>
          <div className="grid grid-cols-1 gap-2 pt-2">
            <button onClick={startStripe} className="rounded bg-black text-white px-3 py-2 text-sm">Pay with Stripe</button>
            <button onClick={startRazorpay} className="rounded bg-indigo-600 text-white px-3 py-2 text-sm">Pay with Razorpay</button>
          </div>
        </div>
        <div className="text-xs text-gray-500">Test mode: Payments fall back to demo confirmation if providers are not configured.</div>
      </div>

      <BuyBot cart={cart} subtotal={subtotal} onOffer={(p) => setDiscount(p)} />
    </div>
  );
}
