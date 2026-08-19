import type { PageServerLoad } from './$types';

/** team-builder.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			canonical: '/team-builder/',
			title: 'Team Builder',
			description:
				'Build your team for Pokemon GO Trainer Battles. See how your Pokemon match up offensively and defensively, discover which Pokemon are the best counters to yours, and get suggestions for how to make your team better.'
		}
	};
};
