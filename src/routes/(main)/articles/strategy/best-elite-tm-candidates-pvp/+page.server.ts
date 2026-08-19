import type { PageServerLoad } from './$types';

/** articles/strategy/best-elite-tm-candidates-pvp.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Best Elite TM Candidates for PvP',
			description:
				"Elite TM's are now available! Which exclusive moves and Pokemon are the best for your PvP team?",
			ogImage: 'https://pvpoke.com/articles/article-assets/best-elite-tm-candidates-pvp/og.jpg'
		}
	};
};
