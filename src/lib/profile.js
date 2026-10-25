import { request } from './api.js';
import { SITE } from './config.js';
import { useAsync } from './hooks.js';

// Loads the school profile (about/vision/mission/contact) saved by a super admin.
// Contact fields fall back to the build-time VITE_SITE_* values until a profile is saved.
export function useProfile() {
  const state = useAsync(() => request('/profile'), []);
  const d = state.data || {};
  return {
    ...state,
    profile: {
      about_us: d.about_us || '',
      vision: d.vision || '',
      mission: d.mission || '',
      address: d.address || SITE.address,
      phone: d.phone || SITE.phone,
      email: d.email || SITE.email,
    },
  };
}
