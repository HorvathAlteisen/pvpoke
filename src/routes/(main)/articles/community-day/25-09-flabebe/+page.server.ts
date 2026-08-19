import type { PageServerLoad } from './$types';

/** articles/community-day/25-09-flabebe.php */
export const load: PageServerLoad = () => {
	return {
		meta: {
			title: 'Flabébé Community Day Guide for PvP',
			description:
				"Florges is a Fairy type with fairly hype prospects for PvP. How will Chilling Water improve it in all three leagues? Let's find out more about the upcoming flowery Community Day!",
			ogImage: 'https://pvpoke.com/articles/article-assets/community-day/25-09-flabebe/og.jpg'
		}
	};
};
