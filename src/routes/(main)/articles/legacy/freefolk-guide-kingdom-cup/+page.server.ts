import type { PageServerLoad } from './$types';

/**
 * articles/legacy/freefolk-guide-kingdom-cup.php — this legacy article `require_once`s a
 * non-existent `../header.php` in PHP (the reference site 500s on it); ported with the normal layout.
 */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: "The Freefolk's Guide to Kingdom Cup",
			description:
				'How do you make do without Bastiodon and Lucario? This guide explores your options to help you build a competitive Kingdom Cup team.',
			ogImage: 'https://pvpoke.com/assets/articles/kingdom-og.jpg'
		}
	};
};
