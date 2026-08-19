import type { PageServerLoad } from './$types';

/** articles/strategy/guide-to-fast-move-registration.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Guide to Fast Move Mechanics',
			description:
				'How exactly do Fast Moves work and register? This guide will walk you through the basics of understanding the nuts and bolts of Trainer Battles.',
			ogImage:
				'https://pvpoke.com/articles/article-assets/guide-to-fast-move-registration/og.jpg'
		}
	};
};
