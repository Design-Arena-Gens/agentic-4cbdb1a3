import './globals.css';

export const metadata = {
  title: 'BuyBot - E-Commerce Checkout AI Agent',
  description: 'Detects hesitation, offers help, and optimizes checkout.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-semibold text-xl">BuyBot</a>
            <nav className="space-x-4 text-sm">
              <a href="/" className="hover:underline">Store</a>
              <a href="/checkout" className="hover:underline">Checkout</a>
              <a href="/admin" className="hover:underline">Insights</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <footer className="mt-10 border-t bg-white">
          <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-gray-500">? {new Date().getFullYear()} BuyBot</div>
        </footer>
      </body>
    </html>
  );
}
