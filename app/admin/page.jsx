"use client";
import { useEffect, useMemo, useState } from 'react';

export default function AdminPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Load session-local insights and server-side aggregated snapshot
    const local = JSON.parse(localStorage.getItem('buybot_clicks') || '{}');
    fetch('/api/insights').then(r => r.json()).then(d => setEvents(d.events || [])).catch(() => setEvents([]));
    const localEvents = Object.entries(local).map(([productId, clicks]) => ({ productId, clicks }));
    setEvents(e => [{ type: 'local_clicks', data: localEvents }, ...e]);
  }, []);

  const recommendations = useMemo(() => {
    // Simple heuristic: if many hesitations on order value range, suggest price test
    const hesitations = events.filter(e => e.type === 'hesitation');
    const count = hesitations.length;
    const avgSubtotal = hesitations.reduce((s, e) => s + (e.subtotal || 0), 0) / (count || 1);
    const suggestDiscount = avgSubtotal > 100 ? 'Test 8?12% discounts for carts over $100' : 'Test 3?5% discounts for small carts';
    return { count, avgSubtotal: Math.round(avgSubtotal), suggestDiscount };
  }, [events]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Insights</h1>
      <div className="rounded border bg-white p-4">
        <div className="font-medium mb-2">Hesitation Summary</div>
        <div className="text-sm text-gray-700">Events captured: {recommendations.count}</div>
        <div className="text-sm text-gray-700">Avg. subtotal at hesitation: ${recommendations.avgSubtotal}</div>
        <div className="text-sm text-gray-700">Recommendation: {recommendations.suggestDiscount}</div>
      </div>
      <div className="rounded border bg-white p-4">
        <div className="font-medium mb-2">Session Interest (Local)</div>
        <div className="text-sm text-gray-600">Reorder higher-interest products to top of list.</div>
      </div>
    </div>
  );
}
