import type { PageServerLoad } from './$types';

/** articles/infographics/22-05-season-11-great-league-starter-pack.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Great League Starter Pack for Season 11',
			description:
				'Check out the premiere and budget picks to get started in Great League for GO Battle League Season 11!',
			ogImage:
				'https://pvpoke.com/articles/article-assets/infographics/22-05-season-11-great-league-starter-pack/og.jpg'
		}
	};
};
