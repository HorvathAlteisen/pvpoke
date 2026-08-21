/**
 * Self-test for the legacy harness itself. Later agents do not need to touch this file, but it
 * is the fastest way to see what the harness guarantees.
 */
import { describe, expect, it } from 'vitest';
import {
	ajaxError,
	createBattleEnv,
	createGameMasterEnv,
	createLegacyEnv,
	DEFAULT_SETTINGS,
	installFakeTimers,
	syntheticGameMaster
} from '@harness';

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
		expect(env.get('settings')).toEqual(DEFAULT_SETTINGS);
		expect(env.get('get')).toBe(false);
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

	it('stubs the third-party globals the legacy code assumes exist', () => {
		const env = createLegacyEnv({ jquery: false });
		expect(typeof env.get('gtag')).toBe('function');
		expect(typeof env.get('Chart')).toBe('function');
		expect(typeof env.get('Sortable').create).toBe('function');
		env.dispose();
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
	it('populates the singleton from the real gamemaster', () => {
		const { env, gm } = createGameMasterEnv();
		expect(gm.getPokemonById('azumarill').dex).toBe(184);
		expect(gm.getMoveById('ICE_BEAM').name).toBe('Ice Beam');
		expect(env.ajax.dispatch).toBe('sync');
		env.dispose();
	});

	it('can be pointed at a synthetic gamemaster', () => {
		const { env, gm } = createGameMasterEnv({ synthetic: true });
		expect(gm.data.pokemon.map((p: any) => p.speciesId)).toEqual(['azumarill', 'machamp']);
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

describe('createBattleEnv', () => {
	it('loads the battle stack and pins Math.random', () => {
		const { env, newBattle } = createBattleEnv();
		expect(env.exec('Math.random()')).toBe(0.5);

		const battle = newBattle();
		const Pokemon = env.get('Pokemon');
		const a = new Pokemon('azumarill', 0, battle);
		const b = new Pokemon('machamp', 1, battle);
		a.initialize(true);
		b.initialize(true);
		battle.setNewPokemon(a, 0, false);
		battle.setNewPokemon(b, 1, false);
		battle.simulate();

		expect(battle.getTimeline().length).toBeGreaterThan(0);
		env.dispose();
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
});
