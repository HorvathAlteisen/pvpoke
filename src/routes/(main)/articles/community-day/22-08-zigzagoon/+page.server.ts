import type { PageServerLoad } from './$types';

/** community-day/22-08-zigzagoon.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: "Galarian Zigzagoon Community Day Guide for PvP",
			description: "Obstagoon is already a top tier Pokemon for PvP! Will Obstruct elevate it even further?",
			ogImage: "https://pvpoke.com/articles/article-assets/community-day/22-08-zigzagoon/og.jpg"
		}
	};
};
