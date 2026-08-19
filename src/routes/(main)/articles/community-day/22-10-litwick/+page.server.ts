import type { PageServerLoad } from './$types';

/** community-day/22-10-litwick.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: "Litwick Community Day Guide for PvP",
			description: "Will Litwick be able to haunt its way into PvP this Community Day? Let's shed some light on how Chandelure performs in PvP!",
			ogImage: "https://pvpoke.com/articles/article-assets/community-day/22-10-litwick/og.jpg"
		}
	};
};
