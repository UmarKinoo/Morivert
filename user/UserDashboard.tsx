import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { generateQuotePDF } from '../lib/generateQuotePDF';
import { generateImpactReportPDF } from '../lib/generateImpactReportPDF';
import type { QuoteSubmission, QuoteLineItem } from '../lib/types';

const PENDING_IMPACT_KEY = 'morivert_pending_impact_report';

interface PendingImpactPayload {
  quantity: number;
  productType: 'pencil' | 'notepad' | 'pen';
  custom: boolean;
  impact: { seeds: number; paper: number; co2: number; trees: number; children: number };
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  new: 'New',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<QuoteSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingImpact, setPendingImpact] = useState<PendingImpactPayload | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const readPendingImpact = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_IMPACT_KEY);
      if (!raw) {
        setPendingImpact(null);
        return;
      }
      const data = JSON.parse(raw) as PendingImpactPayload;
      if (data?.quantity != null && data?.impact) setPendingImpact(data);
      else setPendingImpact(null);
    } catch {
      setPendingImpact(null);
    }
  }, []);

  useEffect(() => {
    readPendingImpact();
  }, [readPendingImpact]);

  const fetchQuotes = useCallback(async () => {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setQuotes(data as QuoteSubmission[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQuotes();

    // Get user info
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email || '');
        setUserAvatar(user.user_metadata?.avatar_url || '');
        setUserEmail(user.email || '');
      }
    });

    // Realtime subscription
    const channel = supabase
      .channel('user-quotes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, () => {
        fetchQuotes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchQuotes]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailMessage('');
    if (!newEmail.trim()) {
      setEmailError('Enter a new email address.');
      return;
    }
    setEmailLoading(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (error) {
      setEmailError(error.message);
      setEmailLoading(false);
      return;
    }
    setEmailMessage('Check your new email address to verify the change. You may need to sign in again.');
    setNewEmail('');
    setEmailLoading(false);
  };

  const handleDeleteQuote = async (id: string) => {
    const { error } = await supabase.from('quotes').delete().eq('id', id);
    if (!error) {
      setExpandedId((prev) => (prev === id ? null : prev));
      setDeleteConfirmId(null);
      fetchQuotes();
    }
  };

  const handleDownloadImpactPDF = () => {
    if (!pendingImpact) return;
    generateImpactReportPDF({
      quantity: pendingImpact.quantity,
      productType: pendingImpact.productType,
      custom: pendingImpact.custom,
      seeds: pendingImpact.impact.seeds,
      paper: pendingImpact.impact.paper,
      co2: pendingImpact.impact.co2,
      trees: pendingImpact.impact.trees,
      children: pendingImpact.impact.children,
    });
    sessionStorage.removeItem(PENDING_IMPACT_KEY);
    setPendingImpact(null);
  };

  const handleDownloadPDF = (quote: QuoteSubmission) => {
    generateQuotePDF({
      id: quote.id || '',
      created_at: quote.created_at || new Date().toISOString(),
      contact_name: quote.contact_name,
      company_name: quote.company_name,
      email: quote.email,
      phone: quote.phone,
      message: quote.message,
      market: quote.market,
      line_items: quote.line_items,
      total: quote.total,
      estimated_timeline: quote.estimated_timeline,
      seeds: quote.seeds,
      paper_grams: quote.paper_grams,
      co2_saved: quote.co2_saved,
      status: quote.status,
    });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getItemsSummary = (items: QuoteLineItem[]) => {
    const parsed: QuoteLineItem[] = Array.isArray(items) ? items : JSON.parse(items as any);
    if (parsed.length === 0) return 'No items';
    if (parsed.length === 1) return parsed[0].label || parsed[0].product;
    return `${parsed[0].label || parsed[0].product} +${parsed.length - 1} more`;
  };

  const filteredQuotes = useMemo(() => {
    let list = quotes;
    if (statusFilter !== 'all') {
      list = list.filter((q) => q.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (quote) =>
          quote.contact_name?.toLowerCase().includes(q) ||
          quote.company_name?.toLowerCase().includes(q) ||
          quote.email?.toLowerCase().includes(q) ||
          (quote as any).category?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [quotes, statusFilter, searchQuery]);

  const totalImpact = quotes.reduce(
    (acc, q) => ({
      seeds: acc.seeds + (q.seeds || 0),
      co2: acc.co2 + (q.co2_saved || 0),
      total: acc.total + (q.total || 0),
    }),
    { seeds: 0, co2: 0, total: 0 }
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#09090b]/95 backdrop-blur border-b border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-lg font-medium tracking-tight text-white hover:text-zinc-300 transition-colors">
              MORIVERT
            </button>
            <span className="text-zinc-700">/</span>
            <span className="text-sm text-zinc-500">My Quotes</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/quote')}
              className="hidden sm:block text-xs bg-emerald-500 text-black font-semibold px-4 py-2 rounded-lg hover:bg-emerald-400 transition-colors"
            >
              New Quote
            </button>
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg border border-zinc-700/80 bg-zinc-900/80 px-3 py-2 hover:bg-zinc-800/80 transition-colors"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                {userAvatar ? (
                  <img src={userAvatar} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline text-xs text-zinc-400 max-w-[120px] truncate">{userName}</span>
                <svg
                  className={`w-4 h-4 text-zinc-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-zinc-900 border border-zinc-700/80 shadow-xl py-2 z-[200]">
                  <div className="px-4 py-2.5 border-b border-zinc-700/80">
                    <p className="text-xs font-medium text-white truncate">{userName}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{userEmail}</p>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); navigate('/dashboard'); }}
                      className="w-full text-left px-4 py-2.5 text-[12px] text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      My Quotes
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                      className="w-full text-left px-4 py-2.5 text-[12px] text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      Profile & account
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); navigate('/quote'); }}
                      className="w-full text-left px-4 py-2.5 text-[12px] text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      New Quote
                    </button>
                  </div>
                  <div className="border-t border-zinc-700/80 py-1">
                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                      className="w-full text-left px-4 py-2.5 text-[12px] text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Pending Impact Report (after login redirect) */}
        {pendingImpact && (
          <div className="mb-8 p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <h3 className="text-sm font-semibold text-emerald-400 mb-2">Your Impact Report is ready</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Based on {pendingImpact.quantity.toLocaleString()} {pendingImpact.productType === 'pencil' ? 'pencils' : pendingImpact.productType === 'notepad' ? 'notepads' : 'pens'}
              — {pendingImpact.impact.seeds.toLocaleString()} seeds, {pendingImpact.impact.paper.toLocaleString()}g paper saved, {pendingImpact.impact.co2.toLocaleString()}g CO&#8322; avoided.
            </p>
            <button
              onClick={handleDownloadImpactPDF}
              className="flex items-center gap-2 text-xs font-semibold text-black bg-emerald-500 px-4 py-2.5 rounded-lg hover:bg-emerald-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Impact Report (PDF)
            </button>
          </div>
        )}

        {/* Account / Change email */}
        <div className="mb-8 rounded-xl bg-zinc-900/50 border border-zinc-800/50 overflow-hidden">
          <button
            type="button"
            onClick={() => setAccountOpen((o) => !o)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
          >
            <span className="text-sm font-medium text-white">Account &amp; email</span>
            <svg
              className={`w-4 h-4 text-zinc-500 transition-transform ${accountOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {accountOpen && (
            <div className="px-5 pb-5 pt-1 border-t border-zinc-800/50">
              <p className="text-xs text-zinc-500 mb-2">Current email</p>
              <p className="text-sm text-white mb-4">{userEmail || '—'}</p>
              <form onSubmit={handleChangeEmail} className="space-y-3">
                <label htmlFor="new-email" className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  New email address
                </label>
                <input
                  id="new-email"
                  type="email"
                  autoComplete="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new@example.com"
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                {emailError && (
                  <p className="text-sm text-red-400">{emailError}</p>
                )}
                {emailMessage && (
                  <p className="text-sm text-emerald-400">{emailMessage}</p>
                )}
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                >
                  {emailLoading ? 'Sending...' : 'Change email (verification sent to new address)'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* List / search / filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, company, email, category…"
            className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-300 outline-none focus:border-emerald-500"
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => navigate('/quote')}
            className="px-4 py-2.5 bg-emerald-500 text-black text-sm font-semibold rounded-xl hover:bg-emerald-400 transition-colors"
          >
            Create quote
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Total Quotes</div>
            <div className="text-xl font-light text-white">{quotes.length}</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Total Value</div>
            <div className="text-xl font-light text-white">Rs {totalImpact.total.toLocaleString()}</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Seeds Planted</div>
            <div className="text-xl font-light text-emerald-400">{totalImpact.seeds}</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">CO&#8322; Saved</div>
            <div className="text-xl font-light text-emerald-400">{totalImpact.co2.toFixed(1)} kg</div>
          </div>
        </div>

        {/* Quotes List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="text-lg font-light text-white mb-2">
              {quotes.length === 0 ? 'No quotes yet' : 'No quotes match your search'}
            </h3>
            <p className="text-sm text-zinc-500 mb-6">
              {quotes.length === 0 ? 'Submit your first quote or save a draft.' : 'Try a different search or filter.'}
            </p>
            {quotes.length === 0 && (
              <button
                onClick={() => navigate('/quote')}
                className="text-sm bg-emerald-500 text-black font-semibold px-6 py-3 rounded-xl hover:bg-emerald-400 transition-colors"
              >
                Create quote
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuotes.map((quote) => {
              const isExpanded = expandedId === quote.id;
              const items: QuoteLineItem[] = Array.isArray(quote.line_items)
                ? quote.line_items
                : JSON.parse(quote.line_items as any);

              return (
                <div
                  key={quote.id}
                  className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden transition-colors hover:border-zinc-700/50"
                >
                  {/* Summary Row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : (quote.id || null))}
                    className="w-full text-left px-5 py-4 flex flex-wrap items-center gap-3 sm:gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-white truncate">
                        {getItemsSummary(quote.line_items)}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {formatDate(quote.created_at)}
                      </div>
                    </div>

                    <span className="text-sm font-medium text-white">
                      Rs {quote.total.toLocaleString()}
                    </span>

                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[quote.status] || STATUS_STYLES.new}`}
                    >
                      {STATUS_LABELS[quote.status] || quote.status}
                    </span>

                    <svg
                      className={`w-4 h-4 text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-zinc-800/50">
                      {/* Line items */}
                      <div className="space-y-1.5 mb-4">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-zinc-400">
                              {item.label || item.product} x {item.qty}
                              {item.discount > 0 && (
                                <span className="text-emerald-500 ml-1.5 text-xs">
                                  -{Math.round(item.discount * 100)}%
                                </span>
                              )}
                            </span>
                            <span className="text-white font-medium">
                              Rs {Math.round(item.line_total).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Impact */}
                      <div className="flex flex-wrap gap-4 text-xs text-zinc-500 mb-4 py-3 border-t border-zinc-800/50">
                        <span>~{quote.estimated_timeline} days</span>
                        {quote.seeds > 0 && <span>🌱 {quote.seeds} plants</span>}
                        {quote.co2_saved > 0 && <span>☁️ {quote.co2_saved} kg CO&#8322;</span>}
                        {quote.paper_grams > 0 && (
                          <span>📦 {(quote.paper_grams / 1000).toFixed(1)} kg recycled</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-3">
                        {(quote.status === 'draft' || quote.status === 'new') && (
                          <button
                            onClick={() => navigate(`/quote?id=${quote.id}`)}
                            className="flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors bg-zinc-800 px-4 py-2.5 rounded-lg border border-zinc-700"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadPDF(quote)}
                          className="flex items-center gap-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 px-4 py-2.5 rounded-lg border border-emerald-500/20"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download PDF
                        </button>
                        {deleteConfirmId === quote.id ? (
                          <span className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeleteQuote(quote.id!)}
                              className="text-xs font-medium text-red-400 hover:text-red-300"
                            >
                              Confirm delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-xs text-zinc-500 hover:text-zinc-400"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(quote.id!)}
                            className="text-xs font-medium text-zinc-500 hover:text-red-400 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                        <span className="text-[10px] text-zinc-600">
                          #{quote.id?.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
