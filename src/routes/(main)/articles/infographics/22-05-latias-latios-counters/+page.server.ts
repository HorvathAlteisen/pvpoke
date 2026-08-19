import type { PageServerLoad } from './$types';

/** articles/infographics/22-05-latias-latios-counters.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Latias and Latios Counters for Master League',
			description:
				'See which Latias and Latios raid counters also double as top Master League picks!',
			ogImage:
				'https://pvpoke.com/articles/article-assets/infographics/22-05-latias-latios-counters/og.jpg'
		}
	};
};
