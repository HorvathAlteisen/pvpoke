import type { PageServerLoad } from './$types';

/** community-day/22-02-hoppip.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: "Hoppip Community Day Guide for PvP",
			description: "Learn about Hoppip's upcoming Community Day, how Acrobatics will be relevant for PvP, and which Jumpluff IV's to look out for.",
			ogImage: "https://pvpoke.com/articles/article-assets/community-day/22-02-hoppip/og.jpg"
		}
	};
};
