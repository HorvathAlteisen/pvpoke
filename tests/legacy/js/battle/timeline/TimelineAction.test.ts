/**
 * Pilot test: a top-level `class` with a method containing a `switch`.
 *
 * Every `case` of `typeToInt()` plus its fallthrough default is exercised, which is what
 * "100% branch" means for a switch under v8 coverage.
 *
 * KNOWN UNREACHABLE: lines 73 and 77 of the source are `break;` statements placed *after*
 * `return 1;` / `return 2;`. They are dead code and can never execute, so this file tops out at
 * 97.1% statements / 80% branches. Do not chase it — the frozen source cannot be edited.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createLegacyEnv, type LegacyEnv } from '@harness';

const SRC = 'static/js/battle/timeline/TimelineAction.js';

let env: LegacyEnv;
let TimelineAction: any;

beforeAll(() => {
	env = createLegacyEnv({ jquery: false });
	env.load(SRC);
	TimelineAction = env.get('TimelineAction');
});

afterAll(() => env.dispose());

describe('TimelineAction', () => {
	it('stores the constructor arguments', () => {
		const actor = 1;
		const settings = { shielded: true };
		const a = new TimelineAction('charged', actor, 7, 1, settings);

		expect(a.type).toBe('charged');
		expect(a.actor).toBe(actor);
		expect(a.turn).toBe(7);
		expect(a.value).toBe(1);
		expect(a.settings).toBe(settings);
	});

	it('starts out neither valid nor processed', () => {
		const a = new TimelineAction('fast', 0, 1, 0, {});
		expect(a.valid).toBe(false);
		expect(a.processed).toBe(false);
	});

	describe('typeToInt', () => {
		// Branch: case "fast" falls through to case "charged".
		it('returns 1 for a fast move', () => {
			expect(new TimelineAction('fast', 0, 1, 0, {}).typeToInt()).toBe(1);
		});

		it('returns 1 for a charged move', () => {
			expect(new TimelineAction('charged', 0, 1, 0, {}).typeToInt()).toBe(1);
		});

		// Branch: case "wait".
		it('returns 2 for a wait', () => {
			expect(new TimelineAction('wait', 0, 1, 0, {}).typeToInt()).toBe(2);
		});

		// Branch: no case matched — falls through to the trailing `return 0`.
		it('returns 0 for a switch', () => {
			expect(new TimelineAction('switch', 0, 1, 0, {}).typeToInt()).toBe(0);
		});

		it('returns 0 for an unrecognised type', () => {
			expect(new TimelineAction('nonsense', 0, 1, 0, {}).typeToInt()).toBe(0);
		});

		it('reads the live type property rather than a captured value', () => {
			const a = new TimelineAction('wait', 0, 1, 0, {});
			a.type = 'fast';
			expect(a.typeToInt()).toBe(1);
		});
	});
});
