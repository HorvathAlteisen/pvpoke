import { describe, expect, it } from 'vitest';
import { matchRewrite } from './rewrites';

/** Strip the leading slash the way the reroute hook does. */
const m = (url: string) => matchRewrite(url.replace(/^\//, ''));

describe('matchRewrite (port of src/.htaccess)', () => {
	it('rankings', () => {
		expect(m('/rankings/')).toEqual({ route: '/rankings', params: {} });
		expect(m('/rankings')).toEqual({ route: '/rankings', params: {} });
		expect(m('/rankings/1500/')).toEqual({ route: '/rankings', params: { cp: '1500' } });
		expect(m('/rankings/1500/overall/')).toEqual({
			route: '/rankings',
			params: { cp: '1500', cat: 'overall' }
		});
		expect(m('/rankings/all/1500/overall/')).toEqual({
			route: '/rankings',
			params: { cup: 'all', cp: '1500', cat: 'overall' }
		});
		expect(m('/rankings/all/1500/overall/azumarill/')).toEqual({
			route: '/rankings',
			params: { cup: 'all', cp: '1500', cat: 'overall', p: 'azumarill' }
		});
		expect(m('/rankings/1500/overall/azumarill/')).toEqual({
			route: '/rankings',
			params: { cp: '1500', cat: 'overall', p: 'azumarill' }
		});
		expect(m('/rankings/premier-classic/10000/leads/')).toEqual({
			route: '/rankings',
			params: { cup: 'premier-classic', cp: '10000', cat: 'leads' }
		});
		// param order must follow the substitution (PHP $_GET order)
		expect(Object.keys(m('/rankings/all/1500/overall/azumarill/')!.params)).toEqual([
			'cup',
			'cp',
			'cat',
			'p'
		]);
	});

	it('battle single', () => {
		expect(m('/battle/')).toEqual({ route: '/battle', params: {} });
		expect(m('/battle/1500/azumarill/medicham/11/')).toEqual({
			route: '/battle',
			params: { cp: '1500', p1: 'azumarill', p2: 'medicham', s: '11' }
		});
		expect(m('/battle/1500/azumarill/medicham/11/1-2-3/1-2/')).toEqual({
			route: '/battle',
			params: { cp: '1500', p1: 'azumarill', p2: 'medicham', s: '11', m1: '1-2-3', m2: '1-2' }
		});
		expect(m('/battle/1500/azumarill/medicham/11/1-2-3/1-2/0-0/0-0/')).toEqual({
			route: '/battle',
			params: {
				cp: '1500',
				p1: 'azumarill',
				p2: 'medicham',
				s: '11',
				m1: '1-2-3',
				m2: '1-2',
				h: '0-0',
				e: '0-0'
			}
		});
		// cp may contain a dash (level cap)
		expect(m('/battle/10000-40/dialga/mewtwo/11/0-1-2/0-1-2/')!.params.cp).toBe('10000-40');
		// species with dots/digits in the 6-segment form (the 4-segment form only allows [a-zA-Z_])
		expect(m('/battle/1500/azumarill_shadow/medicham/11/')!.params.p1).toBe('azumarill_shadow');
	});

	it('battle sandbox', () => {
		expect(m('/battle/sandbox/1500/azumarill/medicham/11/1-2/1-2/1-1/0-0/1.5/')).toEqual({
			route: '/battle',
			params: {
				cp: '1500',
				p1: 'azumarill',
				p2: 'medicham',
				s: '11',
				m1: '1-2',
				m2: '1-2',
				h: '1-1',
				e: '0-0',
				sandbox: '1',
				a: '1.5'
			}
		});
		expect(m('/battle/sandbox/1500/azumarill/medicham/11/1-2/1-2/1.5/')).toEqual({
			route: '/battle',
			params: {
				cp: '1500',
				p1: 'azumarill',
				p2: 'medicham',
				s: '11',
				m1: '1-2',
				m2: '1-2',
				sandbox: '1',
				a: '1.5'
			}
		});
	});

	it('battle multi', () => {
		expect(m('/battle/multi/')).toEqual({ route: '/battle', params: { mode: 'multi' } });
		expect(m('/battle/multi/1500/all/azumarill/11/1-2/1-2/')).toEqual({
			route: '/battle',
			params: { mode: 'multi', cp: '1500', cup: 'all', p1: 'azumarill', s: '11', m1: '1-2', cms: '1-2' }
		});
		expect(m('/battle/multi/1500/all/azumarill/11/1-2/1-2/1/0/')).toEqual({
			route: '/battle',
			params: {
				mode: 'multi',
				cp: '1500',
				cup: 'all',
				p1: 'azumarill',
				s: '11',
				m1: '1-2',
				cms: '1-2',
				h: '1',
				e: '0'
			}
		});
		expect(m('/battle/multi/1500/all/azumarill/11/1-2/1-2/1/0/great_league_meta/')).toEqual({
			route: '/battle',
			params: {
				mode: 'multi',
				cp: '1500',
				cup: 'all',
				p1: 'azumarill',
				s: '11',
				m1: '1-2',
				cms: '1-2',
				h: '1',
				e: '0',
				g1: 'great_league_meta'
			}
		});
		expect(m('/battle/multi/1500/all/azumarill/11/1-2/1-2/my_group/')).toEqual({
			route: '/battle',
			params: {
				mode: 'multi',
				cp: '1500',
				cup: 'all',
				p1: 'azumarill',
				s: '11',
				m1: '1-2',
				cms: '1-2',
				g1: 'my_group'
			}
		});
		expect(m('/battle/multi/1500/all/azumarill/11/1-2/')).toEqual({
			route: '/battle',
			params: { mode: 'multi', cp: '1500', cup: 'all', p1: 'azumarill', s: '11', cms: '1-2' }
		});
	});

	it('battle matrix', () => {
		expect(m('/battle/matrix/')).toEqual({ route: '/battle', params: { mode: 'matrix' } });
		expect(m('/battle/matrix/1500/a,b/c,d/11')).toEqual({
			route: '/battle',
			params: { mode: 'matrix', cp: '1500', matrix1: 'a,b', matrix2: 'c,d', s: '11' }
		});
		expect(m('/battle/matrix/1500/azumarill-1-2,medicham/skarmory/')).toEqual({
			route: '/battle',
			params: { mode: 'matrix', cp: '1500', matrix1: 'azumarill-1-2,medicham', matrix2: 'skarmory' }
		});
	});

	it('team builder', () => {
		expect(m('/team-builder/')).toEqual({ route: '/team-builder', params: {} });
		expect(m('/team-builder/all/1500/azumarill/1-2/')).toEqual({
			route: '/team-builder',
			params: { cup: 'all', cp: '1500', p1: 'azumarill', m1: '1-2' }
		});
		expect(m('/team-builder/all/1500/azumarill/medicham/1-2/0-1/')).toEqual({
			route: '/team-builder',
			params: { cup: 'all', cp: '1500', p1: 'azumarill', p2: 'medicham', m1: '1-2', m2: '0-1' }
		});
		expect(m('/team-builder/all/1500/azumarill/medicham/skarmory/1-2/0-1/0-2/')).toEqual({
			route: '/team-builder',
			params: {
				cup: 'all',
				cp: '1500',
				p1: 'azumarill',
				p2: 'medicham',
				p3: 'skarmory',
				m1: '1-2',
				m2: '0-1',
				m3: '0-2'
			}
		});
		expect(m('/team-builder/all/1500/azumarill,medicham/')).toEqual({
			route: '/team-builder',
			params: { cup: 'all', cp: '1500', t: 'azumarill,medicham' }
		});
		expect(m('/team-builder/all/10000-40/azumarill-1-2-3,medicham-0-1-2/')).toEqual({
			route: '/team-builder',
			params: { cup: 'all', cp: '10000-40', t: 'azumarill-1-2-3,medicham-0-1-2' }
		});
		// mod_rewrite matches the URL-decoded path: %2C is a comma
		expect(m('/team-builder/all/1500/azumarill-m-0-1-2%2Cmedicham-m-1-2-0/')).toEqual({
			route: '/team-builder',
			params: { cup: 'all', cp: '1500', t: 'azumarill-m-0-1-2,medicham-m-1-2-0' }
		});
	});

	it('attack cmp chart', () => {
		expect(m('/attack-cmp-chart/')).toEqual({ route: '/attack-cmp-chart', params: {} });
		expect(m('/attack-cmp-chart/all/1500/')).toEqual({
			route: '/attack-cmp-chart',
			params: { cup: 'all', cp: '1500' }
		});
		expect(m('/attack-cmp-chart/all/1500/azumarill/')).toEqual({
			route: '/attack-cmp-chart',
			params: { cup: 'all', cp: '1500', p: 'azumarill' }
		});
	});

	it('train', () => {
		expect(m('/train/')).toBeNull();
		expect(m('/train/analysis/')).toEqual({ route: '/train/analysis', params: {} });
		expect(m('/train/analysis/all/1500/')).toEqual({
			route: '/train/analysis',
			params: { cup: 'all', cp: '1500' }
		});
		expect(m('/train/editor/')).toEqual({ route: '/train/editor', params: {} });
		// train/analytics.php has no rule
		expect(m('/train/analytics.php')).toBeNull();
	});

	it('gm editor', () => {
		expect(m('/gm-editor/')).toBeNull();
		expect(m('/gm-editor/pokemon/')).toEqual({ route: '/gm-editor/edit', params: { c: 'pokemon' } });
		expect(m('/gm-editor/moves/')).toEqual({ route: '/gm-editor/edit', params: { c: 'moves' } });
		expect(m('/gm-editor/pokemon/azumarill/')).toEqual({
			route: '/gm-editor/pokemon',
			params: { p: 'azumarill' }
		});
		expect(m('/gm-editor/pokemon/new/')).toEqual({ route: '/gm-editor/pokemon', params: { p: 'new' } });
		expect(m('/gm-editor/moves/ICE_BEAM/')).toEqual({ route: '/gm-editor/move', params: { m: 'ICE_BEAM' } });
	});

	it('tera', () => {
		expect(m('/tera/')).toBeNull();
		expect(m('/tera/charizard/')).toEqual({ route: '/tera', params: { p: 'charizard' } });
		expect(m('/tera/charizard/fire/')).toEqual({ route: '/tera', params: { p: 'charizard', t: 'fire' } });
		expect(m('/tera/charizard/fire/water/')).toEqual({
			route: '/tera',
			params: { p: 'charizard', t: 'fire', a: 'water' }
		});
		expect(m('/tera/charizard/fire/water/1/')).toEqual({
			route: '/tera',
			params: { p: 'charizard', t: 'fire', a: 'water', tr: '1' }
		});
	});

	it('moves, contact, privacy, settings, custom-rankings', () => {
		expect(m('/moves/')).toEqual({ route: '/moves', params: {} });
		expect(m('/moves/fast/')).toEqual({ route: '/moves', params: { mode: 'fast' } });
		expect(m('/moves/charged/')).toEqual({ route: '/moves', params: { mode: 'charged' } });
		expect(m('/contact/')).toEqual({ route: '/contact', params: {} });
		expect(m('/contact')).toEqual({ route: '/contact', params: {} });
		expect(m('/privacy/')).toEqual({ route: '/privacy', params: {} });
		expect(m('/settings/')).toEqual({ route: '/settings', params: {} });
		expect(m('/custom-rankings/')).toEqual({ route: '/custom-rankings', params: {} });
	});

	it('articles and rss', () => {
		expect(m('/articles/')).toBeNull();
		expect(m('/articles/community-day/25-09-flabebe/')).toEqual({
			route: '/articles/community-day/25-09-flabebe',
			params: {}
		});
		expect(m('/articles/strategy/tournament-guide/')).toEqual({
			route: '/articles/strategy/tournament-guide',
			params: {}
		});
		expect(m('/rss/')).toEqual({ route: '/rss', params: {} });
	});

	it('paths that must not match', () => {
		expect(m('/')).toBeNull();
		expect(m('/js/Main.js')).toBeNull();
		expect(m('/js/interface/MovesInterface.js')).toBeNull();
		expect(m('/css/style.css')).toBeNull();
		expect(m('/data/gamemaster.min.json')).toBeNull();
		expect(m('/data/rankings/all/overall/rankings-1500.json')).toBeNull();
		expect(m('/pokedex.php')).toBeNull();
		expect(m('/ranker.php')).toBeNull();
		expect(m('/rss/feed.xml')).toBeNull();
		expect(m('/articles/articles.json')).toBeNull();
		expect(m('/img/themes/sunflower/favicon.png')).toBeNull();
	});

	it('preserves mod_rewrite quirks (unanchored starts, tolerant tails)', () => {
		// `battle.?$` is not anchored, so anything ending in "battle" + one char matches
		expect(m('/foo/battle/')).toEqual({ route: '/battle', params: {} });
		// `.*$` tails swallow trailing garbage
		expect(m('/rankings/1500/overall/azumarill/extra/stuff')).toEqual({
			route: '/rankings',
			params: { cp: '1500', cat: 'overall', p: 'azumarill' }
		});
		// rankings cp is \d+ only: `^rankings/(\d+).*$` swallows the level cap (cp=10000), like Apache
		expect(m('/rankings/10000-40/')).toEqual({ route: '/rankings', params: { cp: '10000' } });
	});
});
