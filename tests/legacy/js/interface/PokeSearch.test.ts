/**
 * Pilot test: a closure-heavy interface file, driven through `INTERFACE_STACK`.
 *
 * `static/js/interface/PokeSearch.js` is `var pokeSearch = new function(){ ... }`: two public
 * methods and, below them, five jQuery handlers bound at load time over private `searchTimeout` /
 * `searchStr` / `searchList` / `$target` / `context`. None of that private state is reachable, so
 * every test here drives a DOM event and asserts on a DOM effect or on an injected collaborator.
 *
 * This file is the worked example CONVENTIONS §5f points at. Building the env was literally:
 *
 *   1. `createBattleEnv({ html: PAGE })`, `env.load('static/js/interface/PokeSearch.js')`,
 *      trigger a click on `a.search-info` → `ReferenceError: modalWindow is not defined`.
 *   2. `modalWindow` lives in `static/js/interface/ModalWindow.js`, which is INTERFACE_STACK[0],
 *      and PokeSearch.js is INTERFACE_STACK[1] → load `INTERFACE_STACK.slice(0, 2)` instead.
 *   3. Re-run → `TypeError: Cannot read properties of null (reading 'getCP')` from
 *      `GameMaster.generatePokemonListFromSearchString`, which wants the battle the file's own
 *      `setBattle()` supplies → call it.
 *   4. Re-run → `ReferenceError: InterfaceMaster is not defined`, but only on the
 *      `alternative-search` path. `InterfaceMaster` is an undeclared name, so `env.set()` fakes it.
 *
 * Also demonstrated:
 *  - `env.resize()` for the two width branches, called BEFORE `load()` for `screen.width` (which
 *    the file reads once, at load time) and before the event for `$(window).width()`.
 *  - `installFakeTimers(env)` for the keyup debounce.
 *  - `env.hover('.modal-container')` to stop ModalWindow's backdrop handler from eating the very
 *    clicks under test — a click inside the modal bubbles up to `.modal`, and JSDOM has no pointer.
 *  - `.show()`/`.hide()` asserted through `el.style.display`, never through `:visible` (§0).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	createBattleEnv,
	INTERFACE_STACK,
	installFakeTimers,
	syntheticGameMaster,
	type FakeTimers,
	type LegacyEnv
} from '@harness';

const PAGE = `
	<div class="poke-search-container">
		<input class="poke-search" context="ranking-search" type="text" />
		<a class="search-info" context="ranking">?</a>
		<a class="search-traits" href="#">traits</a>
	</div>
	<div class="rankings-container">
		<div class="rank" data="azumarill">Azumarill</div>
		<div class="rank" data="machamp">Machamp</div>
		<div class="rank">header row with no data attribute</div>
	</div>
	<div class="sandbox-search-strings hide"><a class="nickname-list" href="#">Nicknames</a></div>
	<div class="search-nicknames hide"><table><tbody></tbody></table></div>
	<div class="search-traits-selector hide">
		<div class="traits"></div>
		<a class="button search">Search</a>
	</div>
`;

/** Only the first two entries of INTERFACE_STACK: ModalWindow.js, then PokeSearch.js itself. */
const STACK = INTERFACE_STACK.slice(0, 2);

let env: LegacyEnv;
let timers: FakeTimers | null = null;

interface BootOptions {
	html?: string;
	width?: number;
	gamemaster?: any;
	fakeTimers?: boolean;
}

function boot(opts: BootOptions = {}) {
	const { html = PAGE, width = 1280, gamemaster, fakeTimers = false } = opts;
	const built = createBattleEnv({ html, gamemaster });
	env = built.env;
	if (fakeTimers) timers = installFakeTimers(env);
	// `screen.width <= 768` is evaluated once, at load time — resize first or the mobile focus
	// handler is bound (JSDOM reports screen.width as 0, i.e. permanently "mobile").
	env.resize(width, width >= 768 ? 900 : 812);
	env.load(...STACK);

	const pokeSearch = env.get('pokeSearch');
	const battle = built.newBattle();
	pokeSearch.setBattle(battle);
	return { ...built, pokeSearch, battle, $: env.$ };
}

afterEach(() => {
	timers?.restore();
	timers = null;
	env.dispose();
});

/** `.rank` rows in document order, by the inline display jQuery's show()/hide() wrote. */
const rankDisplay = () =>
	[...env.document.querySelectorAll('.rank')].map((el: any) => el.style.display);

describe('the pokeSearch singleton', () => {
	it('exposes exactly setBattle and getSearchList, and starts with an empty list', () => {
		const { pokeSearch } = boot();
		expect(Object.keys(pokeSearch)).toEqual(['setBattle', 'getSearchList']);
		expect(pokeSearch.getSearchList()).toEqual([]);
	});
});

describe('the ranking-search keyup handler', () => {
	// Branch: `$(window).width() >= 768` — the desktop arm, a 25 ms debounce.
	it('debounces for 25 ms on desktop, then filters the rank list', () => {
		const { pokeSearch, $ } = boot({ fakeTimers: true });

		$('.poke-search').val('machamp').trigger('keyup');
		timers!.tick(24);
		expect(pokeSearch.getSearchList()).toEqual([]);
		expect(rankDisplay()).toEqual(['', '', '']);

		timers!.tick(1);
		expect(pokeSearch.getSearchList()).toEqual(['machamp']);
		// Azumarill is hidden; Machamp and the row with no `data` attribute stay shown.
		expect(rankDisplay()).toEqual(['none', '', '']);
	});

	// Branch: `$(window).width() >= 768` — the mobile arm, a 250 ms debounce.
	it('debounces for 250 ms on mobile', () => {
		const { pokeSearch, $ } = boot({ width: 375, fakeTimers: true });

		$('.poke-search').val('machamp').trigger('keyup');
		timers!.tick(249);
		expect(pokeSearch.getSearchList()).toEqual([]);

		timers!.tick(1);
		expect(pokeSearch.getSearchList()).toEqual(['machamp']);
	});

	// `window.clearTimeout(searchTimeout)` at the top of the handler.
	it('cancels the pending query when another key arrives, and searches only the last string', () => {
		const { pokeSearch, $ } = boot({ fakeTimers: true });

		$('.poke-search').val('mach').trigger('keyup');
		timers!.tick(20);
		$('.poke-search').val('azumarill').trigger('keyup');
		timers!.tick(20);
		expect(pokeSearch.getSearchList()).toEqual([]); // the first query never ran

		timers!.tick(5);
		expect(pokeSearch.getSearchList()).toEqual(['azumarill']);
		expect(rankDisplay()).toEqual(['', 'none', '']);
		expect(timers!.pending()).toBe(0);
	});

	it('shows every row again when the search string is cleared', () => {
		const { $ } = boot({ fakeTimers: true });

		$('.poke-search').val('machamp').trigger('keyup');
		timers!.runAll();
		expect(rankDisplay()).toEqual(['none', '', '']);

		$('.poke-search').val('').trigger('keyup');
		timers!.runAll();
		expect(rankDisplay()).toEqual(['', '', '']);
	});

	it('searches by type as well as by species name', () => {
		const { pokeSearch, $ } = boot({ fakeTimers: true });

		$('.poke-search').val('fighting').trigger('keyup');
		timers!.runAll();

		expect(pokeSearch.getSearchList()).toEqual(['machamp']);
		expect(rankDisplay()).toEqual(['none', '', '']);
	});

	// Branch: `if(context == "alternative-search") { ...; return; }` — hands off to the page
	// interface and never touches the rank rows.
	it('delegates to InterfaceMaster.displayAlternatives for an alternative-search input', () => {
		const html = PAGE.replace("context='ranking-search'", "context='alternative-search'").replace(
			'context="ranking-search"',
			'context="alternative-search"'
		);
		const { pokeSearch, $ } = boot({ html, fakeTimers: true });

		const displayAlternatives = vi.fn();
		// Undeclared global → env.set() works (unlike a `const`/`class` binding).
		env.set('InterfaceMaster', { getInstance: () => ({ displayAlternatives }) });

		$('.poke-search').val('machamp').trigger('keyup');
		timers!.runAll();

		expect(displayAlternatives).toHaveBeenCalledTimes(1);
		expect(displayAlternatives).toHaveBeenCalledWith(['machamp']);
		expect(pokeSearch.getSearchList()).toEqual(['machamp']);
		expect(rankDisplay()).toEqual(['', '', '']); // returned before the row loop
	});

	it('ignores keyup on an input with some other context', () => {
		const html = PAGE.replace('context="ranking-search"', 'context="pokeselect"');
		const { pokeSearch, $ } = boot({ html, fakeTimers: true });

		$('.poke-search').val('machamp').trigger('keyup');
		expect(timers!.pending()).toBe(0);
		timers!.runAll();
		expect(pokeSearch.getSearchList()).toEqual([]);
	});
});

// Branch: `if(screen.width <= 768)` guards whether the focus handler is bound at all. jQuery's
// `.animate()` completes synchronously here because the harness sets `$.fx.off` (see §8) — with
// real effects the scroll would be driven off requestAnimationFrame and never land in-test.
describe('the mobile focus handler', () => {
	it('scrolls the search box into view on focus when the screen is narrow', () => {
		const { $ } = boot({ width: 375 });
		env.document.documentElement.scrollTop = 500;

		$('.poke-search').trigger('focus');

		// $target.offset().top is 0 in JSDOM, so the target scroll position is 0 - 65.
		expect(env.document.documentElement.scrollTop).toBe(-65);
	});

	it('is not bound at all on a wide screen', () => {
		const { $ } = boot({ width: 1280 });
		env.document.documentElement.scrollTop = 500;

		$('.poke-search').trigger('focus');

		expect(env.document.documentElement.scrollTop).toBe(500);
	});
});

describe('the search-info link', () => {
	// Branch: `if($(this).attr("context") != "pokeselect")` — the true arm.
	it('opens the search strings modal', () => {
		const { $ } = boot();
		$('a.search-info').trigger('click');

		expect($('.modal').length).toBe(1);
		expect($('.modal .modal-header').html()).toBe('Search Strings');
		// modalWindow clones the source element and unhides the clone.
		expect($('.modal .sandbox-search-strings').hasClass('hide')).toBe(false);
		expect($('body > .sandbox-search-strings').hasClass('hide')).toBe(true);
	});

	// Branch: the false arm — inside a PokeSelect the link is handled elsewhere.
	it('does nothing for a link whose context is pokeselect', () => {
		const html = PAGE.replace('context="ranking"', 'context="pokeselect"');
		const { $ } = boot({ html });

		$('a.search-info').trigger('click');
		expect($('.modal').length).toBe(0);
	});

	it('lists nicknamed Pokemon, skipping shadow and mega forms', () => {
		const data = syntheticGameMaster();
		data.pokemon[0].nicknames = ['azu', 'marill'];
		const clone = (over: any) => ({ ...structuredClone(data.pokemon[0]), ...over });
		data.pokemon.push(clone({ speciesId: 'azumarill_shadow', speciesName: 'Azumarill (Shadow)' }));
		data.pokemon.push(clone({ speciesId: 'mega_azumarill', speciesName: 'Mega Azumarill' }));

		const { $ } = boot({ gamemaster: data });

		$('a.search-info').trigger('click');
		// Without a hover target, the click below bubbles to `.modal` and ModalWindow's backdrop
		// handler closes the modal we are about to inspect.
		env.hover('.modal-container');
		$('.modal a.nickname-list').trigger('click');

		expect($('.modal').length).toBe(2);
		expect($('.modal').last().find('.modal-header').html()).toBe('Pokemon Nicknames');

		const rows = $('.modal .search-nicknames tbody tr');
		expect(rows.length).toBe(1);
		expect(rows.find('td').eq(0).text()).toBe('Azumarill');
		expect(rows.find('td').eq(1).text()).toBe('azu, marill');
	});

	it('lists nothing when no Pokemon has nicknames', () => {
		const { $ } = boot();
		$('a.search-info').trigger('click');
		env.hover('.modal-container');
		$('.modal a.nickname-list').trigger('click');

		expect($('.modal').last().find('.modal-header').html()).toBe('Pokemon Nicknames');
		expect($('.modal .search-nicknames tbody tr').length).toBe(0);
	});
});

describe('the search-traits link', () => {
	function openTraits() {
		const booted = boot();
		booted.$('a.search-traits').trigger('click');
		env.hover('.modal-container');
		return booted;
	}

	it('renders one toggle per trait, title-cased and signed', () => {
		const { $ } = openTraits();

		expect($('.modal .modal-header').html()).toBe('Search Traits');
		expect($('.modal .traits > div').length).toBe(2);
		expect($('.modal .traits .pro').attr('value')).toBe('bulky');
		expect($('.modal .traits .pro').text()).toBe('+ Bulky');
		expect($('.modal .traits .con').attr('value')).toBe('glass cannon');
		expect($('.modal .traits .con').text()).toBe('- Glass Cannon');
	});

	it('preselects the traits already in the search box', () => {
		const { $ } = boot();
		$('.poke-search').val('glass cannon');
		$('a.search-traits').trigger('click');
		env.hover('.modal-container');

		expect($('.modal .traits .selected').length).toBe(1);
		expect($('.modal .traits .selected').attr('value')).toBe('glass cannon');
	});

	it('toggles a trait on and off again', () => {
		const { $ } = openTraits();

		$('.modal .traits .pro').trigger('click');
		expect($('.modal .traits .pro').hasClass('selected')).toBe(true);

		$('.modal .traits .pro').trigger('click');
		expect($('.modal .traits .pro').hasClass('selected')).toBe(false);
	});

	it('writes the selection into the search box as an &-joined query and closes the modal', () => {
		const { $ } = boot({ fakeTimers: true });
		$('.poke-search').val('glass cannon');
		$('a.search-traits').trigger('click');
		env.hover('.modal-container');

		$('.modal .traits .pro').trigger('click'); // adds "bulky" to the preselected "glass cannon"
		$('.modal .button.search').trigger('click');

		expect($('.poke-search').val()).toBe('bulky&glass cannon');
		expect($('.modal').length).toBe(0);
		// It also fires keyup, so the search is queued behind the usual debounce.
		expect(timers!.pending()).toBe(1);
	});

	it('clears the search box when the selection is emptied', () => {
		const { $ } = boot();
		$('.poke-search').val('glass cannon');
		$('a.search-traits').trigger('click');
		env.hover('.modal-container');

		$('.modal .traits .con').trigger('click'); // deselect the only preselected trait
		$('.modal .button.search').trigger('click');

		expect($('.poke-search').val()).toBe('');
	});

	// FROZEN-SOURCE BUG, pinned rather than fixed (PokeSearch.js:78): the handler assigns to the
	// bare name `pokeSearch`, which is the module's own `var pokeSearch = new function(){...}`
	// global. Opening the trait selector therefore destroys the singleton, replacing it with the
	// raw <input> element. Anything calling `pokeSearch.getSearchList()` afterwards gets undefined.
	it('overwrites the global pokeSearch singleton with the input element', () => {
		const { pokeSearch, $ } = boot();
		expect(env.get('pokeSearch')).toBe(pokeSearch);

		$('a.search-traits').trigger('click');

		expect(env.get('pokeSearch')).not.toBe(pokeSearch);
		expect(env.get('pokeSearch').tagName).toBe('INPUT');
		expect(env.get('pokeSearch').getSearchList).toBeUndefined();
	});
});
