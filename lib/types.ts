export type QuoteStatus = 'draft' | 'new' | 'in_progress' | 'completed' | 'cancelled';

export interface QuoteLineItem {
  product: string;
  label: string;
  qty: number;
  unit_price: number;
  line_total: number;
  discount: number;
}

export interface QuoteSubmission {
  id?: string;
  created_at?: string;

  /* Linked user */
  user_id?: string;

  /* Customer info */
  contact_name: string;
  company_name: string;
  email: string;
  phone: string;
  message: string;

  /* Order details */
  market: 'Mauritius' | 'Export';
  line_items: QuoteLineItem[];
  total: number;
  estimated_timeline: number;

  /* Impact */
  seeds: number;
  paper_grams: number;
  co2_saved: number;

  /* Admin */
  status: QuoteStatus;
  admin_notes?: string;

  /* Optional */
  category?: string;
  tags?: string[];
}
