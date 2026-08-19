import type { PageServerLoad } from './$types';

/**
 * articles/legacy/early-2019-update-highlights.php — this legacy article `require_once`s a
 * non-existent `../header.php` in PHP (the reference site 500s on it); ported with the normal layout.
 */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Highlights of the Early 2019 Updates',
			description:
				'Trainer Battles have shifted with the latest balance update and stat-boosting moves! Check out what you should keep an eye on.',
			ogImage: 'https://pvpoke.com/assets/articles/2019-update-header.jpg'
		}
	};
};
