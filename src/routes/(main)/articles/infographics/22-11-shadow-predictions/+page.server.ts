import type { PageServerLoad } from './$types';

/** articles/infographics/22-11-shadow-predictions.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: "PvPoke's Shadow Crystal Ball",
			description:
				"Which Shadow Pokemon could become more relevant for PvP in a future move update or Community Day? Check out this speculative list if you have TM's to spare!"
		}
	};
};
