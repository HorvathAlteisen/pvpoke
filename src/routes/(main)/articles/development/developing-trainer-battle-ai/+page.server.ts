import type { PageServerLoad } from './$types';

/** articles/development/developing-trainer-battle-ai.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Developing an AI for Pokemon GO Trainer Battles',
			description: "Read about the artificial intelligence behind PvPoke's training battles."
		}
	};
};
