import type { PageServerLoad } from './$types';

/** index.php sets no $META_* variables: default title/description. */
export const load: PageServerLoad = async () => {
	return { meta: {} };
};
