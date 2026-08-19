import type { PageServerLoad } from './$types';

/** articles/infographics/24-08-shared-skies-great-league-starter-pack.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Great League Starter Pack for Season of Shared Skies',
			description:
				'Check out the premiere and budget picks to get started in Great League and GO Battle League for Season of Shared Skies!',
			ogImage:
				'https://pvpoke.com/articles/article-assets/infographics/24-08-shared-skies-great-league-starter-pack/og.jpg'
		}
	};
};
