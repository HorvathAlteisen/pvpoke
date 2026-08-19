import { readFileSync } from 'node:fs';
import type { RequestHandler } from './$types';
import { requireDevTools, staticPath } from '$lib/server/devTools';

/**
 * data/movesets.php — dumps every Pokemon's movepool as a CSV download. Nothing links to it;
 * it is a developer convenience (the PHP version is dead anyway: it calls
 * `implode($arr, '|')` with the pre-5.4 argument order, which is fatal on PHP 8).
 */

/**
 * PHP fputcsv(): fields are enclosed in double quotes as soon as they contain the delimiter,
 * the enclosure, the escape character, a tab, a space or a line break; inner quotes double up.
 * Lines end in "\n".
 */
function csvLine(fields: string[]): string {
	return (
		fields
			.map((field) =>
				/[",\\\n\r\t ]/.test(field) ? '"' + field.replace(/"/g, '""') + '"' : field
			)
			.join(',') + '\n'
	);
}

export const GET: RequestHandler = async () => {
	requireDevTools();

	const gm = JSON.parse(readFileSync(staticPath('data', 'gamemaster.json'), 'utf8'));
	const moves: { moveId: string; name: string }[] = gm.moves;

	// PHP looked the move up with array_search() over array_column($gm['moves'], 'moveId');
	// a miss returns false, and $gm['moves'][false] is $gm['moves'][0] — so an unknown move id
	// silently yields the first move's name. Kept, so the output cannot differ.
	const byId = new Map(moves.map((move) => [move.moveId, move]));
	const name = (moveId: string) => (byId.get(moveId) ?? moves[0]).name;

	let body = csvLine(['Pokemon', 'Fast Moves', 'Charged Moves']);

	for (const pokemon of gm.pokemon as {
		speciesName: string;
		fastMoves: string[];
		chargedMoves: string[];
	}[]) {
		body += csvLine([
			pokemon.speciesName,
			pokemon.fastMoves.map(name).join('|'),
			pokemon.chargedMoves.map(name).join('|')
		]);
	}

	return new Response(body, {
		headers: {
			'content-type': 'text/csv;charset=UTF-8',
			'content-disposition': 'attachment; filename=movesets.csv'
		}
	});
};
