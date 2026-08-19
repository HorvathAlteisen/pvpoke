import type { PageServerLoad } from './$types';

/** data/overrideEditor.php (developer tool) — only $META_TITLE is set. */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Override Editor'
		}
	};
};
