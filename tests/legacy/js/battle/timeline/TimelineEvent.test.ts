/**
 * Pilot test: a frozen legacy file that is a bare top-level `class` declaration.
 *
 * `class X {}` at the top level of a classic script creates a *global lexical* binding, not a
 * property of `globalThis`. `env.ctx.TimelineEvent` is therefore `undefined`; read it with
 * `env.get('TimelineEvent')`, which evaluates the name inside the context.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createLegacyEnv, type LegacyEnv } from '@harness';

const SRC = 'static/js/battle/timeline/TimelineEvent.js';

let env: LegacyEnv;
let TimelineEvent: any;

beforeAll(() => {
	// No jQuery, no DOM, no page globals needed for a plain class.
	env = createLegacyEnv({ jquery: false });
	env.load(SRC);
	TimelineEvent = env.get('TimelineEvent');
});

afterAll(() => env.dispose());

describe('TimelineEvent', () => {
	// (That `TimelineEvent` is a lexical binding and not on `globalThis` is harness semantics,
	// covered once in harness.test.ts — not re-tested per file.)

	it('stores every constructor argument verbatim', () => {
		const actor = { id: 'azumarill' };
		const e = new TimelineEvent('faint', 'Azumarill', actor, 12000, 24, [50, 10]);

		expect(e.type).toBe('faint');
		expect(e.name).toBe('Azumarill');
		expect(e.actor).toBe(actor);
		expect(e.time).toBe(12000);
		expect(e.turn).toBe(24);
		expect(e.values).toEqual([50, 10]);
	});

	it('keeps the values array by reference when one is supplied', () => {
		const values = [1, 2];
		expect(new TimelineEvent('tap', 'x', 0, 0, 0, values).values).toBe(values);
	});

	// Branch: `values = typeof values !== "undefined" ? values : [0]` — the false arm.
	it('defaults values to [0] when the argument is omitted', () => {
		expect(new TimelineEvent('shield', 'Azumarill', 0, 500, 1).values).toEqual([0]);
	});

	// Same false arm, reached by an explicit `undefined` rather than by arity.
	it('defaults values to [0] when the argument is explicitly undefined', () => {
		expect(new TimelineEvent('shield', 'Azumarill', 0, 500, 1, undefined).values).toEqual([0]);
	});

	// Branch: `typeof values !== "undefined"` is true for null, so null is NOT replaced.
	it('does not substitute the default for a null values argument', () => {
		expect(new TimelineEvent('shield', 'Azumarill', 0, 500, 1, null).values).toBeNull();
	});

	it('gives each instance its own default values array', () => {
		const a = new TimelineEvent('faint', 'a', 0, 0, 0);
		const b = new TimelineEvent('faint', 'b', 0, 0, 0);
		a.values[0] = 99;
		expect(b.values).toEqual([0]);
	});
});
