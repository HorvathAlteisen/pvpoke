import type { PageServerLoad } from './$types';

/** community-day/22-03-sandshrew.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: "Sandshrew Community Day Guide for PvP",
			description: "Learn about Sandshrew's upcoming Community Day and how both of its Alolan and Kanto families will be relevant for PvP!",
			ogImage: "https://pvpoke.com/articles/article-assets/community-day/22-03-sandshrew/og.jpg"
		}
	};
};
