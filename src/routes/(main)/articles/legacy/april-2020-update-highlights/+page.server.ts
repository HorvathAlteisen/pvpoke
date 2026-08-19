import type { PageServerLoad } from './$types';

/**
 * articles/legacy/april-2020-update-highlights.php — this legacy article `require_once`s a
 * non-existent `../header.php` in PHP (the reference site 500s on it); ported with the normal layout.
 */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Highlights of the April 2020 Update',
			description: 'Wild new moves and effects are changing Trainer Battles in unbelievable ways!',
			ogImage: 'https://pvpoke.com/assets/articles/2019-update-header.jpg'
		}
	};
};
