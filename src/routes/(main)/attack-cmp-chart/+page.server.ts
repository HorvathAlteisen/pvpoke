import type { PageServerLoad } from './$types';
import { leagueName } from '$lib/site';

/** attack-cmp-chart.php */
export const load: PageServerLoad = async ({ parent }) => {
	const { get } = await parent();

	const cp = get && get.cp !== undefined ? get.cp : '1500';
	const cup = get && get.cup !== undefined ? get.cup : 'all';

	// $CANONICAL has no trailing slash here, unlike every other page.
	const canonical = `/attack-cmp-chart/${cup}/${cp}`;

	// The switch has no `10000-40` case and defaults to Great League.
	const league = leagueName(cp, 'Great League', false);

	return {
		meta: {
			canonical,
			title: `Attack Stat (CMP) Chart | ${league}`,
			description: `See the Attack stat ranges of Pokemon in ${league} and which Pokemon win Charged Move Priority (CMP). The Pokemon with the higher Attack stat goes first.`
		}
	};
};
