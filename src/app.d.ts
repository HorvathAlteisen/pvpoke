// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Settings } from '$lib/settings';
import type { PageMeta, PvpokeLayoutData } from '$lib/site';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** header.php `$_SETTINGS`, parsed once per request in hooks.server.ts */
			settings: Settings;
			/** header.php `$performGroupMigration` (true when the `migrate` cookie was absent) */
			performGroupMigration: boolean;
		}
		/**
		 * `page.data` everywhere: the root layout data plus the optional `meta` a page's
		 * `+page.server.ts` returns (header.php's $META_TITLE / $META_DESCRIPTION / $CANONICAL / $OG_IMAGE).
		 */
		interface PageData extends PvpokeLayoutData {
			meta?: PageMeta;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

// Legacy presentational attributes the PHP markup uses (kept verbatim for fidelity) that
// svelte-check does not know about.
declare module 'svelte/elements' {
	interface HTMLAttributes<T> {
		valign?: string | undefined | null;
		align?: string | undefined | null;
		/** `<a name="news">` anchors */
		name?: string | undefined | null;
	}
}
