import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/cn';
import type { QuoteSubmission, QuoteStatus } from '../lib/types';
import { format } from 'date-fns';
import {
  LogOut,
  Download,
  RefreshCw,
  ChevronDown,
  Search,
  FileText,
  TrendingUp,
  Leaf,
  Package,
  X,
  UserPlus,
} from 'lucide-react';

const STATUS_CONFIG: Record<QuoteStatus, { label: string; color: string; bg: string }> = {
  new: { label: 'New', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  in_progress: { label: 'In Progress', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  completed: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  cancelled: { label: 'Cancelled', color: 'text-zinc-400', bg: 'bg-zinc-500/10 border-zinc-500/20' },
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<QuoteSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<QuoteStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<QuoteSubmission | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteError, setInviteError] = useState('');

  const fetchQuotes = async () => {
    setRefreshing(true);
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setQuotes(data as QuoteSubmission[]);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchQuotes();

    const channel = supabase
      .channel('quotes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, () => {
        fetchQuotes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  };

  const updateStatus = async (id: string, status: QuoteStatus) => {
    await supabase.from('quotes').update({ status }).eq('id', id);
    fetchQuotes();
    if (selectedQuote?.id === id) {
      setSelectedQuote((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const updateNotes = async (id: string, notes: string) => {
    await supabase.from('quotes').update({ admin_notes: notes }).eq('id', id);
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviteMessage('');
    if (!inviteEmail.trim()) {
      setInviteError('Enter an email address.');
      return;
    }
    setInviteLoading(true);
    const { data, error } = await supabase.functions.invoke('invite-user', {
      body: {
        email: inviteEmail.trim(),
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      setInviteError(error.message || 'Failed to send invite');
      setInviteLoading(false);
      return;
    }
    if (data?.error) {
      setInviteError(data.error);
      setInviteLoading(false);
      return;
    }
    setInviteMessage(`Invite sent to ${inviteEmail.trim()}. They will receive an email to sign up.`);
    setInviteEmail('');
    setInviteLoading(false);
  };

  const filteredQuotes = useMemo(() => {
    let result = quotes;
    if (filter !== 'all') {
      result = result.filter((q) => q.status === filter);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (q) =>
          q.contact_name?.toLowerCase().includes(s) ||
          q.company_name?.toLowerCase().includes(s) ||
          q.email?.toLowerCase().includes(s)
      );
    }
    return result;
  }, [quotes, filter, search]);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = quotes.filter(
      (q) => q.created_at && new Date(q.created_at).getMonth() === now.getMonth()
    );
    return {
      total: quotes.length,
      thisMonth: thisMonth.length,
      revenue: quotes
        .filter((q) => q.status !== 'cancelled')
        .reduce((sum, q) => sum + (q.total || 0), 0),
      newCount: quotes.filter((q) => q.status === 'new').length,
    };
  }, [quotes]);

  const exportCSV = () => {
    const headers = [
      'Date',
      'Name',
      'Company',
      'Email',
      'Phone',
      'Market',
      'Items',
      'Total (Rs)',
      'Status',
      'Timeline (days)',
      'Seeds',
      'CO2 Saved (kg)',
      'Message',
    ];
    const rows = filteredQuotes.map((q) => [
      q.created_at ? format(new Date(q.created_at), 'yyyy-MM-dd HH:mm') : '',
      q.contact_name,
      q.company_name,
      q.email,
      q.phone,
      q.market,
      (q.line_items || []).map((li) => `${li.label} x${li.qty}`).join('; '),
      q.total,
      q.status,
      q.estimated_timeline,
      q.seeds,
      q.co2_saved,
      q.message,
    ]);

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `morivert-quotes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-base font-medium tracking-tight text-white">MORIVERT</span>
            <span className="text-xs text-zinc-600 hidden sm:block">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchQuotes}
              disabled={refreshing}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Invite user — first thing on the page */}
        <section
          aria-label="Invite user"
          className="mb-8 p-6 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <UserPlus className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Invite user</h2>
              <p className="text-xs text-zinc-400">
                Send an invite to someone who doesn&apos;t have an account. They&apos;ll get an email to sign up.
              </p>
            </div>
          </div>
          <form onSubmit={handleInviteUser} className="flex flex-wrap items-end gap-3 mt-4">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="invite-email" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={inviteLoading}
              className="px-5 py-2.5 bg-emerald-500 text-black text-sm font-semibold rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-colors"
            >
              {inviteLoading ? 'Sending...' : 'Send invite'}
            </button>
          </form>
          {inviteError && <p className="mt-3 text-sm text-red-400">{inviteError}</p>}
          {inviteMessage && <p className="mt-3 text-sm text-emerald-400">{inviteMessage}</p>}
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<FileText className="w-5 h-5" />} label="Total Quotes" value={stats.total} />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="This Month" value={stats.thisMonth} />
          <StatCard
            icon={<Package className="w-5 h-5" />}
            label="Revenue Pipeline"
            value={`Rs ${stats.revenue.toLocaleString()}`}
          />
          <StatCard
            icon={<Leaf className="w-5 h-5" />}
            label="Awaiting Action"
            value={stats.newCount}
            highlight={stats.newCount > 0}
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company, or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as QuoteStatus | 'all')}
                className="appearance-none bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-300 pl-4 pr-10 py-2.5 outline-none focus:border-zinc-600 cursor-pointer"
              >
                <option value="all">All statuses</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Quotes Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">
              {quotes.length === 0 ? 'No quotes received yet.' : 'No quotes match your filters.'}
            </p>
          </div>
        ) : (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Contact</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Company</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Items</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Total</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {filteredQuotes.map((q) => (
                    <tr
                      key={q.id}
                      onClick={() => setSelectedQuote(q)}
                      className="hover:bg-zinc-800/30 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                        {q.created_at ? format(new Date(q.created_at), 'MMM d, HH:mm') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">{q.contact_name}</div>
                        <div className="text-zinc-500 text-xs">{q.email}</div>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">{q.company_name || '—'}</td>
                      <td className="px-4 py-3 text-zinc-400">
                        {(q.line_items || []).length} item{(q.line_items || []).length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3 text-right text-white font-medium whitespace-nowrap">
                        Rs {(q.total || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={q.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Detail Drawer */}
      {selectedQuote && (
        <QuoteDrawer
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
          onStatusChange={(status) => updateStatus(selectedQuote.id!, status)}
          onNotesChange={(notes) => updateNotes(selectedQuote.id!, notes)}
        />
      )}
    </div>
  );
};

/* ── Sub-components ─────────────────────────────────────── */

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
}> = ({ icon, label, value, highlight }) => (
  <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
    <div className={cn('mb-3', highlight ? 'text-emerald-400' : 'text-zinc-500')}>{icon}</div>
    <div className="text-2xl font-light text-white tracking-tight">{value}</div>
    <div className="text-xs text-zinc-500 mt-1">{label}</div>
  </div>
);

const StatusBadge: React.FC<{ status: QuoteStatus }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border',
        config.bg,
        config.color
      )}
    >
      {config.label}
    </span>
  );
};

const QuoteDrawer: React.FC<{
  quote: QuoteSubmission;
  onClose: () => void;
  onStatusChange: (status: QuoteStatus) => void;
  onNotesChange: (notes: string) => void;
}> = ({ quote, onClose, onStatusChange, onNotesChange }) => {
  const [notes, setNotes] = useState(quote.admin_notes || '');

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-[#0a0a0b] border-l border-zinc-800 z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-lg font-medium text-white">{quote.contact_name}</h2>
              <p className="text-sm text-zinc-500">{quote.company_name}</p>
              {quote.created_at && (
                <p className="text-xs text-zinc-600 mt-1">
                  {format(new Date(quote.created_at), 'MMMM d, yyyy · HH:mm')}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contact */}
          <Section title="Contact">
            <InfoRow label="Email" value={quote.email} />
            <InfoRow label="Phone" value={quote.phone} />
            <InfoRow label="Market" value={quote.market} />
          </Section>

          {/* Line Items */}
          <Section title="Order">
            <div className="space-y-2">
              {(quote.line_items || []).map((li, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-zinc-300">
                    {li.label} × {li.qty}
                  </span>
                  <span className="text-white font-medium">Rs {li.line_total.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm mt-4 pt-4 border-t border-zinc-800">
              <span className="text-zinc-500">Total</span>
              <span className="text-xl font-light text-white">Rs {(quote.total || 0).toLocaleString()}</span>
            </div>
          </Section>

          {/* Impact */}
          <Section title="Impact">
            <div className="grid grid-cols-3 gap-3">
              <MiniStat label="Seeds" value={quote.seeds} />
              <MiniStat label="CO₂ saved" value={`${quote.co2_saved} kg`} />
              <MiniStat label="Recycled" value={`${((quote.paper_grams || 0) / 1000).toFixed(1)} kg`} />
            </div>
          </Section>

          {/* Message */}
          {quote.message && (
            <Section title="Message">
              <p className="text-sm text-zinc-300 leading-relaxed">{quote.message}</p>
            </Section>
          )}

          {/* Status */}
          <Section title="Status">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS_CONFIG) as QuoteStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(s)}
                  className={cn(
                    'px-3 py-2 rounded-xl text-xs font-medium border transition-colors',
                    quote.status === s
                      ? STATUS_CONFIG[s].bg + ' ' + STATUS_CONFIG[s].color
                      : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                  )}
                >
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </Section>

          {/* Notes */}
          <Section title="Internal Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => onNotesChange(notes)}
              rows={4}
              placeholder="Add internal notes..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-600 resize-none"
            />
          </Section>
        </div>
      </div>
    </>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-4">{title}</h3>
    {children}
  </div>
);

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between text-sm py-1.5">
    <span className="text-zinc-500">{label}</span>
    <span className="text-zinc-200">{value || '—'}</span>
  </div>
);

const MiniStat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="p-3 bg-zinc-900 rounded-xl text-center">
    <div className="text-base font-light text-white">{value}</div>
    <div className="text-[9px] uppercase tracking-widest text-zinc-600 mt-1">{label}</div>
  </div>
);
