import type { PageServerLoad } from './$types';

/** articles/community-day/24-06-goomy.php */
export const load: PageServerLoad = () => {
	return {
		meta: {
			title: 'Goomy Community Day Guide for PvP',
			description:
				"Goodra is getting Thunder Punch this weekend, but is it any good? Check out tips and IV's for this exciting Community Day for PvP!",
			ogImage: 'https://pvpoke.com/articles/article-assets/community-day/24-06-goomy/og.jpg'
		}
	};
};
