import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { QuoteLineItem } from '../lib/types';
import type { User } from '@supabase/supabase-js';
import type { ViewType } from '../App';
import { Header } from './Header';

type ProductType =
  | 'Plain Recycled Paper Pencil'
  | 'Branded Recycled Paper Pencil'
  | 'Branded Plantable Pencil (Seed-Embedded)'
  | 'Coloured Pencils (Box of 10)'
  | 'Coloured Pencil Pouch'
  | 'Branded Recycled Paper Pen'
  | 'Customised Plantable Notebook (A5)'
  | 'Plantable Business Card'
  | 'Plantable Wedding Card (A5)';

type CategoryType = 'Writing' | 'Sets' | 'Stationery';

const PRODUCT_CATEGORIES: Record<CategoryType, ProductType[]> = {
  Writing: [
    'Plain Recycled Paper Pencil',
    'Branded Recycled Paper Pencil',
    'Branded Plantable Pencil (Seed-Embedded)',
    'Branded Recycled Paper Pen',
  ],
  Sets: ['Coloured Pencils (Box of 10)', 'Coloured Pencil Pouch'],
  Stationery: [
    'Customised Plantable Notebook (A5)',
    'Plantable Business Card',
    'Plantable Wedding Card (A5)',
  ],
};

const PRODUCT_PRICES: Record<ProductType, number> = {
  'Plain Recycled Paper Pencil': 20,
  'Branded Recycled Paper Pencil': 30,
  'Branded Plantable Pencil (Seed-Embedded)': 40,
  'Coloured Pencils (Box of 10)': 300,
  'Coloured Pencil Pouch': 550,
  'Branded Recycled Paper Pen': 40,
  'Customised Plantable Notebook (A5)': 140,
  'Plantable Business Card': 10,
  'Plantable Wedding Card (A5)': 75,
};

const PRODUCT_LABELS: Record<ProductType, string> = {
  'Plain Recycled Paper Pencil': 'Plain pencil',
  'Branded Recycled Paper Pencil': 'Branded pencil',
  'Branded Plantable Pencil (Seed-Embedded)': 'Plantable pencil',
  'Coloured Pencils (Box of 10)': 'Coloured pencils (box of 10)',
  'Coloured Pencil Pouch': 'Pencil pouch',
  'Branded Recycled Paper Pen': 'Branded pen',
  'Customised Plantable Notebook (A5)': 'Plantable notebook (A5)',
  'Plantable Business Card': 'Business card',
  'Plantable Wedding Card (A5)': 'Wedding card (A5)',
};

const ALL_PRODUCTS = Object.keys(PRODUCT_PRICES) as ProductType[];

function getLineDiscount(qty: number): number {
  return qty >= 2000 ? 0.15 : qty >= 500 ? 0.08 : 0;
}

function getProductTimeline(product: ProductType): number {
  const name = product.toLowerCase();
  return name.includes('pencil') || name.includes('pen') ? 7 : 14;
}

function isPlantable(product: ProductType): boolean {
  return product.includes('Plantable') || product.includes('Seed');
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export const QuoteBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  const [quantities, setQuantities] = useState<Record<ProductType, number>>(() =>
    ALL_PRODUCTS.reduce((acc, p) => ({ ...acc, [p]: 0 }), {} as Record<ProductType, number>)
  );
  const [market, setMarket] = useState<'Mauritius' | 'Export'>('Mauritius');

  /* Contact form fields — auto-filled from session */
  const [contactName, setContactName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitError, setSubmitError] = useState('');

  /* Auto-fill user info from Google session */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        setContactName(user.user_metadata?.full_name || '');
        setEmail(user.email || '');
      }
    });
  }, []);

  const setQty = useCallback((product: ProductType, qty: number) => {
    setQuantities((prev) => ({ ...prev, [product]: Math.max(0, Math.min(10000, qty)) }));
  }, []);

  const lineItems = useMemo(() => {
    return ALL_PRODUCTS.filter((p) => quantities[p] > 0).map((product) => {
      const qty = quantities[product];
      const base = PRODUCT_PRICES[product];
      const discount = getLineDiscount(qty);
      const unitPrice = base * (1 - discount);
      const lineTotal = Math.round(unitPrice * qty);
      return { product, label: PRODUCT_LABELS[product], qty, unitPrice, lineTotal, discount };
    });
  }, [quantities]);

  const quote = useMemo(() => {
    const marketBuffer = market === 'Export' ? 10 : 0;
    let total = 0;
    let seeds = 0;
    let paperGrams = 0;
    let co2Saved = 0;
    let maxTimeline = 0;

    lineItems.forEach((line) => {
      total += line.lineTotal;
      maxTimeline = Math.max(maxTimeline, getProductTimeline(line.product));
      if (isPlantable(line.product)) seeds += Math.floor(line.qty * 1.5);
      paperGrams += Math.floor(line.qty * 12.5);
      co2Saved += line.qty * 0.09;
    });

    return { total, timeline: maxTimeline + marketBuffer, seeds, paperGrams, co2Saved: parseFloat(co2Saved.toFixed(1)) };
  }, [lineItems, market]);

  const hasSelection = lineItems.length > 0;

  const handleSubmit = async () => {
    if (!hasSelection || !contactName.trim() || !email.trim()) return;

    setSubmitState('submitting');
    setSubmitError('');

    const payload = {
      user_id: user?.id,
      contact_name: contactName.trim(),
      company_name: companyName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
      market,
      line_items: lineItems.map((li): QuoteLineItem => ({
        product: li.product,
        label: li.label,
        qty: li.qty,
        unit_price: li.unitPrice,
        line_total: li.lineTotal,
        discount: li.discount,
      })),
      total: quote.total,
      estimated_timeline: quote.timeline,
      seeds: quote.seeds,
      paper_grams: quote.paperGrams,
      co2_saved: quote.co2Saved,
      status: 'new' as const,
    };

    const { error } = await supabase.from('quotes').insert(payload);

    if (error) {
      setSubmitState('error');
      setSubmitError(error.message);
    } else {
      setSubmitState('success');

      // Send admin + customer emails via edge function (fire-and-forget, don't block UI)
      const fnUrl = `${import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')}/functions/v1/notify-new-quote`;
      console.log('[Morivert] Calling quote email:', fnUrl);
      supabase.functions.invoke('notify-new-quote', { body: payload }).then(({ data, error }) => {
        if (error) console.error('[Morivert] Quote email failed:', error);
        else if (data?.error) console.error('[Morivert] Quote email error:', data);
        else console.log('[Morivert] Quote email sent:', data);
      }).catch((err) => {
        console.error('[Morivert] Quote email request failed:', err);
      });
    }
  };

  const headerProps = {
    currentView: 'quote' as ViewType,
    setView: (v: ViewType) => (v === 'quote' ? navigate('/quote') : navigate('/')),
  };

  if (submitState === 'success') {
    return (
      <div className="w-full min-h-screen bg-[#050505] text-zinc-100 font-sans">
        <Header {...headerProps} />
        <div className="flex items-center justify-center px-4 pt-24 pb-12 min-h-screen">
        <div className="max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">Quote submitted</h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Thank you, {contactName}. We've received your quote request for Rs {quote.total.toLocaleString()} and will get back to you at {email} within 24 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-zinc-500">
            <span>🌱 {quote.seeds} plants</span>
            <span>☁️ {quote.co2Saved} kg CO₂</span>
            <span>~{quote.timeline} days</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm bg-emerald-500 text-black font-semibold px-6 py-3 rounded-xl hover:bg-emerald-400 transition-colors"
              >
                View my quotes
              </button>
            ) : (
              <>
                <p className="text-xs text-zinc-500 max-w-sm">
                  To view your quote or download it as PDF, sign in or create an account.
                </p>
                <button
                  onClick={() => navigate('/login?returnTo=/dashboard')}
                  className="text-sm bg-emerald-500 text-black font-semibold px-6 py-3 rounded-xl hover:bg-emerald-400 transition-colors"
                >
                  Sign in or sign up
                </button>
              </>
            )}
            <button
              onClick={() => {
                setSubmitState('idle');
                setQuantities(ALL_PRODUCTS.reduce((acc, p) => ({ ...acc, [p]: 0 }), {} as Record<ProductType, number>));
                setContactName(user?.user_metadata?.full_name || '');
                setCompanyName('');
                setEmail(user?.email || '');
                setPhone('');
                setMessage('');
              }}
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Submit another quote
            </button>
          </div>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#050505] text-zinc-100 font-sans overflow-x-hidden">
      <Header {...headerProps} />
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute top-0 right-0 w-[80vw] h-[80vh] bg-zinc-800/10 blur-[160px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[60vw] h-[60vh] bg-emerald-950/5 blur-[140px] rounded-full -translate-x-1/3 translate-y-1/3" />
      </div>

      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-40 sm:pb-44 lg:pb-32" role="main">
        <header className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white">Get a quote</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Add quantities for any products you need, fill in your details, and submit.
          </p>
        </header>

        {/* Step 1: Products */}
        <div className="space-y-8">
          {(Object.entries(PRODUCT_CATEGORIES) as [CategoryType, ProductType[]][]).map(
            ([category, products]) => (
              <section key={category} className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{category}</h2>
                <ul className="space-y-2">
                  {products.map((product) => {
                    const qty = quantities[product];
                    const price = PRODUCT_PRICES[product];
                    const label = PRODUCT_LABELS[product];
                    return (
                      <li key={product} className="flex flex-wrap items-center gap-3 sm:gap-4 py-3 px-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                        <div className="min-w-0 flex-1">
                          <span className="text-sm sm:text-base font-medium text-white">{label}</span>
                          <span className="ml-2 text-xs text-zinc-500">Rs {price} each</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setQty(product, qty - 50)} disabled={qty <= 0} className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none">−</button>
                          <input
                            type="number" inputMode="numeric" min={0} max={10000} step={50}
                            value={qty === 0 ? '' : qty}
                            onChange={(e) => setQty(product, e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
                            placeholder="0"
                            className="w-16 sm:w-20 h-9 bg-zinc-800 rounded-lg text-center text-sm font-medium text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button type="button" onClick={() => setQty(product, qty + 50)} disabled={qty >= 10000} className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none">+</button>
                        </div>
                        {qty > 0 && (
                          <span className="text-xs text-emerald-400 font-medium w-20 text-right">
                            Rs {Math.round(price * (1 - getLineDiscount(qty)) * qty).toLocaleString()}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )
          )}
        </div>

        {/* Delivery */}
        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Delivery</h2>
          <div className="flex gap-3">
            {(['Mauritius', 'Export'] as const).map((m) => (
              <button key={m} type="button" onClick={() => setMarket(m)} aria-pressed={market === m}
                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${market === m ? 'bg-white text-black border-white' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </section>

        {/* Step 2: Contact Details (only shown when products selected) */}
        {hasSelection && (
          <section className="mt-10 p-6 sm:p-8 rounded-2xl bg-zinc-900/70 border border-zinc-800">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-6">Your details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Full name *</label>
                <input
                  type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Company</label>
                <input
                  type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Ltd"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Email *</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  placeholder="john@acme.com"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Phone</label>
                <input
                  type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+230 5XXX XXXX"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-zinc-500 mb-1.5">Message (optional)</label>
                <textarea
                  value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
                  placeholder="Tell us about your project, branding needs, or any special requirements..."
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>
            </div>
          </section>
        )}

        {/* Summary + Submit */}
        <section className="mt-10 p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-500 mb-4">Your quote</h2>

          {!hasSelection ? (
            <p className="text-zinc-500 text-sm py-6">Add quantities above to see your quote and total.</p>
          ) : (
            <>
              <ul className="space-y-2 mb-6 pb-6 border-b border-zinc-800">
                {lineItems.map((line) => (
                  <li key={line.product} className="flex justify-between items-baseline gap-4 text-sm">
                    <span className="text-zinc-300 truncate">{line.label} × {line.qty}</span>
                    <span className="text-white font-medium shrink-0">Rs {line.lineTotal.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-zinc-500 text-sm">Total</span>
                <span className="text-2xl sm:text-3xl font-light text-white">Rs {quote.total.toLocaleString()}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-zinc-500 mb-6">
                <span>~{quote.timeline} days</span>
                <span>🌱 {quote.seeds} plants</span>
                <span>☁️ {quote.co2Saved} kg CO₂ avoided</span>
                <span>📦 {(quote.paperGrams / 1000).toFixed(1)} kg recycled</span>
              </div>

              {submitError && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                  {submitError}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitState === 'submitting' || !contactName.trim() || !email.trim()}
                className="w-full py-4 rounded-xl bg-emerald-500 text-black text-sm font-bold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitState === 'submitting' ? 'Submitting...' : 'Submit quote request →'}
              </button>
              {(!contactName.trim() || !email.trim()) && (
                <p className="text-center text-[10px] text-amber-500/80 mt-3">
                  Fill in your name and email above to submit.
                </p>
              )}
              <p className="text-center text-[10px] text-zinc-600 mt-2">
                Includes standard branding and eco-packaging.
              </p>
            </>
          )}
        </section>
      </main>

      {/* Mobile sticky CTA */}
      {hasSelection && (
        <div className="fixed bottom-0 left-0 right-0 w-full px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-black/95 backdrop-blur border-t border-zinc-800 z-[100] lg:hidden">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-4 mb-3">
            <span className="text-zinc-500 text-xs">Total</span>
            <span className="text-xl font-light text-white">Rs {quote.total.toLocaleString()}</span>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitState === 'submitting' || !contactName.trim() || !email.trim()}
            className="w-full max-w-lg mx-auto block py-4 rounded-xl bg-emerald-500 text-black text-sm font-bold disabled:opacity-50"
          >
            {submitState === 'submitting' ? 'Submitting...' : 'Submit quote'}
          </button>
        </div>
      )}

      <footer className="relative w-full py-8 px-4 border-t border-zinc-900 bg-[#050505] z-10 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left text-xs text-zinc-600">
          <span className="font-medium text-white/50">MORIVERT</span>
          <span>© 2025 Morivert Mauritius</span>
        </div>
      </footer>
    </div>
  );
};
