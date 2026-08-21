/**
 * Regenerates static/data/gamemaster/pokemonNames.json — the localized display names for
 * every entry in static/data/gamemaster/pokemon.json.
 *
 *   pnpm generate-pokemon-names                # rebuild the names from the checked-in data
 *   pnpm generate-pokemon-names --refresh-forms # also re-pull the form qualifier dictionary
 *
 * How a name is put together
 * --------------------------
 * A pvpoke species name is an English species name plus zero or more form qualifiers:
 * "Charizard", "Charizard (Mega X)", "Rattata (Alolan) (Shadow)". Rather than translating
 * 1700+ full strings, this script translates the two halves separately and recombines them:
 *
 *   - species names come from PokeAPI, looked up by dex number (they are the official
 *     localizations, so there is nothing to hand-maintain);
 *   - form qualifiers come from scripts/data/pokemon-form-names.json, a small checked-in
 *     dictionary of ~120 entries that covers all 1700+ Pokemon.
 *
 * That means a gamemaster update usually needs no work here at all: new Pokemon pick up
 * their names from PokeAPI, and only a genuinely new form qualifier needs a dictionary
 * entry (the script fails loudly listing any it does not know).
 *
 * The dictionary
 * --------------
 * Each qualifier is either derived from PokeAPI or hand-written:
 *
 *   "Alolan":  { "form": "raichu-alola", ... }   — pulled from that form's localized name
 *   "Bug":     { "type": "bug", ... }            — pulled from the localized type name
 *   "Mega X":  { "from": ["Mega"], "suffix": " X", ... } — derived from other entries
 *   "Shadow":  { "form": null, ... }             — hand-written; Pokemon GO only
 *
 * An entry may also carry an `override` block, for locales PokeAPI has no string for. Those
 * win over the fetched name and survive a refresh.
 *
 * `--refresh-forms` rewrites the derived entries in place and leaves the hand-written ones
 * alone, so the file stays regenerable without losing the Pokemon GO specific strings.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

/** Output locales, and the PokeAPI language names they are sourced from (first hit wins). */
const LOCALES: Record<string, string[]> = {
	de: ['de'],
	fr: ['fr'],
	es: ['es', 'es-419'],
	it: ['it'],
	ja: ['ja-hrkt', 'ja'],
	ko: ['ko'],
	'zh-Hans': ['zh-hans'],
	'zh-Hant': ['zh-hant']
};

const LOCALE_CODES = Object.keys(LOCALES);

/** Species names are looked up by National Pokedex number; pvpoke tops out at 1025. */
const MAX_DEX = 1025;

/**
 * Species whose pvpoke name puts part of the species name in brackets ("Mime (Jr)",
 * "Type (Null)"). The bracketed word is not a form, so the localized name is just the
 * species name and the qualifier is dropped.
 */
const PLAIN_NAME_SPECIES = new Set(['mime_jr', 'type_null']);

const ROOT = join(dirname(new URL(import.meta.url).pathname), '..');
const POKEMON_PATH = join(ROOT, 'static', 'data', 'gamemaster', 'pokemon.json');
const FORM_NAMES_PATH = join(ROOT, 'scripts', 'data', 'pokemon-form-names.json');
const OUTPUT_PATH = join(ROOT, 'static', 'data', 'gamemaster', 'pokemonNames.json');
const CACHE_DIR = join(ROOT, 'node_modules', '.cache', 'pvpoke-pokeapi');

interface FormEntry {
	/** PokeAPI pokemon-form slug to pull the localized form name from, or null when hand-written. */
	form?: string | null;
	/** PokeAPI type name, for the Arceus/Silvally forms that are named after a type. */
	type?: string;
	/** Derive by joining other dictionary entries (used for "Mega X" = "Mega" + " X"). */
	from?: string[];
	/** Joins the `from` entries. */
	separator?: string;
	/** Appended to the derived name when `from` is set. */
	suffix?: string;
	/** Hand-written names for locales PokeAPI does not cover; kept across a refresh. */
	override?: Record<string, string>;
	/** locale code -> translated qualifier. */
	[locale: string]: string | null | undefined;
}

interface NamedApiResource {
	name: string;
	names?: Array<{ name: string; language: { name: string } }>;
	form_names?: Array<{ name: string; language: { name: string } }>;
}

function readJson<T>(path: string): T {
	return JSON.parse(readFileSync(path, 'utf8')) as T;
}

/** GET a PokeAPI resource, caching the response so re-runs are offline and instant. */
async function fetchResource(path: string): Promise<NamedApiResource | null> {
	const cachePath = join(CACHE_DIR, path.replace(/\//g, '_') + '.json');
	try {
		return readJson<NamedApiResource>(cachePath);
	} catch {
		// Not cached yet.
	}

	const url = `https://pokeapi.co/api/v2/${path}`;
	for (let attempt = 0; attempt < 3; attempt++) {
		const response = await fetch(url);
		if (response.status === 404) return null;
		if (response.ok) {
			const body = (await response.json()) as NamedApiResource;
			mkdirSync(CACHE_DIR, { recursive: true });
			writeFileSync(cachePath, JSON.stringify(body));
			return body;
		}
		await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
	}
	throw new Error(`PokeAPI request failed: ${url}`);
}

/** Run `task` over `items` with a small amount of concurrency, keeping the input order. */
async function mapLimit<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>): Promise<R[]> {
	const results = new Array<R>(items.length);
	let next = 0;
	const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
		while (next < items.length) {
			const index = next++;
			results[index] = await task(items[index]);
		}
	});
	await Promise.all(workers);
	return results;
}

/** Pick one localized string per output locale out of a PokeAPI names array. */
function pickLocales(
	entries: Array<{ name: string; language: { name: string } }> | undefined
): Record<string, string> {
	const byLanguage = new Map((entries ?? []).map((entry) => [entry.language.name, entry.name]));
	const picked: Record<string, string> = {};
	for (const [locale, languages] of Object.entries(LOCALES)) {
		for (const language of languages) {
			const name = byLanguage.get(language);
			if (name) {
				picked[locale] = name;
				break;
			}
		}
	}
	return picked;
}

/** Re-pull every dictionary entry sourced from PokeAPI, then resolve the derived ones. */
async function refreshFormNames(dictionary: Record<string, FormEntry>): Promise<void> {
	const sourced = Object.entries(dictionary).filter(([, entry]) => entry.form || entry.type);
	const fetched = await mapLimit(sourced, 8, async ([qualifier, entry]) => {
		if (entry.type) {
			const type = await fetchResource(`type/${entry.type}`);
			if (!type) throw new Error(`Unknown PokeAPI type "${entry.type}" for qualifier "${qualifier}"`);
			return [qualifier, pickLocales(type.names)] as const;
		}
		const form = await fetchResource(`pokemon-form/${entry.form}`);
		if (!form) throw new Error(`Unknown PokeAPI form "${entry.form}" for qualifier "${qualifier}"`);
		return [qualifier, pickLocales(form.form_names)] as const;
	});

	for (const [qualifier, names] of fetched) {
		const entry = dictionary[qualifier];
		for (const locale of LOCALE_CODES) {
			entry[locale] = entry.override?.[locale] ?? names[locale] ?? null;
		}
	}

	// Entries built out of other entries, e.g. "Mega X" is "Mega" plus " X".
	for (const [qualifier, entry] of Object.entries(dictionary)) {
		if (!entry.from) continue;
		for (const locale of LOCALE_CODES) {
			const parts = entry.from.map((key) => {
				const source = dictionary[key];
				if (!source) throw new Error(`Qualifier "${qualifier}" derives from unknown "${key}"`);
				return source[locale];
			});
			entry[locale] = parts.every(Boolean)
				? parts.join(entry.separator ?? ' ') + (entry.suffix ?? '')
				: null;
		}
	}

	writeJson(FORM_NAMES_PATH, dictionary);
	console.log(`refreshed ${sourced.length} form qualifiers from PokeAPI`);
}

/** Split "Rattata (Alolan) (Shadow)" into its species name and its form qualifiers. */
function splitSpeciesName(speciesName: string): { base: string; qualifiers: string[]; underscored: boolean } {
	// A handful of gamemaster entries use underscores instead of brackets, e.g.
	// "Palafin_hero". Treat the suffix as a qualifier so it can be translated too.
	if (speciesName.includes('_')) {
		const [base, ...rest] = speciesName.split('_');
		return { base, qualifiers: [rest.join('_')], underscored: true };
	}

	const qualifiers = [...speciesName.matchAll(/\(([^)]*)\)/g)].map((match) => match[1]);
	const base = speciesName.replace(/\s*\([^)]*\)/g, '').trim();
	return { base, qualifiers, underscored: false };
}

/** PHP-free equivalent of scripts/pretty-format-json.js for objects: 4 spaces, trailing newline. */
function writeJson(path: string, value: unknown): void {
	writeFileSync(path, JSON.stringify(value, null, 4) + '\n');
}

interface Pokemon {
	dex: number;
	speciesId: string;
	speciesName: string;
}

async function main(): Promise<void> {
	const refresh = process.argv.includes('--refresh-forms');
	const pokemon = readJson<Pokemon[]>(POKEMON_PATH);
	const dictionary = readJson<Record<string, FormEntry>>(FORM_NAMES_PATH);

	if (refresh) {
		await refreshFormNames(dictionary);
	}

	// Species names by dex number. Every dex pvpoke uses is fetched once.
	const dexNumbers = [...new Set(pokemon.map((entry) => entry.dex))].filter(
		(dex) => dex >= 1 && dex <= MAX_DEX
	);
	console.log(`fetching ${dexNumbers.length} species names from PokeAPI...`);
	const speciesNames = new Map<number, Record<string, string>>(
		await mapLimit(dexNumbers, 8, async (dex) => {
			const species = await fetchResource(`pokemon-species/${dex}`);
			if (!species) throw new Error(`No PokeAPI species for dex ${dex}`);
			return [dex, pickLocales(species.names)] as const;
		})
	);

	const unknownQualifiers = new Set<string>();
	const untranslated = new Map<string, Set<string>>();
	const output: Record<string, Record<string, string>> = {};

	for (const entry of pokemon) {
		const { base, qualifiers, underscored } = splitSpeciesName(entry.speciesName);
		const species = speciesNames.get(entry.dex);
		if (!species) continue;

		const plain = PLAIN_NAME_SPECIES.has(entry.speciesId.replace(/_shadow$/, ''));
		const names: Record<string, string> = {};

		for (const locale of LOCALE_CODES) {
			// Fall back to the English species name so a locale is never missing an entry.
			let name = species[locale] ?? base;

			for (const qualifier of qualifiers) {
				// "Mime (Jr)" is not a form: the brackets are part of the species name.
				if (plain && qualifier !== 'Shadow') continue;

				const translations = dictionary[qualifier];
				if (!translations) {
					unknownQualifiers.add(qualifier);
				} else if (!translations[locale]) {
					if (!untranslated.has(qualifier)) untranslated.set(qualifier, new Set());
					untranslated.get(qualifier)!.add(locale);
				}

				const translated = translations?.[locale] ?? qualifier;
				name += underscored ? `_${translated}` : ` (${translated})`;
			}

			names[locale] = name;
		}

		output[entry.speciesId] = names;
	}

	writeJson(OUTPUT_PATH, output);

	for (const [qualifier, locales] of untranslated) {
		console.warn(`no translation for "(${qualifier})" in ${[...locales].join(', ')} — English kept`);
	}
	if (unknownQualifiers.size > 0) {
		console.error(
			`unknown form qualifiers, add them to scripts/data/pokemon-form-names.json: ` +
				[...unknownQualifiers].map((qualifier) => `"${qualifier}"`).join(', ')
		);
		process.exitCode = 1;
	}

	console.log(`wrote ${Object.keys(output).length} localized names to ${OUTPUT_PATH}`);
}

await main();
