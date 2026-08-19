import type { PageServerLoad } from './$types';

/**
 * gm-editor/edit.php — `/gm-editor/pokemon/` and `/gm-editor/moves/` are rerouted here with
 * `c=pokemon` / `c=moves` (see lib/rewrites.ts). Everything on the page varies by `c`.
 *
 * Note: the PHP $META_TITLE strings already contain '| Gamemaster Editor' and the layout
 * appends ' | PvPoke' on top of that, exactly like header.php did.
 */
export const load: PageServerLoad = async ({ parent }) => {
	const { get } = await parent();
	const c = get && get.c !== undefined ? get.c : undefined;

	let title = 'Gamemaster Editor';
	let description = 'Customize Pokemon or add new Pokemon for your simulations.';
	let body = '';
	let placeholder = '';
	let exportTitle = '';
	let newButtonText = '';
	let category = '';

	if (c === 'pokemon') {
		title = 'All Pokemon | Gamemaster Editor';
		description = 'Customize Pokemon or add new Pokemon for your simulations.';
		body = 'Customize Pokemon or add new Pokemon for your simulations.';
		placeholder = 'Search Pokemon';
		exportTitle = 'Import/Export All Pokemon';
		newButtonText = '+ New Pokemon';
		category = 'pokemon';
	} else if (c === 'moves') {
		title = 'All Moves | Gamemaster Editor';
		description = 'Customize moves or add new moves for your simulations.';
		body = 'Customize moves or add new moves for your simulations.';
		placeholder = 'Search Moves';
		exportTitle = 'Import/Export All Moves';
		newButtonText = '+ New Move';
		category = 'moves';
	}

	return {
		// isset($_GET['c']) — the table block renders for any value of c, not just the two known ones
		hasCategory: c !== undefined,
		category,
		body,
		placeholder,
		exportTitle,
		newButtonText,
		meta: { title, description }
	};
};
