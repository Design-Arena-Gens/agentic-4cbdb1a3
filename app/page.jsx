"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'Wireless Headphones', price: 99, image: '??', baseScore: 0.9 },
  { id: 'p2', name: 'Smart Watch', price: 149, image: '?', baseScore: 0.8 },
  { id: 'p3', name: 'Portable Speaker', price: 79, image: '??', baseScore: 0.7 },
  { id: 'p4', name: 'Phone Case', price: 19, image: '??', baseScore: 0.4 },
];

export default function HomePage() {
  const [cart, setCart] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('buybot_cart') || '[]') : [];
    setCart(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('buybot_cart', JSON.stringify(cart));
  }, [cart]);

  // Simple personalization: reorder by baseScore + session click interest
  const scores = useMemo(() => {
    const clicks = JSON.parse(localStorage.getItem('buybot_clicks') || '{}');
    return Object.fromEntries(
      INITIAL_PRODUCTS.map(p => [p.id, p.baseScore + (clicks[p.id] || 0) * 0.05])
    );
  }, []);

  const products = useMemo(() => {
    return [...INITIAL_PRODUCTS].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
  }, [scores]);

  const addToCart = (p) => {
    setEvents(e => [...e, { type: 'add_to_cart', productId: p.id, ts: Date.now() }]);
    setCart(prev => {
      const existing = prev.find(i => i.id === p.id);
      if (existing) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1 }];
    });
    const clicks = JSON.parse(localStorage.getItem('buybot_clicks') || '{}');
    clicks[p.id] = (clicks[p.id] || 0) + 1;
    localStorage.setItem('buybot_clicks', JSON.stringify(clicks));
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="space-y-8">
      <section className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trending Products</h1>
        <Link href="/checkout" className="rounded bg-black px-4 py-2 text-white text-sm">Checkout (${total.toFixed(2)})</Link>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="rounded-lg border bg-white p-5 flex flex-col">
            <div className="text-5xl mb-3">{p.image}</div>
            <div className="font-medium">{p.name}</div>
            <div className="text-gray-600 text-sm">${p.price}</div>
            <button onClick={() => addToCart(p)} className="mt-4 rounded bg-blue-600 text-white text-sm px-3 py-2 hover:bg-blue-700">Add to Cart</button>
          </div>
        ))}
      </div>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="font-semibold mb-2">Cart</h2>
        {cart.length === 0 && <div className="text-gray-500 text-sm">Your cart is empty.</div>}
        {cart.length > 0 && (
          <div className="space-y-2">
            {cart.map(i => (
              <div key={i.id} className="flex items-center justify-between text-sm">
                <div>{i.name} ? {i.qty}</div>
                <div>${(i.qty * i.price).toFixed(2)}</div>
              </div>
            ))}
            <div className="flex items-center justify-between border-t pt-2 font-medium">
              <div>Total</div>
              <div>${total.toFixed(2)}</div>
            </div>
            <Link href="/checkout" className="inline-block rounded bg-black px-4 py-2 text-white text-sm">Proceed to Checkout</Link>
          </div>
        )}
      </section>
    </div>
  );
}
