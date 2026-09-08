// Types mirror the FastAPI backend's actual response shapes (Flagger_app),
// not the old mock data model in legacy/lib/types.ts.

export type TransactionType = "cash_loan" | "goods_on_credit" | "service_on_credit" | "deposit_to";

export type SessionStatus =
  | "PENDING"
  | "ACTIVE"
  | "UNCONFIRMED"
  | "OVERDUE"
  | "COMPLETED"
  | "LATE"
  | "DEFAULTED"
  | "DISPUTED"
  | "DECLINED";

export type DisputeStatus = "PENDING" | "PUBLISHED" | "REJECTED";
export type PlausibilityRating = "HIGH" | "MEDIUM" | "LOW";
export type PermissionStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
export type NotificationType =
  | "upcoming_due"
  | "session_offer"
  | "profile_request"
  | "status_update"
  | "review";

export interface UserResponse {
  id: string;
  full_name: string;
  phone_number: string;
  whatsapp_number: string | null;
  email: string;
  created_at: string;
  is_verified: boolean;
  is_biometrically_verified: boolean;
}

export interface SessionResponse {
  id: string;
  lender_id: string;
  borrower_id: string;
  transaction_type: TransactionType;
  status: SessionStatus;
  created_at: string;
  approved_at: string | null;
  due_date: string;
  amount: number;
  description: string | null;
}

export interface LenderSessionItem {
  id: string;
  borrowerName: string;
  borrowerPhone: string;
  amount: number;
  transactionType: TransactionType;
  dueDate: string | null;
  daysRemaining: number | null;
  status: SessionStatus;
}

export interface PaginatedLenderSessions {
  items: LenderSessionItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ReviewOut {
  id: string;
  msg: string;
  reviewed_user_id: string;
  reviewer_id: string;
  session_id: string;
  created_at: string;
}

export interface DisputeResponse {
  id: string;
  session_id: string;
  owner_id: string;
  issue: string;
  status: DisputeStatus;
  plausibility: PlausibilityRating | null;
  created_at: string;
  published_at: string | null;
}

export interface SessionDetailResponse {
  id: string;
  lender_id: string;
  borrower_id: string;
  transaction_type: TransactionType;
  amount: number;
  status: SessionStatus;
  due_date: string;
  description: string | null;
  created_at: string;
  approved_at: string | null;
  lender: UserResponse;
  borrower: UserResponse;
  review: ReviewOut | null;
  dispute: DisputeResponse | null;
}

export interface PermissionItem {
  id: string;
  requester_id: string;
  target_id: string;
  status: PermissionStatus;
  requester_name: string;
  requester_phone: string;
}

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  message: string;
  time: string; // pre-formatted by the backend ("2h ago") — not an ISO timestamp
  read: boolean;
}

export interface PaginatedNotifications {
  items: NotificationResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface SessionUrgentItem {
  id: string;
  amount: number;
  due_date: string;
  days_remaining: number;
  lender_id: string;
  status: SessionStatus;
}

export interface ConsumerAnalytics {
  kpis: {
    total_transacted: number;
    outstanding: number;
    sessions_lifetime: number;
    total_completed: number;
  };
  reputation: {
    avg_rating: number;
    total_completed: number;
    member_since: string | null;
  };
  urgent_sessions: SessionUrgentItem[];
  overdue_sessions: SessionUrgentItem[];
}

export interface LenderAnalytics {
  stats: {
    issued_total: number;
    total_distributed: number;
    active_amount: number;
  };
  monthly_collections: Array<{ month: string; collected: number; disbursed: number }>;
}

export interface UserSearchResult {
  users: UserResponse[];
}
