import type { RowDataPacket } from 'mysql2';
import type { RequestHandler } from './$types';
import { phpJsonEncode } from '$lib/php';
import { getPool } from '$lib/server/db';
import { requireDevTools } from '$lib/server/devTools';

/**
 * data/training/getTraining.php — aggregates the training telemetry of the last 14 days into
 * the JSON that is saved by hand as `data/training/analysis/{cup}/{cp}.json` (what the Top
 * Performers page loads). No JS calls it; it is run offline, hence dev-tools gated.
 *
 * GET ?format=<cup name + ' ' + cp>, e.g. "all 1500".
 */

const LOOKBACK_DAYS = 14;
const POKE_MINIMUM = 0;
const TEAM_MINIMUM = 0;
const USAGE_BREAKDOWN_MINIMUM = 0.05;
const USAGE_PERIOD = 3;
const USAGE_PERIOD_COUNT = 10;

const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

const pad = (n: number) => String(n).padStart(2, '0');

/** PHP date('Y-m-d', strtotime('today - N days')) with a time-of-day suffix. */
function dayOffset(days: number, time: string): string {
	const date = new Date();
	date.setHours(0, 0, 0, 0);
	date.setDate(date.getDate() - days);
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${time}`;
}

/**
 * PHP `floatval(number_format($value, 2))`: number_format() rounds to two decimals but also
 * groups thousands with commas, and floatval() then stops at the first comma — so a value of
 * 1234.5 comes out as 1. The quirk is kept so the generated files stay identical.
 */
function phpFloatvalNumberFormat(value: number): number {
	const formatted = value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return parseFloat(formatted);
}

interface Performer {
	pokemon: string;
	individualScore: number;
	teamScore: number;
	games: number;
	usageTrend?: number[];
}

export const GET: RequestHandler = async ({ url }) => {
	requireDevTools();

	const format = url.searchParams.get('format');

	// if(! isset($_GET['format'])) exit();
	if (format === null) {
		return new Response('', {
			headers: { 'content-type': 'application/json; charset=utf-8' }
		});
	}

	const lookbackTimestamp = dayOffset(LOOKBACK_DAYS, '00:00:00');

	const now = new Date();
	const properties = {
		lastUpdated: `${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`,
		totalPerformers: 0,
		totalTeams: 0
	};

	const performers: Performer[] = [];
	const teams: { team: string; teamScore: number; games: number }[] = [];

	const pool = getPool();
	const query = async (sql: string, params: (string | number)[]): Promise<RowDataPacket[]> => {
		const [result] = await pool.execute<RowDataPacket[]>(sql, params);
		return result;
	};

	// Total Pokemon count in timespan
	const totalPokemon = Number(
		(
			await query(
				'SELECT COUNT(*) AS total FROM training_pokemon WHERE postDatetime > ? AND format = ?',
				[lookbackTimestamp, format]
			)
		)[0].total
	);
	properties.totalPerformers = totalPokemon;

	// Total team count in timespan
	properties.totalTeams = Number(
		(
			await query(
				'SELECT COUNT(*) AS total FROM training_team WHERE postDatetime > ? AND format = ?',
				[lookbackTimestamp, format]
			)
		)[0].total
	);

	// Get top individual performers within the timespan
	for (const row of await query(
		'SELECT pokemonId, AVG(individualScore) AS individualAvg, AVG(teamScore) as teamAvg, COUNT(*) AS games FROM training_pokemon WHERE postDatetime > ? AND format = ? GROUP BY pokemonId HAVING COUNT(*) > ? ORDER BY teamAvg DESC',
		[lookbackTimestamp, format, POKE_MINIMUM]
	)) {
		performers.push({
			pokemon: String(row.pokemonId),
			individualScore: phpFloatvalNumberFormat(Number(row.individualAvg)),
			teamScore: phpFloatvalNumberFormat(Number(row.teamAvg)),
			games: Number(row.games)
		});
	}

	// Get usage for individual performers over time, in a specified window of days
	for (let i = 1; i <= USAGE_PERIOD_COUNT; i++) {
		const lookbackStartStr = dayOffset(USAGE_PERIOD * i, '00:00:00');
		const lookbackEndStr = dayOffset(USAGE_PERIOD * (i - 1), '23:59:59');

		const totalPokemonByPeriod = Number(
			(
				await query(
					'SELECT COUNT(*) AS total FROM training_pokemon WHERE postDatetime > ? AND postDatetime < ? AND format = ?',
					[lookbackStartStr, lookbackEndStr, format]
				)
			)[0].total
		);

		const totalTeamsByPeriod = totalPokemonByPeriod / 3;

		for (const poke of performers) {
			// PHP divided by $totalPokemon unguarded; an empty timespan would have been a
			// DivisionByZeroError, so nothing is reported in that case here either.
			if (totalPokemon === 0 || poke.games / totalPokemon < USAGE_BREAKDOWN_MINIMUM) continue;

			if (i === 1) {
				poke.usageTrend = [];
			}

			const pokemonUsageByPeriod = Number(
				(
					await query(
						'SELECT COUNT(*) AS total FROM training_pokemon WHERE pokemonId = ? AND postDatetime > ? AND postDatetime < ? AND format = ?',
						[poke.pokemon, lookbackStartStr, lookbackEndStr, format]
					)
				)[0].total
			);

			const usage =
				totalTeamsByPeriod === 0
					? 0
					: phpFloatvalNumberFormat((pokemonUsageByPeriod / totalTeamsByPeriod) * 100);
			poke.usageTrend?.unshift(usage);
		}
	}

	// Get top teams within the timespan
	for (const row of await query(
		'SELECT teamStr, AVG(teamScore) as teamAvg, COUNT(*) AS games FROM training_team WHERE postDatetime > ? AND format = ? GROUP BY teamStr HAVING COUNT(*) > ? ORDER BY teamAvg DESC',
		[lookbackTimestamp, format, TEAM_MINIMUM]
	)) {
		teams.push({
			team: String(row.teamStr),
			teamScore: phpFloatvalNumberFormat(Number(row.teamAvg)),
			games: Number(row.games)
		});
	}

	return new Response(phpJsonEncode({ properties, performers, teams }), {
		headers: { 'content-type': 'application/json; charset=utf-8' }
	});
};
