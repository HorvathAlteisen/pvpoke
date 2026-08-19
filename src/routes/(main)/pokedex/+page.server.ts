import type { PageServerLoad } from './$types';
import { pokedexMeta } from '../pokedex.php/meta';

/**
 * `/pokedex/` — the URL pokedex.php's own canonical points at, which the PHP site never
 * actually served (no rewrite rule). Same page, same meta.
 */
export const load: PageServerLoad = async () => {
	return { meta: pokedexMeta };
};
