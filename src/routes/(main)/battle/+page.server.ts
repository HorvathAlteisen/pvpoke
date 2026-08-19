import type { PageServerLoad } from './$types';
import { ucwords } from '$lib/php';

/**
 * battle.php — the route every clean `/battle/...` URL is rerouted to (see lib/rewrites.ts),
 * so `get` already holds cp/p1/p2/mode/…
 */
export const load: PageServerLoad = async ({ parent }) => {
	const { get } = await parent();

	let title = 'Battle';

	// if(isset($_GET['p1']) && isset($_GET['p2'])): put the Pokemon names in the meta title.
	// PHP: ucwords(str_replace('_',' ', explode('-', htmlspecialchars($_GET['p1']))[0])).
	// `get` values are already htmlspecialchars()'d by the root layout (the PHP escaped $_GET
	// itself before header.php did), so only the explode/replace/ucwords part is left here —
	// phpNameFromSpeciesId() would escape a second time.
	const name = (p: string) => ucwords(p.split('-')[0].replace(/_/g, ' '));

	if (get && get.p1 !== undefined && get.p2 !== undefined) {
		title = `Battle - ${name(get.p1)} vs. ${name(get.p2)}`;
	}

	return {
		meta: {
			canonical: '/battle/',
			title,
			description:
				"Pit two custom Pokemon against each other in the Trainer Battle simulator. You can choose from any league, and customize movesets, levels, IV's, and shields."
		}
	};
};
