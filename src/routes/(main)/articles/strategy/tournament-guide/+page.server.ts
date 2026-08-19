import type { PageServerLoad } from './$types';

/** articles/strategy/tournament-guide.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Strategy Guide for Tournament Play',
			description:
				'How do you build a team for tournament play and pick your Pokemon for battle? Get an in depth look at tournament strategies with advice from veteran trainers!',
			ogImage: 'https://pvpoke.com/articles/article-assets/tournament-guide/og.jpg'
		}
	};
};
