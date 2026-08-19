/**
 * CLI counterpart of the old data/compile.php: rebuilds static/data/gamemaster.json and
 * static/data/gamemaster.min.json from the chunks in static/data/gamemaster/.
 *
 *   pnpm compile-gamemaster
 *
 * The same function backs the dev-only route `data/compile.php`, which the developer panel
 * in the footer links to.
 */
import { compileGamemaster } from '../src/lib/server/compileGamemaster.ts';

const { messages, bytes } = compileGamemaster();

for (const message of messages) {
	// "<file> is missing or invalid<br>" — the PHP printed this into its HTML page.
	console.error(message.replace(/<br>$/, ''));
}

console.log(`gamemaster compiled (${bytes} bytes)`);
