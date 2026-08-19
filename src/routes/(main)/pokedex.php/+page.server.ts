import type { PageServerLoad } from './$types';
import { pokedexMeta } from './meta';

/** pokedex.php — the only URL the PHP page had (it has no .htaccess rewrite rule). */
export const load: PageServerLoad = async () => {
	return { meta: pokedexMeta };
};
