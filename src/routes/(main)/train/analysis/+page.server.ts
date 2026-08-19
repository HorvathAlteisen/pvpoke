import type { PageServerLoad } from './$types';

/**
 * train/analysis.php — reached as /train/analysis/ and /train/analysis/{cup}/{cp}/
 * (rewritten to `cup`/`cp` params, see lib/rewrites.ts).
 */
export const load: PageServerLoad = async ({ parent }) => {
	const { get } = await parent();

	// $_GET values are already htmlspecialchars()'d by the root layout.
	const cp = get && get.cp !== undefined ? get.cp : '1500';
	const cup = get && get.cup !== undefined ? get.cup : 'all';

	// Yes, `/training/` — the PHP writes a canonical path that does not exist. Kept verbatim.
	const canonical = `/training/analysis/${cup}/${cp}`;

	let league = 'Great League';

	switch (cp) {
		case '1500':
			league = 'Great League';
			break;
		case '2500':
			league = 'Ultra League';
			break;
		case '10000':
			league = 'Master League';
			break;
	}

	switch (cup) {
		case 'premier':
			league = 'Premier';
			break;
		case 'retro':
			league = 'Retro Cup';
			break;
		case 'kanto':
			league = 'Kanto Cup';
			break;
		case 'hisui':
			league = 'Hisui Cup';
			break;
		case 'elementremix':
			league = 'Element Cup Remix';
			break;
		case 'halloween':
			league = 'Halloween Cup';
			break;
		case 'premierclassic':
			league = 'Premier Classic';
			break;
		case 'Remix':
			league = 'Remix';
			break;
	}

	return {
		meta: {
			canonical,
			title: `${league} Top Performers`,
			// PHP: '…the site\'s simulated Training Battles.' — a plain apostrophe, echoed raw.
			description:
				"Search the top Pokemon, top movesets, and top teams teams measured from the site's simulated Training Battles."
		}
	};
};
