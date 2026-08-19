import type { PageServerLoad } from './$types';

/** community-day/22-11-teddiursa.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: "Teddiursa Community Day Guide for PvP",
			description: "Ursaluna will be making its debut in Pokemon GO! How does it stand up to the meta and is this bear a necessity for PvP?",
			ogImage: "https://pvpoke.com/articles/article-assets/community-day/22-11-teddiursa/og.jpg"
		}
	};
};
