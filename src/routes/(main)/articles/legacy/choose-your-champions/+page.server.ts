import type { PageServerLoad } from './$types';

/**
 * articles/legacy/choose-your-champions.php — this legacy article `require_once`s a non-existent
 * `../header.php` in PHP (the reference site 500s on it); ported with the normal layout.
 */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Choose Your Champions',
			description:
				'A guide to the powerful restricted Pokemon and alternatives for the Season 1 Championships.',
			ogImage: 'https://pvpoke.com/assets/articles/championships-infographic.jpg'
		}
	};
};
