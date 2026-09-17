export type UserRole = 'founder' | 'admin' | 'moderator' | 'user' | 'banned';

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor?: string;
  isSpecial?: boolean;
}

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  role: UserRole;
  badges: string[];
  customBadges?: UserBadge[];
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified?: boolean;
  registrationOrder?: number;
  joinedAt: string;
  isBanned?: boolean;
  isMuted?: boolean;
  muteUntil?: string;
  themePreference?: 'dark' | 'synthwave' | 'emerald' | 'amber' | 'slate';
  audioPreferences?: {
    masterVolume: number;
    bgmEnabled: boolean;
    sfxEnabled: boolean;
  };
}

export interface Post {
  id: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarUrl?: string;
  authorRole: UserRole;
  authorBadges: string[];
  content: string;
  mediaUrls?: string[];
  mediaType?: 'image' | 'video' | 'audio' | 'none';
  audioTrackUrl?: string;
  audioTrackTitle?: string;
  tags?: string[];
  upvotes: string[];
  downvotes: string[];
  score: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  updatedAt?: string;
  isPinned?: boolean;
  isAnnouncement?: boolean;
  flagged?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarUrl?: string;
  authorRole: UserRole;
  authorBadges: string[];
  content: string;
  createdAt: string;
  upvotes: string[];
}

export interface DirectMessage {
  id: string;
  senderId: string;
  recipientId: string;
  senderUsername: string;
  senderDisplayName: string;
  senderAvatarUrl?: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface ModerationReport {
  id: string;
  targetType: 'post' | 'comment' | 'user' | 'message';
  targetId: string;
  targetContent?: string;
  targetAuthorUsername?: string;
  reporterId: string;
  reporterUsername: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  actionTaken?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SupportTicket {
  id: string;
  senderEmail: string;
  senderUsername?: string;
  isUsernameVerified?: boolean;
  category: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  subject: string;
  message: string;
  status: 'New' | 'Awaiting User' | 'In Progress' | 'Resolved' | 'Closed';
  assignedStaff?: string;
  internalNotes?: {
    id: string;
    authorUsername: string;
    authorRole: string;
    content: string;
    timestamp: string;
  }[];
  history: {
    id: string;
    senderType: 'user_submission' | 'staff_reply';
    senderName: string;
    senderEmail: string;
    staffMemberUsername?: string;
    staffMemberRole?: string;
    category: string;
    subject: string;
    message: string;
    timestamp: string;
    deliveryStatus?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportAuditLog {
  id: string;
  ticketId: string;
  staffUsername: string;
  staffRole: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface CommunityAnnouncement {
  id: string;
  title: string;
  content: string;
  authorUsername: string;
  authorRole: UserRole;
  priority: 'normal' | 'important' | 'urgent';
  createdAt: string;
  expiresAt?: string;
  active: boolean;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  senderId?: string;
  senderUsername?: string;
  senderAvatarUrl?: string;
  type: 'upvote' | 'comment' | 'mention' | 'badge_granted' | 'system' | 'message';
  title: string;
  body: string;
  targetUrl?: string;
  read: boolean;
  createdAt: string;
}
