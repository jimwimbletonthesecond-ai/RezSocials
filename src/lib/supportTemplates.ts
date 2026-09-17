export interface SupportQuickTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  content: string;
}

export const SUPPORT_TEMPLATES: SupportQuickTemplate[] = [
  {
    id: 'badge-req-approved',
    name: 'Badge Request - Approved',
    category: 'Badge Requests',
    subject: 'Update: Your RezSocials Badge Request has been Approved',
    content: `Hello @{{username}},\n\nWe have reviewed your request and verified your eligibility. The requested badge has now been attached to your RezSocials profile.\n\nThank you for being an active contributor to the Rezona community!\n\nBest regards,\nRezSocials Support Team`,
  },
  {
    id: 'badge-req-denied',
    name: 'Badge Request - Needs Verification',
    category: 'Badge Requests',
    subject: 'Update: Additional Info Needed for RezSocials Badge Request',
    content: `Hello @{{username}},\n\nThank you for reaching out regarding your badge request. At this time, we were unable to independently verify the credentials provided.\n\nPlease reply with further verification or link your official Rezona community handles so we can process this for you.\n\nBest regards,\nRezSocials Support Team`,
  },
  {
    id: 'acc-appeal-resolved',
    name: 'Account Appeal - Resolved',
    category: 'Account Appeals',
    subject: 'RezSocials Account Appeal Status: Resolved',
    content: `Hello @{{username}},\n\nOur safety team has completed the secondary review of your account restrictions. Your access has been restored.\n\nPlease ensure future posts comply with our community safety and civility guidelines.\n\nBest regards,\nRezSocials Support Team`,
  },
  {
    id: 'bug-investigating',
    name: 'Bug Report - Under Investigation',
    category: 'Bug Reports',
    subject: 'RezSocials Bug Report: Engineering Notice',
    content: `Hello @{{username}},\n\nThank you for reporting this issue. Our engineering team has logged the bug and is actively working on a resolution.\n\nWe will update you as soon as a patch is deployed.\n\nBest regards,\nRezSocials Support Team`,
  },
  {
    id: 'general-inquiry',
    name: 'General Inquiry - Response',
    category: 'General Support',
    subject: 'Re: Your Inquiry to RezSocials Support',
    content: `Hello @{{username}},\n\nThank you for contacting RezSocials Support. We are pleased to assist you with your inquiry.\n\n[YOUR RESPONSE HERE]\n\nIf you have any further questions, feel free to reply directly to this message.\n\nBest regards,\nRezSocials Support Team`,
  },
];
