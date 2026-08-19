/**
 * data/compile.php — builds `data/gamemaster.json` (and the identical `gamemaster.min.json`)
 * out of the hand-edited chunks in `data/gamemaster/`. Used by the CLI
 * (`pnpm compile-gamemaster`, scripts/compile-gamemaster.ts) and by the dev-only route
 * `data/compile.php`, which the developer panel links to.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** The `static/` copy of the old `src/` tree; `data/compile.php` ran with `src/data` as its cwd. */
function dataDir(): string {
	return join(process.cwd(), 'static', 'data');
}

/** PHP date("Y-m-d H:i:s", time()) in the server's local time zone. */
function phpDateTime(now = new Date()): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return (
		`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
		`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
	);
}

/**
 * PHP json_encode($base, JSON_UNESCAPED_SLASHES): compact, slashes left alone, every
 * non-ASCII character escaped as \uXXXX (JSON_UNESCAPED_UNICODE is NOT set).
 */
function phpJsonEncodeUnescapedSlashes(value: unknown): string {
	return JSON.stringify(value).replace(/[\u0080-\uffff]/g, (c) =>
		'\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')
	);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function readJson(path: string): any {
	return JSON.parse(readFileSync(path, 'utf8'));
}

export interface CompileResult {
	/** What the PHP echoed before "gamemaster compiled" (one line per unreadable cup file). */
	messages: string[];
	/** Bytes written to each of the two output files. */
	bytes: number;
}

export function compileGamemaster(): CompileResult {
	const dir = dataDir();
	const messages: string[] = [];

	const base = readJson(join(dir, 'gamemaster', 'base.json'));
	const pokemon = readJson(join(dir, 'gamemaster', 'pokemon.json'));
	const moves = readJson(join(dir, 'gamemaster', 'moves.json'));
	const formats = readJson(join(dir, 'gamemaster', 'formats.json'));

	base['timestamp'] = phpDateTime();
	base['pokemon'] = pokemon;
	base['moves'] = moves;
	base['formats'] = formats;

	// Iterate through all active cup files and add to the cups list. PHP used a
	// DirectoryIterator (raw readdir order, no sorting) and skipped anything but *.json,
	// which leaves the `archive/` subdirectory out.
	const cupsDir = join(dir, 'gamemaster', 'cups');
	for (const entry of readdirSync(cupsDir, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.endsWith('.json')) continue;

		let cup: unknown = null;
		try {
			cup = readJson(join(cupsDir, entry.name));
		} catch {
			cup = null;
		}

		if (cup !== null) {
			base['cups'].push(cup);
		} else {
			messages.push(`${entry.name} is missing or invalid<br>`);
		}
	}

	const json = phpJsonEncodeUnescapedSlashes(base);

	writeFileSync(join(dir, 'gamemaster.json'), json);
	writeFileSync(join(dir, 'gamemaster.min.json'), json);

	// NOTE: the PHP also wrote data/formats.php (a var_export of formats.json) for
	// rankings.php. The SvelteKit rankings page reads data/gamemaster/formats.json
	// directly, so that generated artefact is gone.

	return { messages, bytes: Buffer.byteLength(json) };
}
