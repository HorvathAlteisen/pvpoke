/**
 * Self-test for the legacy harness itself. Later agents do not need to touch this file, but it
 * is the fastest way to see what the harness guarantees.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, onTestFinished } from 'vitest';
import {
	ajaxError,
	COOKIE_SETTINGS,
	createBattleEnv,
	createGameMasterEnv,
	createLegacyEnv,
	DEFAULT_SETTINGS,
	installFakeTimers,
	REPO_ROOT,
	STATIC_ROOT,
	syntheticGameMaster,
	type LegacyEnv
} from '@harness';

/* -------------------------------------------------------------------------- */
/* Contract helpers — these read the real sources, not the harness's copy      */
/* -------------------------------------------------------------------------- */

const GLOBALS_SVELTE = 'src/lib/components/layout/Globals.svelte';

/** The two `var settings = {...}` literals in Globals.svelte, as raw source text. */
function settingsLiterals(): { cookie: string; noCookie: string } {
	const src = readFileSync(resolve(REPO_ROOT, GLOBALS_SVELTE), 'utf8');
	const blocks = [...src.matchAll(/var settings = \{([\s\S]*?)\n\t\t\};/g)].map((m) => m[1]);
	if (blocks.length !== 2) {
		throw new Error(`Expected 2 settings literals in ${GLOBALS_SVELTE}, found ${blocks.length}`);
	}
	// Source order: the `settings.fromCookie ? ... : ...` ternary puts the cookie branch first.
	return { cookie: blocks[0], noCookie: blocks[1] };
}

/** `key -> raw value source` for one of those literals. */
function rawEntries(block: string): Array<[string, string]> {
	return block
		.split('\n')
		.map((l) => l.trim().replace(/,$/, ''))
		.filter((l) => l.length > 0)
		.map((l) => {
			const i = l.indexOf(':');
			return [l.slice(0, i).trim(), l.slice(i + 1).trim()] as [string, string];
		});
}

/** What JS type the emitted script will give this raw value. */
function emittedType(raw: string): string {
	if (/^".*"$/.test(raw)) return 'string';
	if (raw === 'true' || raw === 'false' || /\? 'true' : 'false'/.test(raw)) return 'boolean';
	if (/^\d+$/.test(raw) || /^\$\{phpIntval\([^)]*\)\}$/.test(raw)) return 'number';
	throw new Error(`Cannot classify emitted value \`${raw}\``);
}

describe('createLegacyEnv', () => {
	it('boots the vendored jQuery 3.3.1', () => {
		const env = createLegacyEnv({ html: '<div id="x"></div>' });
		expect(env.$.fn.jquery).toBe('3.3.1');
		expect(env.$('#x').length).toBe(1);
		env.dispose();
	});

	it('exposes the page globals emitted by Globals.svelte', () => {
		const env = createLegacyEnv();
		expect(env.get('host')).toBe('http://localhost/');
		expect(env.get('webRoot')).toBe('/');
		expect(env.get('get')).toBe(false);
		expect(env.get('settings')).toEqual(DEFAULT_SETTINGS);
		env.dispose();
	});

	it('merges settings overrides over the defaults', () => {
		const env = createLegacyEnv({ settings: { theme: 'dark' }, get: { cup: 'all' } });
		expect(env.get('settings').theme).toBe('dark');
		expect(env.get('settings').defaultIVs).toBe('gamemaster');
		expect(env.get('get')).toEqual({ cup: 'all' });
		env.dispose();
	});

	it('reads lexical class bindings with get() even though they are not on globalThis', () => {
		const env = createLegacyEnv({ jquery: false });
		env.load('static/js/battle/timeline/TimelineEvent.js');
		expect(typeof env.get('TimelineEvent')).toBe('function');
		expect(env.ctx.TimelineEvent).toBeUndefined();
		env.dispose();
	});

	it('captures console output instead of printing it', () => {
		const env = createLegacyEnv({ jquery: false });
		env.exec('console.log("hi", 1); console.error("bad");');
		expect(env.logs.log).toEqual([['hi', 1]]);
		expect(env.logs.error).toEqual([['bad']]);
		env.dispose();
	});

	it('pins Math.random for every env, not just battle envs', () => {
		// interface/PokeSelect.js rolls dice too and never goes near createBattleEnv.
		const env = createLegacyEnv({ jquery: false });
		expect(env.exec('[Math.random(), Math.random()]')).toEqual([0.5, 0.5]);
		env.dispose();

		const varied = createLegacyEnv({ jquery: false, random: 0.9 });
		expect(varied.exec('Math.random()')).toBe(0.9);
		varied.dispose();

		const loose = createLegacyEnv({ jquery: false, random: null });
		const [a, b] = loose.exec('[Math.random(), Math.random()]');
		expect(a).not.toBe(b);
		loose.dispose();
	});

	it('stubs the third-party globals the legacy code assumes exist', () => {
		const env = createLegacyEnv({ jquery: false });
		expect(typeof env.get('gtag')).toBe('function');
		expect(typeof env.get('Chart')).toBe('function');
		expect(typeof env.get('Sortable').create).toBe('function');
		env.dispose();
	});
});

/**
 * `dispose()` written as the last line of a test never runs when an assertion above it throws,
 * and `isolate: false` keeps the leaked JSDOM window alive for the worker's whole life. So an env
 * built inside a test registers its own teardown with vitest.
 */
describe('automatic disposal', () => {
	it('disposes an env built inside a test once that test finishes', () => {
		// onTestFinished hooks run in reverse registration order, so registering this one
		// *before* createLegacyEnv registers its own teardown is what makes it observe the
		// disposed state rather than race it. Self-contained on purpose: asserting this from a
		// following test would make the pair order-dependent, which --sequence.shuffle breaks.
		let env!: LegacyEnv;
		onTestFinished(() => {
			expect(env.disposed).toBe(true);
		});

		env = createLegacyEnv({ jquery: false });
		expect(env.disposed).toBe(false);
	});

	it('is idempotent, so an explicit dispose() is still safe', () => {
		const env = createLegacyEnv({ jquery: false });
		env.dispose();
		expect(() => env.dispose()).not.toThrow();
		expect(env.disposed).toBe(true);
	});
});

describe('fake ajax layer', () => {
	it('serves real files under static/ from disk', () => {
		const env = createLegacyEnv();
		let seen: any;
		env.$.getJSON('/data/gamemaster.json?v=1', (d: any) => (seen = d));
		expect(seen.pokemon.length).toBeGreaterThan(1000);
		expect(env.ajax.last()!.path).toBe('data/gamemaster.json');
		env.dispose();
	});

	it('hands every env its own clone of a cached file', () => {
		const a = createLegacyEnv();
		const b = createLegacyEnv();
		let da: any, db: any;
		a.$.getJSON('/data/gamemaster.json', (d: any) => (da = d));
		da.pokemon.length = 0;
		b.$.getJSON('/data/gamemaster.json', (d: any) => (db = d));
		expect(db.pokemon.length).toBeGreaterThan(1000);
		a.dispose();
		b.dispose();
	});

	it('throws loudly on an unknown URL', () => {
		const env = createLegacyEnv();
		expect(() => env.$.getJSON('/data/does-not-exist.json', () => {})).toThrow(
			/Unhandled GET request to "\/data\/does-not-exist\.json"/
		);
		env.dispose();
	});

	it('lets tests register and override routes', () => {
		const env = createLegacyEnv();
		env.ajax.route('data/groups/test.json', [{ speciesId: 'azumarill' }]);
		let seen: any;
		env.$.getJSON('/data/groups/test.json?v=1', (d: any) => (seen = d));
		expect(seen).toEqual([{ speciesId: 'azumarill' }]);

		env.ajax.route('data/groups/test.json', () => []);
		env.$.getJSON('/data/groups/test.json?v=1', (d: any) => (seen = d));
		expect(seen).toEqual([]);
		env.dispose();
	});

	it('forces error branches with fail()', () => {
		const env = createLegacyEnv();
		env.ajax.fail(/gamemaster/, { status: 500, statusText: 'boom' });
		const calls: any[] = [];
		env.$.ajax({
			url: '/data/gamemaster.json',
			success: () => calls.push('success'),
			error: (xhr: any, status: string) => calls.push(['error', xhr.status, status]),
			complete: () => calls.push('complete')
		});
		expect(calls).toEqual([['error', 500, 'error'], 'complete']);
		env.dispose();
	});

	it('supports ajaxError() from a responder', () => {
		const env = createLegacyEnv();
		env.ajax.route(/x\.json/, () => ajaxError({ status: 404 }));
		let status = 0;
		env.$.ajax({ url: '/x.json', error: (xhr: any) => (status = xhr.status) });
		expect(status).toBe(404);
		env.dispose();
	});

	it('queues and flushes in deferred mode', () => {
		const env = createLegacyEnv({ dispatch: 'deferred' });
		let seen: any = null;
		env.$.getJSON('/data/gamemaster.json', (d: any) => (seen = d));
		expect(seen).toBeNull();
		expect(env.ajax.pending()).toBe(1);
		expect(env.ajax.flush()).toBe(1);
		expect(seen).not.toBeNull();
		env.dispose();
	});

	it('parses xml responses into a document', () => {
		const env = createLegacyEnv();
		let doc: any;
		env.$.ajax({ url: '/rss/feed.xml', dataType: 'xml', success: (d: any) => (doc = d) });
		expect(env.$(doc).find('channel item').length).toBeGreaterThan(0);
		env.dispose();
	});

	it('returns a real jQuery promise', () => {
		const env = createLegacyEnv();
		let seen: any;
		env.$.getJSON('/data/gamemaster.json').done((d: any) => (seen = d));
		expect(seen.pokemon.length).toBeGreaterThan(1000);
		env.dispose();
	});

	it('records POST requests and their payload', () => {
		const env = createLegacyEnv();
		env.ajax.route('data/settingsCookie.php', {});
		env.$.ajax({ url: 'http://localhost/data/settingsCookie.php', type: 'POST', data: { theme: 'dark' } });
		expect(env.ajax.last()!.type).toBe('POST');
		expect(env.ajax.last()!.data).toEqual({ theme: 'dark' });
		env.dispose();
	});
});

describe('createGameMasterEnv', () => {
	it('populates the singleton from the synthetic gamemaster by default', () => {
		const { env, gm } = createGameMasterEnv();
		expect(gm.data.pokemon.map((p: any) => p.speciesId)).toEqual(['azumarill', 'machamp']);
		expect(gm.getPokemonById('azumarill').baseStats.atk).toBe(112);
		expect(env.ajax.dispatch).toBe('sync');
		env.dispose();
	});

	it('serves the real gamemaster on request', () => {
		const { env, gm } = createGameMasterEnv({ real: true });
		// Identity facts only — every derived number here would move on a gamemaster recompile.
		expect(gm.getPokemonById('azumarill').dex).toBe(184);
		expect(gm.getMoveById('ICE_BEAM').name).toBe('Ice Beam');
		env.dispose();
	});

	it('accepts an arbitrary gamemaster object', () => {
		const data = syntheticGameMaster({ title: 'Exotic' });
		data.pokemon = [data.pokemon[0]];
		const { env, gm } = createGameMasterEnv({ gamemaster: data });
		expect(gm.data.title).toBe('Exotic');
		expect(gm.data.pokemon.length).toBe(1);
		env.dispose();
	});
});

/**
 * "Prefer the synthetic gamemaster" is only safe advice if the synthetic one has the same shape
 * as the real file. Without this test it would be advice to assert against a fiction: a field
 * the real data carries and the fixture does not silently pins every `if(pokemon.x)` branch to
 * the false arm for every test in the suite.
 */
describe('syntheticGameMaster shape contract', () => {
	const real: any = JSON.parse(readFileSync(resolve(STATIC_ROOT, 'data/gamemaster.json'), 'utf8'));
	const synthetic: any = syntheticGameMaster();

	const keysOfAny = (entries: any[]) => new Set(entries.flatMap((e) => Object.keys(e)));

	it('has exactly the real gamemaster\'s top-level keys', () => {
		expect(Object.keys(synthetic).sort()).toEqual(Object.keys(real).sort());
	});

	it('carries every key the real gamemaster puts on a pokemon entry', () => {
		const have = keysOfAny(synthetic.pokemon);
		const missing = Object.keys(real.pokemon[0]).filter((k) => !have.has(k));
		expect(missing).toEqual([]);
	});

	it('carries every key the real gamemaster puts on a move entry', () => {
		const have = keysOfAny(synthetic.moves);
		const missing = Object.keys(real.moves[0]).filter((k) => !have.has(k));
		expect(missing).toEqual([]);
	});

	it('leaves each optional pokemon field off at least one entry, so both arms are reachable', () => {
		for (const key of ['tags', 'level25CP', 'buddyDistance', 'thirdMoveCost']) {
			expect(synthetic.pokemon.some((p: any) => key in p), `${key} present somewhere`).toBe(true);
			expect(synthetic.pokemon.some((p: any) => !(key in p)), `${key} absent somewhere`).toBe(true);
		}
		expect(synthetic.moves.some((m: any) => 'abbreviation' in m)).toBe(true);
		expect(synthetic.moves.some((m: any) => !('abbreviation' in m))).toBe(true);
	});
});

/**
 * DEFAULT_SETTINGS / COOKIE_SETTINGS mirror a literal in a Svelte component. Comparing them
 * against an env the harness built out of them would be circular, so parse the component.
 */
describe('settings contract with Globals.svelte', () => {
	it('DEFAULT_SETTINGS is the no-cookie literal, field for field', () => {
		const { noCookie } = settingsLiterals();
		const parsed = new Function(`return {${noCookie}}`)();
		expect(parsed).toEqual({ ...DEFAULT_SETTINGS });
		expect(Object.keys(parsed)).toEqual(Object.keys(DEFAULT_SETTINGS));
	});

	it('COOKIE_SETTINGS has the same keys as the no-cookie literal', () => {
		const { cookie, noCookie } = settingsLiterals();
		expect(rawEntries(cookie).map((e) => e[0])).toEqual(rawEntries(noCookie).map((e) => e[0]));
		expect(Object.keys(COOKIE_SETTINGS)).toEqual(rawEntries(cookie).map((e) => e[0]));
	});

	it('COOKIE_SETTINGS reproduces the JS type the cookie branch emits for every field', () => {
		const { cookie } = settingsLiterals();
		const emitted = Object.fromEntries(rawEntries(cookie).map(([k, v]) => [k, emittedType(v)]));
		const modelled = Object.fromEntries(
			Object.entries(COOKIE_SETTINGS).map(([k, v]) => [k, typeof v])
		);
		expect(modelled).toEqual(emitted);
	});

	it('differs from DEFAULT_SETTINGS on exactly the fields whose JS type the cookie changes', () => {
		const differing = Object.keys(DEFAULT_SETTINGS).filter(
			(k) => typeof (DEFAULT_SETTINGS as any)[k] !== typeof (COOKIE_SETTINGS as any)[k]
		);
		// `xls` is a boolean in both branches, so it is NOT in this list even though the cookie
		// branch computes it differently. The other three change type.
		expect(differing.sort()).toEqual(['animateTimeline', 'pokeboxId', 'pokeboxLastDateTime']);

		// The one that actually flips a branch: `"0"` is truthy, `0` is not.
		// interface/Pokebox.js:258 — `if((settings.pokeboxId)&&(settings.pokeboxId > 0))`.
		expect(Boolean(DEFAULT_SETTINGS.pokeboxId)).toBe(false);
		expect(Boolean(COOKIE_SETTINGS.pokeboxId)).toBe(true);
		// ...and the guard behind it, which `0 > 0` and `"0" > 0` both fail.
		expect((COOKIE_SETTINGS.pokeboxId as any) > 0).toBe(false);
	});
});

describe('createBattleEnv', () => {
	/** Azumarill vs Machamp, 1500, no shields — run start to finish in a fresh env. */
	function simulate(): { env: any; battle: any; timeline: any[] } {
		const { env, newBattle } = createBattleEnv();
		const battle = newBattle();
		const Pokemon = env.get('Pokemon');
		const a = new Pokemon('azumarill', 0, battle);
		const b = new Pokemon('machamp', 1, battle);
		a.initialize(true);
		b.initialize(true);
		battle.setNewPokemon(a, 0, false);
		battle.setNewPokemon(b, 1, false);
		battle.simulate();
		return { env, battle, timeline: battle.getTimeline() };
	}

	/** Everything about an event that the simulator decided, with object identity dropped. */
	const serialise = (timeline: any[]) =>
		timeline.map((e: any) => ({
			type: e.type,
			name: e.name,
			time: e.time,
			turn: e.turn,
			values: [...e.values]
		}));

	it('pins Math.random, so the same simulation in two envs produces the same timeline', () => {
		const first = simulate();
		const second = simulate();

		expect(first.env.exec('Math.random()')).toBe(0.5);
		// The whole point of the harness for the ~9k-line battle wave: byte-for-byte repeatable.
		// `toBeGreaterThan(0)` here would pass on a simulator that rolled fresh dice every run.
		expect(serialise(second.timeline)).toEqual(serialise(first.timeline));

		// Exact anchors, so the comparison above cannot be two identical *empty* timelines and a
		// behaviour change in the simulator is visible rather than merely consistent.
		// Bubble is a 3-turn fast move, so Azumarill's first one resolves on turn 3 / 1000 ms.
		// Damage: floor(8 * 1.2 (STAB) * (atk/def) * 1 (neutral vs fighting) * 0.5 * 1.3) + 1 = 6.
		const firstBubble = first.timeline.find((e: any) => e.name === 'Bubble');
		expect(firstBubble.type).toBe('fast water');
		expect(firstBubble.turn).toBe(3);
		expect(firstBubble.time).toBe(1000);
		expect(firstBubble.values[0]).toBe(6);
		expect(first.timeline.length).toBe(54);

		first.env.dispose();
		second.env.dispose();
	});
});

describe('viewport and pointer helpers', () => {
	it('resize() drives every width the legacy code reads', () => {
		const env = createLegacyEnv();
		env.resize(375, 812);
		expect(env.get('window.innerWidth')).toBe(375);
		expect(env.get('screen.width')).toBe(375);
		expect(env.$(env.window).width()).toBe(375);

		env.resize(1280, 900);
		expect(env.$(env.window).width()).toBe(1280);
		expect(env.get('screen.width')).toBe(1280);
		env.dispose();
	});

	it('hover() makes :hover match the element and its ancestors', () => {
		const env = createLegacyEnv({ html: '<div class="outer"><span class="inner"></span></div>' });
		expect(env.$('.outer:hover').length).toBe(0);

		env.hover('.inner');
		expect(env.$('.inner:hover').length).toBe(1);
		expect(env.$('.outer:hover').length).toBe(1);

		env.hover(null);
		expect(env.$('.outer:hover').length).toBe(0);
		env.dispose();
	});
});

describe('jQuery effects', () => {
	it('completes .animate() synchronously so the callback is observable', () => {
		const env = createLegacyEnv({ html: '<div id="a"></div>' });
		let done = false;
		env.$('#a').animate({ opacity: 0.25 }, 500, () => (done = true));
		// With $.fx.off the queue drains inside the call; with real effects this would need
		// requestAnimationFrame, which installFakeTimers does not patch.
		expect(done).toBe(true);
		expect(env.$('#a').css('opacity')).toBe('0.25');
		env.dispose();
	});

	it('runs effects for real when fx: true is passed', () => {
		const env = createLegacyEnv({ html: '<div id="a"></div>', fx: true });
		let done = false;
		env.$('#a').fadeOut(500, () => (done = true));
		expect(done).toBe(false);
		env.dispose();
	});
});

describe('installFakeTimers', () => {
	it('drives the JSDOM window timers', () => {
		const env = createLegacyEnv({ jquery: false });
		const timers = installFakeTimers(env);
		env.exec('globalThis.hits = []; setTimeout(() => hits.push("a"), 100); setInterval(() => hits.push("b"), 50);');

		timers.tick(50);
		expect(env.get('hits')).toEqual(['b']);
		timers.tick(50);
		// Same-deadline order follows creation order: the timeout was scheduled first.
		expect(env.get('hits')).toEqual(['b', 'a', 'b']);

		timers.restore();
		env.dispose();
	});

	it('makes Date inside the context read the fake clock', () => {
		const env = createLegacyEnv({ jquery: false });
		const timers = installFakeTimers(env, { now: Date.parse('2025-01-01T00:00:00.000Z') });

		expect(env.exec('Date.now()')).toBe(Date.parse('2025-01-01T00:00:00.000Z'));
		expect(env.exec('new Date().toISOString()')).toBe('2025-01-01T00:00:00.000Z');

		timers.tick(90_000);
		expect(env.exec('new Date().toISOString()')).toBe('2025-01-01T00:01:30.000Z');
		expect(timers.wallClock()).toBe(env.exec('Date.now()'));

		// Explicit arguments, parsing and the prototype are the real Date's.
		expect(env.exec('new Date(0).getUTCFullYear()')).toBe(1970);
		expect(env.exec('Date.parse("2020-06-01T00:00:00.000Z")')).toBe(
			Date.parse('2020-06-01T00:00:00.000Z')
		);
		expect(env.exec('new Date() instanceof Date')).toBe(true);

		timers.restore();
		expect(env.exec('Date.now()')).toBeGreaterThan(Date.parse('2025-01-01T00:00:00.000Z'));
		env.dispose();
	});
});

describe('ajax.file()', () => {
	it('serves a fixture with the dataType the request asked for', () => {
		const env = createLegacyEnv();
		env.ajax.file(/feed\.xml/, 'static/rss/feed.xml');
		let doc: any;
		env.$.ajax({ url: '/anything/feed.xml', dataType: 'xml', success: (d: any) => (doc = d) });
		expect(env.$(doc).find('channel item').length).toBeGreaterThan(0);
		env.dispose();
	});
});
