export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  status: "active" | "inactive";
  createdAt: string;
  qrCodesCount: number;
  postsCount: number;
}

export interface QRToken {
  token: string;
  status: "activated" | "generated" | "revoked";
  batch: string;
  createdAt: string;
  activatedAt: string | null;
  revokedAt: string | null;
  userId: number | null;
  userName: string | null;
  linkedObject: string | null;
}

export interface Post {
  id: number;
  title: string;
  type: "lost" | "found";
  description: string;
  location: string;
  date: string;
  status: "pending" | "published" | "hidden";
  authorId: number;
  authorName: string;
  image: string | null;
  views: number;
  contacts: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: number;
  type: "scan" | "contact" | "activation" | "generation" | "revocation";
  token: string | null;
  user: string;
  timestamp: string;
  source: "Mobile Web" | "WhatsApp" | "Admin" | "API";
  metadata?: {
    location?: string;
    postId?: number;
  };
}

export interface Activity {
  id: number;
  icon: string;
  text: string;
  timestamp: string;
  type: "scan" | "user" | "post" | "contact";
}

export interface DashboardStats {
  qrGenerated: { value: number; change: number };
  qrActivated: { value: number; change: number };
  scans: { value: number; change: number };
  contacts: { value: number; change: number };
  postsLost: { value: number; change: number };
  postsFound: { value: number; change: number };
  newUsers: { value: number; change: number };
}

export interface StickerOrder {
  id: string;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  quantity: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  deliveryAddress: string;
  deliveryCity: string;
  deliveryNotes: string | null;
  createdAt: string;
  updatedAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  trackingNumber: string | null;
}

export interface Notification {
  id: number;
  type: "order" | "user" | "post" | "qr" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link: string | null;
  meta?: {
    userId?: number;
    orderId?: string;
    postId?: number;
    token?: string;
  };
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "super_admin" | "admin" | "moderator";
  status: "active" | "inactive";
  createdAt: string;
  lastLogin: string | null;
}
