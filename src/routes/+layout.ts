// Pure server-rendered multi-page site, exactly like the PHP original: no client-side
// SvelteKit runtime, every navigation is a full page load, trailing slashes are left alone
// (the legacy URLs mostly end in "/", but `/rankings` without one must keep working too).
export const csr = false;
export const ssr = true;
export const prerender = false;
export const trailingSlash = 'ignore';
