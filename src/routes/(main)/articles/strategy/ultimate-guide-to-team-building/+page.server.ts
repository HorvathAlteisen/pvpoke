import type { PageServerLoad } from './$types';

/** articles/strategy/ultimate-guide-to-team-building.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Ultimate Guide to Team Building',
			description:
				'Learn the fundamentals of building a good team and how to use the PvPoke Team Builder to its full potential.',
			ogImage: 'https://pvpoke.com/articles/article-assets/ultimate-guide-to-team-building/og.jpg'
		}
	};
};
