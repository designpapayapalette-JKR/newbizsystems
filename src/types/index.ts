export type Role = "owner" | "admin" | "member";

export type LeadStatus = "active" | "archived";

export type ActivityType =
  | "call"
  | "email"
  | "whatsapp"
  | "sms"
  | "note"
  | "meeting"
  | "task";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "partial"
  | "overdue"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "partial"
  | "overdue"
  | "refunded"
  | "failed";

export type PaymentMethod =
  | "phonepe"
  | "bank_transfer"
  | "cash"
  | "cheque"
  | "upi"
  | "other";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  currency: string;
  timezone: string;
  plan: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  current_org_id: string | null;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: Role;
  joined_at: string;
  profile?: Profile;
}

export interface PipelineStage {
  id: string;
  organization_id: string;
  name: string;
  color: string;
  position: number;
  is_default: boolean;
  is_won: boolean;
  is_lost: boolean;
}

export interface Lead {
  id: string;
  organization_id: string;
  stage_id: string | null;
  assigned_to: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string | null;
  deal_value: number | null;
  currency: string;
  next_followup_at: string | null;
  last_activity_at: string | null;
  position: number;
  notes: string | null;
  priority: "hot" | "warm" | "cold" | null;
  title?: string | null;
  win_reason?: string | null;
  loss_reason?: string | null;
  close_date?: string | null;
  probability?: number;
  gdpr_consent?: boolean;
  gdpr_consent_at?: string | null;
  is_archived: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  tags?: string[];
  stage?: PipelineStage;
  assigned_profile?: Profile;
}

export interface Activity {
  id: string;
  organization_id: string;
  lead_id: string;
  user_id: string | null;
  type: ActivityType;
  title: string | null;
  body: string | null;
  outcome: string | null;
  duration_mins: number | null;
  occurred_at: string;
  created_at: string;
  user_profile?: Profile;
}

export interface Reminder {
  id: string;
  organization_id: string;
  lead_id: string | null;
  user_id: string;
  title: string;
  description: string | null;
  due_at: string;
  is_completed: boolean;
  completed_at: string | null;
  notified_at: string | null;
  created_at: string;
  lead?: Lead;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  position: number;
}

export interface Invoice {
  id: string;
  organization_id: string;
  lead_id: string | null;
  invoice_number: string;
  title: string | null;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  subtotal: number;
  discount: number;
  tax_percent: number;
  tax_amount: number;
  total: number;
  currency: string;
  notes: string | null;
  terms: string | null;
  pdf_url: string | null;
  sent_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  line_items?: InvoiceLineItem[];
  lead?: Lead;
}

export interface Payment {
  id: string;
  organization_id: string;
  lead_id: string | null;
  invoice_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: PaymentMethod | null;
  reference_number: string | null;
  phonepe_order_id: string | null;
  phonepe_txn_id: string | null;
  payment_url: string | null;
  due_date: string | null;
  paid_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  lead?: Lead;
  invoice?: Invoice;
}

export interface OrgInvite {
  id: string;
  organization_id: string;
  email: string;
  role: Role;
  token: string;
  invited_by: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface DashboardStats {
  totalLeads: number;
  activeLeads: number;
  pipelineValue: number;
  paymentsDueThisMonth: number;
  overduePayments: number;
  overdueInvoices: number;
  leadsByStage: { stage: string; count: number; color: string }[];
}

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface Ticket {
  id: string;
  organization_id: string;
  ticket_number: string;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  lead_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  resolved_at: string | null;
  sla_due_at: string | null;
  created_at: string;
  updated_at: string;
  lead?: Lead;
  assigned_profile?: Profile;
  comments?: TicketComment[];
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  user_id: string | null;
  body: string;
  is_internal: boolean;
  created_at: string;
  user_profile?: Profile;
}

export interface EmailTemplate {
  id: string;
  organization_id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  unit_price: number;
  currency: string;
  category: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface KbArticle {
  id: string;
  organization_id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Webhook {
  id: string;
  organization_id: string;
  name: string;
  url: string;
  events: string[];
  secret: string | null;
  is_active: boolean;
  last_triggered: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

export interface LeadForm {
  id: string;
  organization_id: string;
  name: string;
  fields: string[];
  stage_id: string | null;
  default_source: string;
  is_active: boolean;
  submissions: number;
  created_at: string;
}
