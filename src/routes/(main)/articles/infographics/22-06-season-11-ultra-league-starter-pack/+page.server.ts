import type { PageServerLoad } from './$types';

/** articles/infographics/22-06-season-11-ultra-league-starter-pack.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Ultra League Starter Pack for Season 11',
			description:
				'Check out the premiere and budget picks to get started in Ultra League for GO Battle League Season 11!',
			ogImage:
				'https://pvpoke.com/articles/article-assets/infographics/22-06-season-11-ultra-league-starter-pack/og.jpg'
		}
	};
};
