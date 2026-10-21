const env = import.meta.env;

export const SITE = {
  name: env.VITE_SITE_NAME || 'Your School Name',
  tagline: env.VITE_SITE_TAGLINE || 'Learning, character and community.',
  address: env.VITE_SITE_ADDRESS || 'Jl. Contoh No. 1, City, Province',
  phone: env.VITE_SITE_PHONE || '+62 000 0000 0000',
  email: env.VITE_SITE_EMAIL || 'info@yourschool.sch.id',
};

export const API_BASE = (env.VITE_API_BASE || '') + '/api';

export const STATUS = {
  pending: 'Pending',
  under_review: 'Under review',
  needs_revision: 'Needs revision',
  accepted: 'Accepted',
  rejected: 'Rejected',
};
export const DOC_TYPES = {
  birth_certificate: 'Birth certificate',
  family_card: 'Family card',
  photo: 'Photo',
  report_card: 'Report card',
  other: 'Other',
};
export const ROLES = {
  user: 'User (parent)',
  news_admin: 'News admin',
  enrollment_admin: 'Enrollment admin',
  super_admin: 'Super admin',
};
export const NEWS_ROLES = ['news_admin', 'super_admin'];
export const ENROLLMENT_ROLES = ['enrollment_admin', 'super_admin'];
export const SUPER_ROLES = ['super_admin'];
