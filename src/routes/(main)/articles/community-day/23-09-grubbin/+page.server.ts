import type { PageServerLoad } from './$types';

/** articles/community-day/23-09-grubbin.php */
export const load: PageServerLoad = () => {
	return {
		meta: {
			title: 'Grubbin Community Day Guide for PvP',
			description:
				'Both Charjabug and Vikavolt are getting the exlusive treatment this Community Day! How will they fare in PvP with Volt Switch? Time to dig into the details and check the ins and outs of these Bug-type Pokemon!',
			ogImage: 'https://pvpoke.com/articles/article-assets/community-day/23-09-grubbin/og.jpg'
		}
	};
};
