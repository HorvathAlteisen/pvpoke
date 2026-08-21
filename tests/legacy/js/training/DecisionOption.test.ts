/**
 * Pilot test: the smallest possible legacy file — a class that is only a constructor.
 *
 * There is no conditional code here, so 100% branch coverage is reached by constructing it.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createLegacyEnv, type LegacyEnv } from '@harness';

const SRC = 'static/js/training/DecisionOption.js';

let env: LegacyEnv;
let DecisionOption: any;

beforeAll(() => {
	env = createLegacyEnv({ jquery: false });
	env.load(SRC);
	DecisionOption = env.get('DecisionOption');
});

afterAll(() => env.dispose());

describe('DecisionOption', () => {
	it('stores name and weight', () => {
		const o = new DecisionOption('FAST', 10);
		expect(o.name).toBe('FAST');
		expect(o.weight).toBe(10);
	});

	it('accepts the non-string names the AI code uses', () => {
		expect(new DecisionOption(0, 1).name).toBe(0);
		expect(new DecisionOption(true, 1).name).toBe(true);
	});

	it('does not coerce or default the weight', () => {
		const o = new DecisionOption('x', undefined);
		expect(o.weight).toBeUndefined();
		expect(Object.keys(o)).toEqual(['name', 'weight']);
	});

	it('produces independent instances', () => {
		const a = new DecisionOption('a', 1);
		const b = new DecisionOption('b', 2);
		a.weight = 99;
		expect(b.weight).toBe(2);
	});
});
