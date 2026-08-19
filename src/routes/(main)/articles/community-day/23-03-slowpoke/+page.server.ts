import type { PageServerLoad } from './$types';

/** community-day/23-03-slowpoke.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: "Slowpoke Community Day Guide for PvP",
			description: "Not so fast! Slowpoke Community Day is around the corner. Find out how Surf will impact the whole Slow family in PvP and IV's to look for.",
			ogImage: "https://pvpoke.com/articles/article-assets/community-day/23-03-slowpoke/og.jpg"
		}
	};
};
