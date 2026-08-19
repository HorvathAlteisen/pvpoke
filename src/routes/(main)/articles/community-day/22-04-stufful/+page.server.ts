import type { PageServerLoad } from './$types';

/** community-day/22-04-stufful.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: "Stufful Community Day Guide for PvP",
			description: "Learn about the brand new Pokemon Stufful, and how its evolution may perform in PvP!",
			ogImage: "https://pvpoke.com/articles/article-assets/community-day/22-04-stufful/og.jpg"
		}
	};
};
