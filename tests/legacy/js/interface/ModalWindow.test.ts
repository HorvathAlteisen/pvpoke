/**
 * Pilot test: a legacy file made of top-level `function` declarations plus one `var` global,
 * whose whole job is jQuery DOM side effects.
 *
 * Patterns demonstrated here:
 *  - `function foo(){}` and `var closePrevention` ARE properties of the context global, so
 *    `env.get('closePrevention')` / `env.set('closePrevention', true)` both work (unlike
 *    `class`/`const`, which are lexical — see TimelineEvent.test.ts).
 *  - `installFakeTimers(env)` instead of `vi.useFakeTimers()`, because the legacy code resolves
 *    `setTimeout` from the JSDOM window, which vitest's fake timers do not patch.
 *  - `env.hover(...)` to drive jQuery's `:hover` selector, which JSDOM cannot match.
 *  - a fresh env per test, so each test starts from a clean document and clean handlers.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createLegacyEnv, installFakeTimers, type FakeTimers, type LegacyEnv } from '@harness';

const SRC = 'static/js/interface/ModalWindow.js';

let env: LegacyEnv;
let timers: FakeTimers;
let $: any;

const modalWindow = (header: any, content: any) => env.get('modalWindow')(header, content);
const closeModalWindow = () => env.get('closeModalWindow')();
const setModalClosePrevention = (ms: number) => env.get('setModalClosePrevention')(ms);

beforeEach(() => {
	env = createLegacyEnv({
		html: '<div class="template hide">Hello <b>world</b></div>'
	});
	timers = installFakeTimers(env);
	env.load(SRC);
	$ = env.$;
});

afterEach(() => {
	timers.restore();
	env.dispose();
});

describe('closePrevention global', () => {
	it('starts false', () => {
		expect(env.get('closePrevention')).toBe(false);
	});
});

describe('modalWindow', () => {
	it('appends a modal skeleton to the body', () => {
		modalWindow('Title', '.template');

		const $modal = $('body > .modal');
		expect($modal.length).toBe(1);
		expect($modal.find('.modal-container').length).toBe(1);
		expect($modal.find('.modal-close').length).toBe(1);
		expect($modal.find('.modal-header').html()).toBe('Title');
	});

	it('accepts HTML markup in the header', () => {
		modalWindow('<h3>Pick a Pokemon</h3>', '.template');
		expect($('.modal-header h3').length).toBe(1);
	});

	it('clones the content instead of moving it, and unhides the clone', () => {
		modalWindow('Title', '.template');

		// Source element is still in place and still hidden.
		expect($('body > .template').length).toBe(1);
		expect($('body > .template').hasClass('hide')).toBe(true);

		const $clone = $('.modal-content > .template');
		expect($clone.length).toBe(1);
		expect($clone.hasClass('hide')).toBe(false);
		expect($clone.find('b').text()).toBe('world');
	});

	it('accepts a jQuery object as content', () => {
		modalWindow('Title', $('.template'));
		expect($('.modal-content > .template').length).toBe(1);
	});

	it('stacks modals, newest last', () => {
		modalWindow('First', '.template');
		modalWindow('Second', '.template');

		expect($('.modal').length).toBe(2);
		expect($('.modal').last().find('.modal-header').html()).toBe('Second');
	});
});

describe('modal close handlers', () => {
	it('closes when the X is clicked', () => {
		modalWindow('Title', '.template');
		$('.modal-close').trigger('click');
		expect($('.modal').length).toBe(0);
	});

	it('closes when a .no decline button inside the modal is clicked', () => {
		env.html('<div class="template hide"><button class="no">No</button></div>');
		modalWindow('Confirm?', '.template');

		$('.modal .no').trigger('click');
		expect($('.modal').length).toBe(0);
	});

	// Branch: `$(".modal-container:hover, option:hover, input:focus").length == 0` — true arm.
	it('closes on a backdrop click when nothing is hovered or focused', () => {
		modalWindow('Title', '.template');
		$('.modal').trigger('click');
		expect($('.modal').length).toBe(0);
	});

	// Branch: same condition — false arm via `input:focus`.
	it('stays open on a backdrop click while an input inside it has focus', () => {
		env.html('<div class="template hide"><input type="text" /></div>');
		modalWindow('Title', '.template');

		env.document.querySelector('.modal input').focus();
		expect($('input:focus').length).toBe(1);

		$('.modal').trigger('click');
		expect($('.modal').length).toBe(1);
	});

	// Branch: same condition — false arm via `.modal-container:hover`. JSDOM has no pointer, so
	// the harness supplies a `:hover` pseudo driven by env.hover().
	it('stays open on a backdrop click while the modal container is hovered', () => {
		modalWindow('Title', '.template');
		env.hover('.modal-container');

		$('.modal').trigger('click');
		expect($('.modal').length).toBe(1);

		env.hover(null);
		$('.modal').trigger('click');
		expect($('.modal').length).toBe(0);
	});
});

describe('closeModalWindow', () => {
	// Branch: `if(! closePrevention)` — true arm.
	it('removes only the topmost modal', () => {
		modalWindow('First', '.template');
		modalWindow('Second', '.template');

		closeModalWindow();

		expect($('.modal').length).toBe(1);
		expect($('.modal').last().find('.modal-header').html()).toBe('First');
	});

	// Branch: `if(! closePrevention)` — false arm.
	it('does nothing while close prevention is on', () => {
		modalWindow('Title', '.template');
		env.set('closePrevention', true);

		closeModalWindow();

		expect($('.modal').length).toBe(1);
	});

	it('leaves the document exactly as it found it when there is no modal to close', () => {
		const before = env.document.body.innerHTML;

		modalWindow('Title', '.template');
		closeModalWindow();
		expect(env.document.body.innerHTML).toBe(before);

		// Second close: nothing left to remove, and nothing else may be removed either.
		closeModalWindow();
		expect(env.document.body.innerHTML).toBe(before);
		expect($('body > .template').length).toBe(1);
	});
});

describe('setModalClosePrevention', () => {
	it('blocks closing until the timeout elapses', () => {
		modalWindow('Title', '.template');
		setModalClosePrevention(500);

		expect(env.get('closePrevention')).toBe(true);

		timers.tick(499);
		closeModalWindow();
		expect($('.modal').length).toBe(1);

		timers.tick(1);
		expect(env.get('closePrevention')).toBe(false);

		closeModalWindow();
		expect($('.modal').length).toBe(0);
	});

	// Frozen-behaviour quirk, pinned rather than fixed: setModalClosePrevention() never clears the
	// timeout it is replacing, so re-arming does NOT extend prevention — the *earlier* timeout
	// clears the flag on its original schedule and the later one is a no-op repeat.
	it('does not extend prevention when re-armed: the earlier timeout still clears the flag', () => {
		modalWindow('Title', '.template');

		setModalClosePrevention(100);
		timers.tick(50);
		setModalClosePrevention(100); // asks for prevention until t=150

		timers.tick(50); // t=100 — the FIRST timeout fires
		expect(env.get('closePrevention')).toBe(false);

		// The observable consequence: the modal is closeable 50 ms before the re-arm asked for.
		closeModalWindow();
		expect($('.modal').length).toBe(0);

		// The orphaned second timeout still fires at t=150 and is harmless.
		timers.tick(50);
		expect(env.get('closePrevention')).toBe(false);
	});
});
