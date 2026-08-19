import type { PageServerLoad } from './$types';
import { ucwords } from '$lib/php';

/** gm-editor/pokemon.php — `/gm-editor/pokemon/{p}` is rerouted here with `p` set. */
export const load: PageServerLoad = async ({ parent }) => {
	const { get } = await parent();
	const p = get && get.p !== undefined ? get.p : undefined;

	// ucwords(str_replace('_',' ', explode('-', htmlspecialchars($_GET['p']))[0])) — `get` is
	// already htmlspecialchars()'d by the root layout, so only the explode/replace/ucwords remains.
	const title =
		p !== undefined
			? `${ucwords(p.split('-')[0].replace(/_/g, ' '))} | Gamemaster Editor`
			: 'Pokemon | Gamemaster Editor';

	return {
		hasPokemon: p !== undefined,
		meta: {
			title,
			description: 'Customize Pokemon or add new Pokemon for your simulations.',
			canonical: '/gm-editor/pokemon/'
		}
	};
};
