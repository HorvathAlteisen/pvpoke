import type { PageMeta } from '$lib/site';

/** pokedex.php's $CANONICAL / $META_TITLE / $META_DESCRIPTION, shared by both routes. */
export const pokedexMeta: PageMeta = {
	canonical: '/pokedex/',
	title: 'Pokedex',
	description: 'Explore Pokemon stats for Pokemon GO PvP.'
};
