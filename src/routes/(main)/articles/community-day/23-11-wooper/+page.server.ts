import type { PageServerLoad } from './$types';

/** articles/community-day/23-11-wooper.php */
export const load: PageServerLoad = () => {
	return {
		meta: {
			title: 'Wooper Community Day Guide for PvP',
			description:
				"The time has come to acquire the Sire! Clodsire makes its debut and Quagsire gets Aqua Tail in this exciting Community Day for PvP. What should you know about each Pokemon's PvP potential?",
			ogImage: 'https://pvpoke.com/articles/article-assets/community-day/23-11-wooper/og.jpg'
		}
	};
};
