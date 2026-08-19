import type { PageServerLoad } from './$types';

/** articles/infographics/22-03-great-league-meta-snapshot.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Great League Tournament Meta Snapshot, March 2022',
			description:
				'Get a preview of the Pokemon GO Championship Series meta for your regional tournament.',
			ogImage:
				'https://pvpoke.com/articles/article-assets/infographics/22-03-great-league-meta-snapshot/og.jpg'
		}
	};
};
