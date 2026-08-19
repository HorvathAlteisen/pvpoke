import type { PageServerLoad } from './$types';

/** community-day/23-01-chespin.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: "Chespin Community Day Guide for PvP",
			description: "Chesnaught is finally getting Frenzy Plant! Can it find a way to crack into the PvP meta? Check out its meta relevance and PvP IV's to look for.",
			ogImage: "https://pvpoke.com/articles/article-assets/community-day/23-01-chespin/og.jpg"
		}
	};
};
