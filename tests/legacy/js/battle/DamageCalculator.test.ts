/**
 * Pilot test: a frozen file of pure `static` methods, and the demonstration of the technique the
 * conventions ask for everywhere else — **small hand-built inputs whose expected output can be
 * computed by hand**.
 *
 * Patterns demonstrated here:
 *  - `class DamageCalculator {}` is a global *lexical* binding, so `env.get('DamageCalculator')`.
 *  - a hand-built `attacker`/`defender` is enough for the arithmetic branches: `damage()` only
 *    ever reads `index`, `activeFormId`, `typeEffectiveness`, `getEffectiveStat()`,
 *    `getFormStats()` and `getStatBuffMultiplier()`. Building those by hand with round numbers
 *    (attack 100, defense 100, power 100) is what makes every expected value below a number you
 *    can check with a calculator rather than a snapshot of whatever the code happened to return.
 *  - the *synthetic* gamemaster (the default for `createBattleEnv`) for the end-to-end cases, so
 *    the damage numbers stay fixed even when `static/data/gamemaster.json` is recompiled.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createBattleEnv, type LegacyEnv } from '@harness';

// The literal constants from `static/js/battle/DamageCalculator.js`, restated here so the
// arithmetic in each test is self-contained. `BONUS` is deliberately NOT 1.3 — see the first test.
const BONUS = 1.2999999523162841796875;
const STAB = 1.2000000476837158203125;
const SUPER_EFFECTIVE = 1.60000002384185791015625;
const RESISTED = 0.625;
const DOUBLE_RESISTED = 0.390625;

let env: LegacyEnv;
let DC: any;
let newBattle: () => any;
let Pokemon: any;

beforeAll(() => {
	// createBattleEnv loads DamageCalculator.js as part of BATTLE_STACK. Loading it a second
	// time would throw on the `class` redeclaration.
	({ env, newBattle } = createBattleEnv());
	DC = env.get('DamageCalculator');
	Pokemon = env.get('Pokemon');
});

afterAll(() => env.dispose());

/** A stand-in fighter: attack 100, defense 100, no buffs, no form, everything neutral. */
function fighter(over: Record<string, any> = {}): any {
	const stats = { atk: 100, def: 100, ...(over.stats ?? {}) };
	return {
		index: 0,
		activeFormId: 'none',
		shadowAtkMult: 1,
		shadowDefMult: 1,
		formChange: null,
		typeEffectiveness: { water: 1, ice: 1, fighting: 1 },
		getEffectiveStat: (i: number) => (i === 0 ? stats.atk : stats.def),
		getStatBuffMultiplier: () => 1,
		getFormStats: () => ({ atk: 0, def: 0, hp: 0 }),
		...over
	};
}

/** A stand-in move: power 100, no STAB, no energy either way. */
const move = (over: Record<string, any> = {}) => ({
	type: 'water',
	power: 100,
	stab: 1,
	energy: 0,
	energyGain: 0,
	...over
});

describe('damage', () => {
	// 100 * 1 * (100/100) * 1 * 1 * 0.5 * 1.2999999523162841796875 = 64.99999761581421
	// floor(...) + 1 = 65. With a plain 1.3 the product is exactly 65 and the answer would be 66,
	// so this single assertion pins that the frozen BONUS constant is used verbatim.
	it('floors the product and adds one, using the exact BONUS constant rather than 1.3', () => {
		expect(DC.damage(fighter(), fighter(), move())).toBe(65);
		expect(Math.floor(100 * 0.5 * 1.3) + 1).toBe(66); // what 1.3 would have produced
	});

	// 100 * 1.2000000476837158203125 * 1 * 1 * 0.5 * BONUS = 78.0 - ε → floor 78, + 1 = 79
	it("multiplies by the move's own stab multiplier", () => {
		expect(DC.damage(fighter(), fighter(), move({ stab: STAB }))).toBe(79);
	});

	// 100 * (200/50) * 0.5 * BONUS = 259.99999... → 260
	it('scales linearly with the attack-to-defense ratio', () => {
		const attacker = fighter({ stats: { atk: 200, def: 100 } });
		const defender = fighter({ stats: { atk: 100, def: 50 } });
		expect(DC.damage(attacker, defender, move())).toBe(260);
	});

	it("reads type effectiveness off the defender's own table", () => {
		const se = fighter({ typeEffectiveness: { water: SUPER_EFFECTIVE } });
		const res = fighter({ typeEffectiveness: { water: RESISTED } });
		const imm = fighter({ typeEffectiveness: { water: DOUBLE_RESISTED } });

		expect(DC.damage(fighter(), se, move())).toBe(104); // 65 * 1.6, refloored
		expect(DC.damage(fighter(), res, move())).toBe(41); // 40.62... → 40, + 1
		expect(DC.damage(fighter(), imm, move())).toBe(26); // 25.39... → 25, + 1
	});

	// Branch: mode defaults to "simulate", so the charge argument is used as given.
	it('honours a partial charge in simulate mode', () => {
		expect(DC.damage(fighter(), fighter(), move(), 0.5)).toBe(33); // 32.49... → 32, + 1
	});

	// The `+ 1` is the floor of the whole product, so zero charge still deals 1.
	it('never deals less than one damage', () => {
		expect(DC.damage(fighter(), fighter(), move(), 0)).toBe(1);
	});

	describe('emulate mode', () => {
		const players = (ai: any) => [{ getAI: () => ai }];

		// Branch: `(mode == "emulate") && players[attacker.index]` true, `move.energyGain > 0` true.
		it('fully charges a fast move regardless of the charge passed in', () => {
			const m = move({ energyGain: 5 });
			expect(DC.damage(fighter(), fighter(), m, 0.1, 'emulate', players(false))).toBe(65);
		});

		// Branch: same guard, `energyGain > 0` false but `getAI() !== false` true.
		it('fully charges a charged move when the attacker is an AI', () => {
			expect(DC.damage(fighter(), fighter(), move(), 0.1, 'emulate', players({}))).toBe(65);
		});

		// Branch: both inner conditions false — a human player's charged move keeps its charge.
		it('leaves a human player charged move at the charge passed in', () => {
			expect(DC.damage(fighter(), fighter(), move(), 0.5, 'emulate', players(false))).toBe(33);
		});

		// Branch: `if(chargeMultiplier == 0) chargeMultiplier = 1` — the zero-damage guard.
		it('clamps a zero charge to full so an emulated move cannot deal 1', () => {
			expect(DC.damage(fighter(), fighter(), move(), 0, 'emulate', players(false))).toBe(65);
			// ...unlike simulate mode, where 0 charge really does mean 1 damage.
			expect(DC.damage(fighter(), fighter(), move(), 0)).toBe(1);
		});

		// Branch: `players[attacker.index]` undefined — the whole block is skipped.
		it('leaves the charge alone when the attacker has no player entry', () => {
			expect(DC.damage(fighter({ index: 1 }), fighter(), move(), 0.5, 'emulate', players({}))).toBe(33);
			expect(DC.damage(fighter(), fighter(), move(), 0.5, 'emulate', [])).toBe(33);
		});
	});

	describe('aegislash shield form', () => {
		const shield = (over: Record<string, any> = {}) =>
			fighter({
				activeFormId: 'aegislash_shield',
				getFormStats: (formId: string) => ({ atk: formId === 'aegislash_blade' ? 200 : 1 }),
				...over
			});

		// Branch: `case "aegislash_shield"` with `move.energy > 0` — charged attacks borrow the
		// blade form's attack stat. 100 * (200/100) * 0.5 * BONUS = 129.99... → 130.
		it('uses the blade form attack stat for a charged move', () => {
			expect(DC.damage(shield(), fighter(), move({ energy: 50 }))).toBe(130);
		});

		// Branch: the second switch — a fast move in shield form is hard-coded to 1 damage.
		it('deals exactly one damage with a fast move', () => {
			expect(DC.damage(shield(), fighter(), move({ energyGain: 5 }))).toBe(1);
		});

		// Both switch arms fall through for a move with neither energy nor energy gain.
		it('is an ordinary attacker for a move with no energy either way', () => {
			expect(DC.damage(shield(), fighter(), move())).toBe(65);
		});
	});
});

describe('damageByStats', () => {
	it('takes attack and defense as arguments instead of off the Pokemon', () => {
		expect(DC.damageByStats(fighter(), fighter(), 100, 100, 1, move())).toBe(65);
		expect(DC.damageByStats(fighter(), fighter(), 200, 50, 1, move())).toBe(260);
		expect(DC.damageByStats(fighter(), fighter(), 100, 100, SUPER_EFFECTIVE, move())).toBe(104);
	});

	// Branch: formChange with trigger "activate_charged" and a charged move — all three conditions.
	it('swaps in the alternative form attack stat for a charged move', () => {
		const attacker = fighter({
			formChange: { trigger: 'activate_charged', alternativeFormId: 'blade' },
			getFormStats: (formId: string) => ({ atk: formId === 'blade' ? 200 : 1 })
		});
		// The passed-in attack of 100 is replaced by the form's 200:
		// floor(100 * 1 * (200/100) * 1 * 0.5 * BONUS) + 1 = floor(129.99999) + 1 = 130.
		expect(DC.damageByStats(attacker, fighter(), 100, 100, 1, move({ energy: 50 }))).toBe(130);
	});

	it('ignores a form change whose trigger is something else', () => {
		const attacker = fighter({
			formChange: { trigger: 'activate_fast', alternativeFormId: 'blade' },
			getFormStats: () => ({ atk: 200 })
		});
		expect(DC.damageByStats(attacker, fighter(), 100, 100, 1, move({ energy: 50 }))).toBe(65);
	});

	it('ignores the form change for a move that costs no energy', () => {
		const attacker = fighter({
			formChange: { trigger: 'activate_charged', alternativeFormId: 'blade' },
			getFormStats: () => ({ atk: 200 })
		});
		expect(DC.damageByStats(attacker, fighter(), 100, 100, 1, move())).toBe(65);
	});

	it('applies the same aegislash fast-move override as damage()', () => {
		const attacker = fighter({ activeFormId: 'aegislash_shield' });
		expect(DC.damageByStats(attacker, fighter(), 100, 100, 1, move({ energyGain: 5 }))).toBe(1);
	});
});

describe('breakpoint', () => {
	// ((66 - 1) * 100) / (100 * 1 * 1 * 1 * 1 * 0.5 * BONUS) = 100.00000366797828
	it('solves damage() for the attack stat', () => {
		const attack = DC.breakpoint(fighter(), fighter(), 66, 100, 1, move());
		expect(attack).toBeCloseTo(100.00000366797828, 8);
	});

	it('round-trips: the attack it returns deals exactly the damage asked for', () => {
		const attack = DC.breakpoint(fighter(), fighter(), 66, 100, 1, move());
		expect(DC.damageByStats(fighter(), fighter(), attack, 100, 1, move())).toBe(66);
		// One point of attack below the breakpoint is one point of damage below it.
		expect(DC.damageByStats(fighter(), fighter(), attack - 1, 100, 1, move())).toBe(65);
	});

	it('divides out the shadow and buff multipliers on the attacker', () => {
		const shadow = fighter({ shadowAtkMult: 1.2 });
		const buffed = fighter({ getStatBuffMultiplier: () => 1.25 });
		const base = DC.breakpoint(fighter(), fighter(), 66, 100, 1, move());

		expect(DC.breakpoint(shadow, fighter(), 66, 100, 1, move())).toBeCloseTo(base / 1.2, 8);
		expect(DC.breakpoint(buffed, fighter(), 66, 100, 1, move())).toBeCloseTo(base / 1.25, 8);
	});
});

describe('bulkpoint', () => {
	// (100 * 1 * 1 * 0.5 * BONUS * 100) / 66 = 98.48484487244578
	it('solves damageByStats() for the defense stat', () => {
		expect(DC.bulkpoint(fighter(), fighter(), 66, 100, 1, move())).toBeCloseTo(98.48484487244578, 8);
	});

	it('multiplies by the defense buff multiplier and divides by the shadow defense multiplier', () => {
		const base = DC.bulkpoint(fighter(), fighter(), 66, 100, 1, move());
		const buffed = fighter({ getStatBuffMultiplier: () => 0.8 });
		const shadow = fighter({ shadowDefMult: 0.83333331 });

		expect(DC.bulkpoint(fighter(), buffed, 66, 100, 1, move())).toBeCloseTo(base * 0.8, 8);
		expect(DC.bulkpoint(fighter(), shadow, 66, 100, 1, move())).toBeCloseTo(base / 0.83333331, 8);
	});
});

describe('getEffectiveness', () => {
	it('is 1 against a type with no relationship to the move', () => {
		expect(DC.getEffectiveness('water', ['normal'])).toBe(1);
	});

	it('multiplies once per weakness', () => {
		expect(DC.getEffectiveness('water', ['fire'])).toBe(SUPER_EFFECTIVE);
		expect(DC.getEffectiveness('water', ['fire', 'ground'])).toBe(SUPER_EFFECTIVE * SUPER_EFFECTIVE);
	});

	it('multiplies once per resistance', () => {
		expect(DC.getEffectiveness('water', ['water'])).toBe(RESISTED);
		expect(DC.getEffectiveness('water', ['water', 'grass'])).toBe(RESISTED * RESISTED);
	});

	it('treats an immunity as a double resistance, not as zero', () => {
		expect(DC.getEffectiveness('electric', ['ground'])).toBe(DOUBLE_RESISTED);
		expect(DC.getEffectiveness('normal', ['ghost'])).toBe(DOUBLE_RESISTED);
	});

	it('cancels a weakness against a resistance', () => {
		// grass is weak to fire, water resists fire.
		expect(DC.getEffectiveness('fire', ['grass', 'water'])).toBeCloseTo(SUPER_EFFECTIVE * RESISTED, 12);
	});

	it('lowercases both the move type and every target type', () => {
		expect(DC.getEffectiveness('WATER', ['Fire'])).toBe(SUPER_EFFECTIVE);
	});

	// "none" is the second type the gamemaster gives single-typed Pokemon; it must be inert.
	it('is inert for the filler type "none" and for an unknown type', () => {
		expect(DC.getEffectiveness('water', ['none'])).toBe(1);
		expect(DC.getEffectiveness('tera', ['fire'])).toBe(1);
		expect(DC.getEffectiveness('water', [])).toBe(1);
	});
});

describe('getTypeTraits', () => {
	const TYPES = [
		'normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel',
		'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy'
	];

	it('covers all eighteen types', () => {
		for (const type of TYPES) {
			const traits = DC.getTypeTraits(type);
			const total =
				traits.weaknesses.length + traits.resistances.length + traits.immunities.length;
			expect(total, `${type} has no relationships`).toBeGreaterThan(0);
		}
	});

	it('never names a type outside the eighteen', () => {
		for (const type of TYPES) {
			const traits = DC.getTypeTraits(type);
			const named = [...traits.weaknesses, ...traits.resistances, ...traits.immunities];
			expect(named.filter((t: string) => !TYPES.includes(t)), `${type}`).toEqual([]);
		}
	});

	it('returns the empty default for a type the switch does not know', () => {
		expect(DC.getTypeTraits('none')).toEqual({ weaknesses: [], resistances: [], immunities: [] });
		expect(DC.getTypeTraits('tera')).toEqual({ weaknesses: [], resistances: [], immunities: [] });
	});

	it('describes steel, the most resistant type, exactly', () => {
		expect(DC.getTypeTraits('steel')).toEqual({
			resistances: ['normal', 'flying', 'rock', 'bug', 'steel', 'grass', 'psychic', 'ice', 'dragon', 'fairy'],
			weaknesses: ['fighting', 'ground', 'fire'],
			immunities: ['poison']
		});
	});

	it('builds a fresh object per call, so a caller cannot poison the table', () => {
		DC.getTypeTraits('water').resistances.push('everything');
		expect(DC.getTypeTraits('water').resistances).toEqual(['steel', 'fire', 'water', 'ice']);
	});
});

/**
 * End to end against the synthetic gamemaster: real `Pokemon` objects, real derived stats, real
 * `typeEffectiveness` tables. The numbers are stable because the fixture is, which is exactly why
 * §4 says to prefer it — the same assertions against `static/data/gamemaster.json` would break
 * the next time the gamemaster is recompiled.
 */
describe('against real Pokemon from the synthetic gamemaster', () => {
	let azumarill: any;
	let machamp: any;

	beforeAll(() => {
		const battle = newBattle();
		azumarill = new Pokemon('azumarill', 0, battle);
		machamp = new Pokemon('machamp', 1, battle);
		azumarill.initialize(true);
		machamp.initialize(true);
	});

	it('derives the stats the damage numbers below are built from', () => {
		// Azumarill 112/152/225 at level 43 with IVs 4/15/13; Machamp 234/159/207 at level 21.5.
		expect(azumarill.getEffectiveStat(0)).toBeCloseTo(93.4148, 4);
		expect(machamp.getEffectiveStat(1)).toBeCloseTo(107.1569, 4);
		expect(machamp.getEffectiveStat(0)).toBeCloseTo(144.9406, 4);
		expect(azumarill.getEffectiveStat(1)).toBeCloseTo(134.4851, 4);
	});

	// floor(8 * 1.2000000476837158 * (93.4148 / 107.1569) * 1 * 1 * 0.5 * BONUS) + 1
	//   = floor(5.4397) + 1 = 6.   Water is neutral against fighting, and STAB applies.
	it('computes Bubble from Azumarill onto Machamp as 6', () => {
		expect(azumarill.fastMove.stab).toBeCloseTo(1.2, 6);
		expect(machamp.typeEffectiveness['water']).toBe(1);
		expect(DC.damage(azumarill, machamp, azumarill.fastMove)).toBe(6);
	});

	// Ice Beam is not one of Azumarill's types, so stab is 1, and ice is neutral on fighting:
	// floor(90 * 1 * (93.4148 / 107.1569) * 1 * 1 * 0.5 * BONUS) + 1 = floor(50.997) + 1 = 51.
	it('computes Ice Beam from Azumarill onto Machamp as 51', () => {
		const iceBeam = azumarill.chargedMoves.find((m: any) => m.moveId === 'ICE_BEAM');
		expect(iceBeam.stab).toBe(1);
		expect(DC.damage(azumarill, machamp, iceBeam)).toBe(51);
	});

	// Counter is fighting, which fairy resists: 0.625 off the defender's own table.
	// floor(8 * 1.2 * (144.9406 / 134.4851) * 0.625 * 1 * 0.5 * BONUS) + 1 = floor(4.2031) + 1 = 5.
	it('computes Counter from Machamp onto Azumarill as 5, resisted by its fairy type', () => {
		expect(azumarill.typeEffectiveness['fighting']).toBe(RESISTED);
		expect(DC.damage(machamp, azumarill, machamp.fastMove)).toBe(5);
	});

	it('agrees with damageByStats() when handed the same stats', () => {
		expect(
			DC.damageByStats(
				azumarill,
				machamp,
				azumarill.getEffectiveStat(0),
				machamp.getEffectiveStat(1),
				machamp.typeEffectiveness['water'],
				azumarill.fastMove
			)
		).toBe(DC.damage(azumarill, machamp, azumarill.fastMove));
	});
});
