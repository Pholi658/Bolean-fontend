export type AppScreen = "login" | "reg1" | "reg2" | "consumer" | "lender";
export type ConsumerTab = "home" | "sessions" | "inbox" | "profile" | "session-detail";
export type LenderSection = "dashboard" | "search" | "create-session" | "profile-view" | "session-detail";
export type SessionFilter = "ALL" | "ACTIVE" | "OVERDUE" | "LATE" | "COMPLETED" | "DEFAULTED" | "UNCONFIRMED" | "DISPUTED";

export type SessionStatus =
  | "PENDING"
  | "ACTIVE"
  | "OVERDUE"
  | "COMPLETED"
  | "LATE"
  | "DEFAULTED"
  | "DISPUTED"
  | "DECLINED"
  | "UNCONFIRMED";

export type PlausibilityRating = "HIGH" | "MEDIUM" | "LOW";

export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName?: string;
}

export interface Dispute {
  issue: string;
  filedAt: string;
  plausibility: PlausibilityRating;
}

export interface Session {
  id: string;
  borrowerName: string;
  borrowerPhone: string;
  lenderName?: string;
  amount: number;
  dueDate: string;
  status: SessionStatus;
  description: string;
  transactionType: string;
  createdAt: string;
  daysRemaining?: number;
  review?: Review;
  dispute?: Dispute;
}

export interface SearchUser {
  id: string;
  name: string;
  phone: string;
  isVerified: boolean;
  avgRating: number;
  totalSessions: number;
  completedSessions: number;
  defaultedSessions: number;
  lateSessions: number;
  memberSince: string;
  reviews?: Review[];
  sessions?: Session[];
}

export interface InboxItem {
  id: string;
  type: "session_offer" | "profile_request";
  from: string;
  fromPhone: string;
  amount?: number;
  dueDate?: string;
  description?: string;
  transactionType?: string;
  createdAt: string;
  status: "pending" | "accepted" | "declined";
}

export interface AppNotification {
  id: string;
  type: "session_offer" | "profile_request" | "status_update" | "review" | "upcoming_due";
  message: string;
  time: string;
  read: boolean;
}

export interface LenderStats {
  issuedTotal: number;
  activeAmount: number;
  lateCount: number;
  unconfirmedCount: number;
  totalDistributed: number;
}

export interface CurrentUser {
  name: string;
  phone: string;
  email: string;
  whatsapp: string;
  isVerified: boolean;
  memberSince: string;
  avgRating: number;
  totalCompleted: number;
}
