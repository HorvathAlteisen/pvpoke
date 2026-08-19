import type { PageServerLoad } from './$types';

/** articles/infographics/22-05-friend-trade-tier-list.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: "Sh!tty Friend Trade Tier List",
			description:
				"Whether you meet new friends or that one person who doesn't open your gifts, here's a list of PvP trade ideas with low friendship level!",
			ogImage:
				'https://pvpoke.com/articles/article-assets/infographics/22-05-friend-trade-tier-list/og.jpg'
		}
	};
};
