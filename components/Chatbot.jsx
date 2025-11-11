"use client";
import { useEffect, useRef, useState } from 'react';

export default function Chatbot({ cart, subtotal, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I can help with sizing, shipping, and discounts.' }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', text: userText }]);

    // Simple rule-based responses
    setTimeout(() => {
      let reply = 'Could you clarify that?';
      const lower = userText.toLowerCase();
      if (lower.includes('ship')) reply = 'We offer free shipping over $100. Delivery in 3-5 days.';
      else if (lower.includes('discount') || lower.includes('coupon')) reply = 'I can add a 5% discount for you now! Applied.';
      else if (lower.includes('return')) reply = '30-day hassle-free returns on all items.';
      else if (lower.includes('price') || lower.includes('cheaper')) reply = 'We price-match authorized retailers. Send us a link!';
      else if (lower.includes('help')) reply = 'Happy to help! What are you unsure about?';
      setMessages(m => [...m, { role: 'bot', text: reply }]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {messages.map((m, idx) => (
          <div key={idx} className={m.role === 'bot' ? 'text-sm' : 'text-sm text-right'}>
            <span className={m.role === 'bot' ? 'inline-block bg-gray-100 rounded px-3 py-2' : 'inline-block bg-blue-600 text-white rounded px-3 py-2'}>{m.text}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="border-t p-3 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSend()} className="flex-1 border rounded px-3 py-2 text-sm" placeholder="Type your message..." />
        <button onClick={handleSend} className="rounded bg-black text-white px-3 py-2 text-sm">Send</button>
        <button onClick={onClose} className="rounded border px-3 py-2 text-sm">Close</button>
      </div>
    </div>
  );
}
