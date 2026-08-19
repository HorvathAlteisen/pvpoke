import type { PageServerLoad } from './$types';

/** rss/feedEditor.php (developer tool) — only $META_TITLE is set. */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'RSS Feed'
		}
	};
};
