import type { PageServerLoad } from './$types';

/** articles/infographics/22-07-shadow-pokemon-pvp.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Best Shadow Pokemon to TM for PvP',
			description:
				'When a Team Rocket event arrives, which Shadow Pokemon should you prepare for trouble? Check out the top Shadow Pokemon in each league!',
			ogImage: 'https://pvpoke.com/articles/article-assets/infographics/22-07-shadow-pokemon-pvp/og.jpg'
		}
	};
};
