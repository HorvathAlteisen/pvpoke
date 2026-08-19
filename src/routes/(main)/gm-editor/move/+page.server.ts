import type { PageServerLoad } from './$types';
import { ucwords } from '$lib/php';

/** gm-editor/move.php — `/gm-editor/moves/{m}` is rerouted here with `m` set. */
export const load: PageServerLoad = async ({ parent }) => {
	const { get } = await parent();
	const m = get && get.m !== undefined ? get.m : undefined;

	// Same name derivation as gm-editor/pokemon.php (the PHP comment there says "Pokemon names").
	const title =
		m !== undefined
			? `${ucwords(m.split('-')[0].replace(/_/g, ' '))} | Gamemaster Editor`
			: 'Moves | Gamemaster Editor';

	return {
		hasMove: m !== undefined,
		meta: {
			title,
			description: 'Customize moves or add new moves for your simulations.',
			canonical: '/gm-editor/moves/'
		}
	};
};
