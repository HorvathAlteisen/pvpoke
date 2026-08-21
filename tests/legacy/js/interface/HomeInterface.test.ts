/**
 * Pilot test: the singleton module pattern
 * `const InterfaceMaster = (function(){ let instance; class InterfaceMaster {...}; return {...} })()`.
 *
 * Patterns demonstrated here:
 *  - `const InterfaceMaster` is a *lexical* global: read it with `env.get(...)`, and note that
 *    `env.set('InterfaceMaster', ...)` could NOT override it.
 *  - the two collaborators it reaches for (`RSS`, `GameMaster`) are plain undeclared globals, so
 *    they can be stubbed with `env.set(...)` before the file is loaded. That keeps this test
 *    about HomeInterface instead of about RSSReader.js and GameMaster.js.
 *  - the singleton is per-env, so each `instance ||` branch needs its own env.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLegacyEnv, type LegacyEnv } from '@harness';

const SRC = 'static/js/interface/HomeInterface.js';

const PAGE = `
	<div class="feed-container">
		<button class="feed-expand">Expand</button>
		<div class="feed"></div>
	</div>
`;

let env: LegacyEnv;
let rss: any;
let gm: any;

function boot(html = PAGE) {
	env = createLegacyEnv({ html });
	rss = {
		feedToObjects: vi.fn(() => []),
		generateItemHTML: vi.fn((item: any) => env.$(`<div class="news-item">${item.title}</div>`))
	};
	gm = { data: { pokemon: [] } };
	env.set('RSS', { getInstance: vi.fn(() => rss) });
	env.set('GameMaster', { getInstance: vi.fn(() => gm) });
	env.load(SRC);
	return env.get('InterfaceMaster');
}

afterEach(() => env.dispose());

describe('InterfaceMaster.getInstance', () => {
	// Branch: `instance = instance || new InterfaceMaster()` — the `undefined` (construct) arm.
	it('constructs on the first call and wires up its collaborators', () => {
		const IM = boot();
		const i = IM.getInstance();

		expect(i.rss).toBe(rss);
		expect(i.gm).toBe(gm);
		expect(env.get('RSS').getInstance).toHaveBeenCalledTimes(1);
		expect(env.get('GameMaster').getInstance).toHaveBeenCalledTimes(1);
	});

	// Branch: `instance || ...` — the cached arm.
	it('returns the same instance on later calls without reconstructing', () => {
		const IM = boot();
		const first = IM.getInstance();
		const second = IM.getInstance();

		expect(second).toBe(first);
		expect(env.get('RSS').getInstance).toHaveBeenCalledTimes(1);
	});

	it('exposes only getInstance', () => {
		const IM = boot();
		expect(Object.keys(IM)).toEqual(['getInstance']);
	});

	// (`InterfaceMaster` being a lexical binding rather than a property of the context global is
	// harness semantics, covered once in harness.test.ts — not re-tested per file.)
});

describe('initUI', () => {
	it('binds the feed-expand button on construction', () => {
		const IM = boot();
		IM.getInstance();

		env.$('button.feed-expand').trigger('click');

		expect(env.$('.feed-container').hasClass('expanded')).toBe(true);
	});

	it('toggles the expanded class off again on a second click', () => {
		const IM = boot();
		IM.getInstance();

		env.$('button.feed-expand').trigger('click');
		env.$('button.feed-expand').trigger('click');

		expect(env.$('.feed-container').hasClass('expanded')).toBe(false);
	});

	it('resets the feed scroll position', () => {
		const IM = boot();
		IM.getInstance();

		const feed = env.document.querySelector('.feed');
		feed.scrollTop = 120;
		env.$('button.feed-expand').trigger('click');

		expect(feed.scrollTop).toBe(0);
	});

	// Branch: every initUI() selector misses. The constructor still has to complete and wire up
	// its collaborators, and it must not synthesise the markup it did not find.
	it('still constructs and wires collaborators when the home page markup is absent', () => {
		const IM = boot('<div></div>');
		const i = IM.getInstance();

		expect(i.rss).toBe(rss);
		expect(i.gm).toBe(gm);
		expect(env.$('.feed-container').length).toBe(0);
		expect(env.$('.feed').length).toBe(0);
		expect(env.document.body.innerHTML).toBe('<div></div>');
	});
});

describe('displayRSSFeed', () => {
	it('renders one news item per feed entry into .feed', () => {
		const IM = boot();
		const i = IM.getInstance();

		const items = [{ title: 'One' }, { title: 'Two' }];
		rss.feedToObjects.mockReturnValue(items);

		const xml = new env.window.DOMParser().parseFromString('<rss></rss>', 'text/xml');
		i.displayRSSFeed(xml);

		expect(rss.feedToObjects).toHaveBeenCalledWith(xml);
		expect(rss.generateItemHTML).toHaveBeenCalledTimes(2);
		expect(rss.generateItemHTML.mock.calls.map((c: any[]) => c[0])).toEqual(items);
		expect(env.$('.feed .news-item').length).toBe(2);
		expect(env.$('.feed').text().replace(/\s+/g, '')).toBe('OneTwo');
	});

	it('appends nothing for an empty feed', () => {
		const IM = boot();
		const i = IM.getInstance();

		i.displayRSSFeed(null);

		expect(rss.generateItemHTML).not.toHaveBeenCalled();
		expect(env.$('.feed').children().length).toBe(0);
	});

	it('appends to an existing feed rather than replacing it', () => {
		const IM = boot('<div class="feed"><div class="old"></div></div>');
		const i = IM.getInstance();
		rss.feedToObjects.mockReturnValue([{ title: 'New' }]);

		i.displayRSSFeed(null);

		expect(env.$('.feed').children().length).toBe(2);
		expect(env.$('.feed').children().first().hasClass('old')).toBe(true);
	});
});
