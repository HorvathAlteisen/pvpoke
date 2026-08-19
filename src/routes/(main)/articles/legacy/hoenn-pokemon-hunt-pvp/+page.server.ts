import type { PageServerLoad } from './$types';

/**
 * articles/legacy/hoenn-pokemon-hunt-pvp.php — this legacy article `require_once`s a non-existent
 * `../header.php` in PHP (the reference site 500s on it); ported with the normal layout.
 */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Hoenn Pokemon to Hunt for PvP',
			description:
				'Which Hoenn Pokemon should you keep an eye out for to use in PvP during the Hoenn event? Take a look at this list to prepare for your Pokemon hunts!',
			ogImage: 'https://pvpoke.com/assets/articles/hoenn-og.jpg'
		}
	};
};
