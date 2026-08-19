import type { PageServerLoad } from './$types';

/** articles/infographics/23-01-season-of-mythical-wishes-starter-packs.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'PvP Starter Packs for Season of Mythical Wishes',
			description:
				'Check out the premiere and budget picks to get started in Great League, Ultra League, and Master League for GO Battle League in the Season of Mythical Wishes!',
			ogImage:
				'https://pvpoke.com/articles/article-assets/infographics/23-01-season-of-mythical-wishes-starter-packs/og.jpg'
		}
	};
};
