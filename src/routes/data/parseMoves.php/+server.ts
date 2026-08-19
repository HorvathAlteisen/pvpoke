import { readFileSync } from 'node:fs';
import type { RequestHandler } from './$types';
import { requireDevTools, staticPath } from '$lib/server/devTools';

/**
 * data/parseMoves.php — manual developer tool. Reads a hand-made `chargedmoves.csv`
 * (moveId, power, energy) next to gamemaster.json and prints the matching move entries as
 * JSON-ish HTML to paste into gamemaster/moves.json. The CSV was never committed, so
 * normally only the empty page comes back — exactly like the PHP, whose `fopen()` returned
 * false and skipped the whole block.
 */

/** PHP fgetcsv() for one line: comma delimiter, double-quote enclosure, doubled quotes. */
function parseCsvLine(line: string): string[] {
	const fields: string[] = [];
	let field = '';
	let quoted = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		if (quoted) {
			if (char === '"') {
				if (line[i + 1] === '"') {
					field += '"';
					i++;
				} else {
					quoted = false;
				}
			} else {
				field += char;
			}
		} else if (char === '"') {
			quoted = true;
		} else if (char === ',') {
			fields.push(field);
			field = '';
		} else {
			field += char;
		}
	}
	fields.push(field);
	return fields;
}

export const GET: RequestHandler = async () => {
	requireDevTools();

	let out = '<!doctype html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>Untitled Document</title>\n</head>\n\n<body>\n';

	const gm = JSON.parse(readFileSync(staticPath('data', 'gamemaster.json'), 'utf8'));

	let csv: string | undefined;
	try {
		csv = readFileSync(staticPath('data', 'chargedmoves.csv'), 'utf8');
	} catch {
		csv = undefined;
	}

	if (csv !== undefined) {
		out += '	"moves": [<br>';

		for (const line of csv.split(/\r?\n/)) {
			if (line === '') continue;
			const data = parseCsvLine(line);
			const id = data[0].replaceAll('_FAST', '');

			for (const move of gm.moves) {
				if (move.moveId !== id) continue;

				out += '		{<br>';
				out += '			"moveId": "' + id + '",<br>';
				out += '			"name": "' + move.name + '",<br>';
				out += '			"type": "' + move.type + '",<br>';
				out += '			"power": ' + data[1] + ',<br>';
				out += '			"energy": ' + data[2] + ',<br>';
				out += '			"energyGain": 0,<br>';
				out += '			"damageWindow": ' + move.damageWindow + ',<br>';
				out += '			"cooldown": ' + move.cooldown + '<br>';
				out += '		},<br>';
			}
		}

		out += ']';
	}

	// The PHP file has no trailing newline after </html>.
	out += '</body>\n</html>';

	return new Response(out, { headers: { 'content-type': 'text/html; charset=UTF-8' } });
};
