import type { PageServerLoad } from './$types';

/** articles/infographics/23-10-adventures-abound-great-league-starter-pack.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Great League Starter Pack for Season of Adventures Abound',
			description:
				'Check out the premiere and budget picks to get started in Great League and GO Battle League for Season of Adventures Abound!',
			ogImage:
				'https://pvpoke.com/articles/article-assets/infographics/23-10-adventures-abound-great-league-starter-pack/og.jpg'
		}
	};
};
