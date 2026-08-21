# Legacy JS test conventions

Briefing for every agent writing vitest tests against the frozen legacy browser JavaScript.
Read this once; you should not need to read `harness.ts` itself.

---

## 0. Assertion strength

**This section outranks every other section in this file. If following §5's copy-pasteable
pattern would produce a test that violates §0, the pattern is wrong for your file, not §0.**

### 0a. Every `it()` must assert something that would differ if the branch behaved differently

Before you write an assertion, name — out loud, in the test name or a comment — *what would
change if this branch were broken or removed*. A hidden row that stays visible. A stat that comes
out 6 instead of 5. A collaborator that is called with the wrong argument. A class that is not
toggled. If you cannot name it, the branch is not worth a test: record it in §12 and move on.

### 0b. Banned as a test's only assertion

```
expect(...).not.toThrow()      expect(...).toBeDefined()      expect(...).toBeTruthy()
expect(x.length).toBeGreaterThan(0)                           expect(x.length > 0).toBe(true)
```

Each of these passes for a whole family of wrong behaviours. `not.toThrow()` passes when the
function does nothing at all. `toBeGreaterThan(0)` on a simulated timeline passes when the
simulator rolls fresh dice every run. They are fine as *supporting* assertions next to a real one;
they are never the point of a test.

The replacements are always the same three moves: assert an **exact value**, assert an **exact
collection** (`toEqual([...])`, not a length), or assert **two things agree** (the same input run
twice, or a round trip through an inverse function).

### 0c. Coverage is a detector, not the goal

A branch that a test *reaches* but asserts nothing about is **worse than an uncovered branch**,
because the coverage report now says it is handled and nobody will look at it again. Use the
per-file coverage report (§10) to find branches you have not thought about — then decide what each
one *does*, and assert that. Never add a line of test code whose only purpose is to make a number
go up.

### 0d. Never assert on `:visible`, `:hidden` or `.is(':visible')`

jQuery decides these from `offsetWidth`/`offsetHeight`, which are **always 0 in JSDOM**.
`$('.x:visible').length` is `0` and `$('.x:hidden').length` is `$('.x').length` no matter what the
code under test did — so such an assertion cannot fail and is exactly the sort of thing §0a bans.

Assert the thing the code actually did instead:

| the code does | assert |
| --- | --- |
| `.addClass("hide")` / `.removeClass("hide")` | `expect($('.x').hasClass('hide')).toBe(true)` |
| `.show()` / `.hide()` | `expect(el.style.display).toBe('none')` (`''` when shown) |
| `.append()` / `.remove()` / `.html()` | `expect($('.x').length).toBe(2)`, `expect($('.x').html()).toBe(...)` |

`tests/legacy/js/interface/ModalWindow.test.ts` and `tests/legacy/js/interface/PokeSearch.test.ts`
both do this correctly — copy them. If a branch is *genuinely* gated on `:visible`, it is
unreachable in this harness; say so in a comment and add it to §12.

### 0e. Don't re-test the harness

`harness.test.ts` already pins harness and V8 semantics: that `class`/`const` bindings are lexical
and absent from `env.ctx`, that jQuery boots, that the ajax layer serves and throws, that the fake
clock ticks. Do not repeat any of that per file. A comment pointing at the behaviour is welcome;
an `it()` is noise.

## 1. The frozen-sources rule

**Never edit, reformat, refactor, lint or "fix" anything under `static/` or `scripts/`.**
Those files were moved verbatim from the pre-SvelteKit PHP site. If a legacy file has a bug,
a typo, dead code or an unreachable branch, you *pin the current behaviour with a test* and
write a comment saying so. You never change the source.

This also means: no `// istanbul ignore`, no shims injected into the file, no wrapper modules.
Everything you need is in the harness.

## 2. Where the test file goes

`tests/legacy/` + the source path with a leading `static/` stripped, `.js` → `.test.ts`.

| source | test |
| --- | --- |
| `static/js/battle/Battle.js` | `tests/legacy/js/battle/Battle.test.ts` |
| `static/js/interface/PokeSelect.js` | `tests/legacy/js/interface/PokeSelect.test.ts` |
| `static/tera/js/Trait.js` | `tests/legacy/tera/js/Trait.test.ts` |
| `scripts/pretty-format-json.js` | `tests/legacy/scripts/pretty-format-json.test.ts` |

One test file per legacy file. Import the harness as `@harness` (a project alias — it works at
every directory depth, do not use relative paths):

```ts
import { createLegacyEnv, type LegacyEnv } from '@harness';
```

## 3. Why the harness exists (and why not `environment: 'jsdom'`)

The legacy files are classic non-module browser scripts in **sloppy mode** (`var interface = ...`
is used, which is a syntax error in strict mode) that communicate through globals and jQuery
3.3.1. So each test file builds its own JSDOM and runs the sources inside that window's own VM
context with `vm.runInContext`. That gives sloppy-mode *script* semantics, per-file isolation, and
correct v8 coverage attribution back to the real `static/...` paths.

`vite.config.ts` sets `environment: 'node'`, `pool: 'threads'`, `isolate: false`,
`minThreads === maxThreads === 4`. **Do not change this.** On the 9p mount this repo lives on,
`import('jsdom')` costs ~35 s; vitest's jsdom environment would pay that per test *file*, the
harness pays it once per worker. And `minThreads < maxThreads` makes tinypool kill a worker that
is still importing jsdom, producing `Unhandled Rejection: Error: Terminating worker thread` and a
non-zero exit even when every test passes.

`isolate: false` means **module scope is shared between test files inside a worker.** The rule
that follows from it is narrower than "no module-scope state":

- A **shared helper module** (`harness.ts`, anything you add next to it) must hold no mutable
  state. Caches of immutable, never-handed-out-by-reference data are fine; everything a test can
  touch lives on the env instance. `BATTLE_STACK` and `INTERFACE_STACK` are `Object.freeze`d for
  this reason.
- A **per-file `let env: LegacyEnv`** assigned in `beforeEach`/`beforeAll` is the expected pattern
  and every pilot uses it. A test file's module scope is shared with other test *files*, but they
  never read your `env` binding, and vitest runs the tests within one file sequentially.

## 4. Harness API

```ts
import {
  createLegacyEnv, createGameMasterEnv, createBattleEnv,
  installFakeTimers, syntheticGameMaster, ajaxError,
  DEFAULT_SETTINGS, COOKIE_SETTINGS, BATTLE_STACK, INTERFACE_STACK,
  JQUERY_PATH, REPO_ROOT, STATIC_ROOT,
  type LegacyEnv, type FakeTimers
} from '@harness';
```

### `createLegacyEnv(opts?): LegacyEnv`

| option | default | meaning |
| --- | --- | --- |
| `html` | `''` | initial `document.body` markup |
| `url` | `'http://localhost/'` | document URL (the only way to control `location`) |
| `host` | `'http://localhost/'` | page global `host` |
| `webRoot` | `'/'` | page global `webRoot` |
| `siteVersion` | `'1.0'` | page global `siteVersion` |
| `settings` | – | merged over `DEFAULT_SETTINGS` (page global `settings`) |
| `get` | `false` | page global `get` |
| `globals` | `{}` | extra values assigned onto the context |
| `jquery` | `true` | load the vendored jQuery 3.3.1 |
| `fx` | `false` | let jQuery animations run for real (see §8) |
| `random` | `0.5` | fixed `Math.random` inside the context; `null` leaves it alone |
| `stubs` | `true` | stub `console`, `gtag`, `Chart`, `Sortable`; pass an object to pick |
| `routes` | `[]` | `[[pattern, responder], ...]` registered on the ajax mock |
| `dispatch` | `'sync'` | ajax dispatch mode (see §6) |
| `scripts` | `[]` | legacy scripts to `load()` immediately |

`LegacyEnv`:

| member | meaning |
| --- | --- |
| `window`, `document`, `dom` | the JSDOM window / document / JSDOM instance |
| `ctx` | the raw VM context (== the window). Assigning to it defines a global. |
| `$` | the vendored jQuery from inside the context |
| `load(...relPaths)` | run legacy scripts, paths relative to the repo root |
| `exec(code)` | evaluate a string inside the context, returns its value |
| `get(name)` | read a global **or** a top-level `class`/`const`/`let` binding |
| `set(name, value)` | define/overwrite a global (see the caveat below) |
| `html(markup)` | replace `document.body.innerHTML` |
| `hover(target)` | set what the fake pointer is over, so `:hover` matches (`null` clears) |
| `resize(w, h?)` | set the fake viewport size (see §9) and fire a `resize` event |
| `ajax` | the fake ajax layer (§6) |
| `logs` | captured `console` output: `.log`, `.warn`, `.error`, `.info`, `.debug`, `.all` |
| `loaded` | scripts loaded so far |
| `dispose()` | close the window — idempotent (see §8) |
| `disposed` | whether `dispose()` has run (JSDOM has no `window.closed`) |

**`get` vs `set` — the one rule you must internalise.**
`function foo(){}` and `var x` create *properties of the context global*: `env.get('x')` reads
them and `env.set('x', v)` overwrites them.
`class X {}`, `const X = ...`, `let X = ...` create *global lexical bindings*: `env.get('X')`
reads them (it evaluates the name in the context), but `env.ctx.X` is `undefined` and
`env.set('X', ...)` **cannot** override them. To fake such a collaborator, `set()` it *before*
loading the file that consumes it — undeclared names resolve to the global object.

Loading the same file twice into one env throws (`class`/`const` redeclaration). Create a new env.

### `createGameMasterEnv(opts?): { env, gm }`

jQuery + `static/js/GameMaster.js` loaded and the singleton fully populated. **By default it
serves `syntheticGameMaster()`** — 2 Pokemon, 6 moves, the same top-level shape as the real file.
Accepts everything `createLegacyEnv` accepts plus:

- `real: true` — serve the real 1.7 MB `static/data/gamemaster.json` instead.
- `gamemaster: obj` — serve exactly `obj`. Build it with `syntheticGameMaster()` and mutate the
  result for exotic data shapes.

**Synthetic is the default because assertions against it can be exact.**

- Against the **synthetic** gamemaster: assert hand-computed values. Azumarill's Bubble deals 6
  damage to Machamp, and you can check that with a calculator from the fixture's base stats.
  See `tests/legacy/js/battle/DamageCalculator.test.ts`.
- Against the **real** gamemaster (`{ real: true }`): assert **only stable identity facts** —
  dex numbers, species ids, move ids, move names. Never a derived number (a CP, a damage roll, a
  ranking score, a list length), because those change the next time
  `scripts/compile-gamemaster.ts` runs and your test becomes a tripwire for data updates instead
  of a test of the code.

`harness.test.ts` carries a **shape contract**: every key the real gamemaster puts on
`pokemon[0]` / `moves[0]` must exist on at least one synthetic entry, and the top-level key sets
must match. Keep it green when you extend the fixture — otherwise "prefer synthetic" degrades
into "test against a fiction", and a field the real data has and the fixture lacks silently pins
every `if(pokemon.x)` in the codebase to the false arm.

The fixture also deliberately splits its optional fields so **both** arms stay reachable:
Azumarill has `tags` and `level25CP`, Machamp has `buddyDistance` and `thirdMoveCost`, and only
BUBBLE lacks an `abbreviation`. Preserve that when you add fields.

`createGameMasterEnv`, `BATTLE_STACK` and `INTERFACE_STACK` are **main-site only** — see §5i for
`static/tera/`.

### `createBattleEnv(opts?): { env, gm, newBattle }`

`createGameMasterEnv` plus the whole battle stack in dependency order (`BATTLE_STACK`):
`Pokemon` → `TimelineEvent` → `TimelineAction` → `DamageCalculator` → `ActionLogic` → `Player`
→ `Battle`. Extra option: `trainingAI: true` (also load `training/TrainingAI.js`, required
before `new Player(i, aiType, battle)` with a real AI). `Math.random` is pinned by
`createLegacyEnv`, so pass `random` there (or in the options you hand this helper).

### `installFakeTimers(env, opts?): FakeTimers`

`{ tick(ms), runAll(max?), pending(), now(), wallClock(), restore() }`. **Use this, not
`vi.useFakeTimers()`** — vitest's fake timers patch Node's globals, and the legacy scripts resolve
`setTimeout` from the JSDOM window, which they do not touch. It also replaces the context's `Date`
(§8).

### `DEFAULT_SETTINGS` and `COOKIE_SETTINGS`

`src/lib/components/layout/Globals.svelte` emits the page global `settings` in **two different
shapes**, and they are not type-compatible:

| field | no cookie (`DEFAULT_SETTINGS`) | cookie present (`COOKIE_SETTINGS`) |
| --- | --- | --- |
| `pokeboxId` | `0` (number) | `"0"` (string) |
| `pokeboxLastDateTime` | `0` (number) | `"0"` (string) |
| `animateTimeline` | `1` (number) | `true` (boolean) |
| `xls` | `true` | `true` — same type, listed for completeness |

That flips branches. `static/js/interface/Pokebox.js:258` reads
`if((settings.pokeboxId)&&(settings.pokeboxId > 0))`: with the cookie shape the first test is
**truthy** (`"0"` is a non-empty string) and with the default shape it is falsy, so the two shapes
take different paths through the same `if`.

**Rule: if the file under test reads `pokeboxId`, `pokeboxLastDateTime`, `animateTimeline` or
`xls`, test it against both shapes** — `createLegacyEnv({ settings: COOKIE_SETTINGS })` as well as
the default. Both constants are contract-tested against the component source in `harness.test.ts`.

## 5. Copy-pasteable patterns

Every snippet below is a starting point for wiring, not a template for assertions. §0 still applies.

### 5a. A plain `class` file (`battle/timeline/TimelineEvent.js`)

```ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createLegacyEnv, type LegacyEnv } from '@harness';

let env: LegacyEnv;
let TimelineEvent: any;

beforeAll(() => {
  env = createLegacyEnv({ jquery: false });          // no DOM/jQuery needed
  env.load('static/js/battle/timeline/TimelineEvent.js');
  TimelineEvent = env.get('TimelineEvent');           // lexical binding — get(), not ctx.X
});
afterAll(() => env.dispose());

it('defaults values to [0] when the argument is omitted', () => {
  expect(new TimelineEvent('shield', 'x', 0, 500, 1).values).toEqual([0]);
});
```

### 5b. A constructor function (`training/DecisionOption.js`, `pokemon/Pokemon.js`)

```ts
const env = createLegacyEnv({ jquery: false });
env.load('static/js/training/DecisionOption.js');
const DecisionOption = env.get('DecisionOption');
expect(new DecisionOption('FAST', 10).weight).toBe(10);
```

For constructor functions that need the gamemaster (`Pokemon`, `Battle`, `Trait`), start from
`createGameMasterEnv`/`createBattleEnv` instead of building the stack yourself.

### 5b2. A file of pure static methods (`battle/DamageCalculator.js`)

The best case: build the inputs by hand with round numbers so the expected output is arithmetic
you can do on paper, and assert the exact number. `DamageCalculator.damage()` only ever reads
`index`, `activeFormId`, `typeEffectiveness`, `getEffectiveStat()`, `getFormStats()` and
`getStatBuffMultiplier()` off its arguments, so a five-line object literal is a valid attacker.

```ts
const fighter = (over = {}) => ({
  index: 0, activeFormId: 'none', shadowAtkMult: 1, shadowDefMult: 1, formChange: null,
  typeEffectiveness: { water: 1 },
  getEffectiveStat: (i: number) => 100,
  getStatBuffMultiplier: () => 1,
  getFormStats: () => ({ atk: 0 }),
  ...over
});

// 100 * 1 * (100/100) * 1 * 1 * 0.5 * 1.2999999523162841796875 = 64.99999… → floor + 1
expect(DC.damage(fighter(), fighter(), move())).toBe(65);
```

`tests/legacy/js/battle/DamageCalculator.test.ts` is the worked example, including the end-to-end
half that runs the same calculations against real `Pokemon` objects from the synthetic gamemaster.

### 5c. A singleton `var X = (function(){ ... })()` module (`GameMaster.js`, `RSSReader.js`)

The IIFE runs at load time; the expensive work happens on the first `getInstance()`. The
singleton lives for the life of the env, so **each `instance ||` branch needs its own env**.

```ts
function boot() {
  const env = createLegacyEnv({ html: PAGE });
  env.set('GameMaster', { getInstance: vi.fn(() => gmStub) });  // stub collaborators first
  env.load('static/js/interface/HomeInterface.js');
  return { env, IM: env.get('InterfaceMaster') };
}

it('constructs once and reuses the instance', () => {
  const { env, IM } = boot();
  expect(IM.getInstance()).toBe(IM.getInstance());
  expect(env.get('GameMaster').getInstance).toHaveBeenCalledTimes(1);
});
```

### 5d. A jQuery/DOM interface file (`interface/ModalWindow.js`)

Give the env the markup the file expects, drive it with `trigger`, assert on the DOM.

```ts
const env = createLegacyEnv({ html: '<div class="template hide">hi</div>' });
env.load('static/js/interface/ModalWindow.js');

env.get('modalWindow')('Title', '.template');
expect(env.$('body > .modal').length).toBe(1);
expect(env.$('.modal-content > .template').hasClass('hide')).toBe(false);

env.$('.modal-close').trigger('click');
expect(env.$('.modal').length).toBe(0);
```

Note `ModalWindow.js` closes on any click that bubbles up to `.modal` when nothing is hovered or
focused. If your test clicks something *inside* a modal, call `env.hover('.modal-container')`
first or the modal you are inspecting disappears out from under you.

### 5e. A file that fires `$.ajax` at load time (`training/TrainingAI.js`, `interface/ArticleChecklist.js`)

Requests that map onto real files under `static/` are served from disk automatically, so this
usually just works:

```ts
const env = createLegacyEnv();
env.load('static/js/training/TrainingAI.js');   // GETs data/training/aiArchetypes.json
const aiData = env.get('aiData');
expect(aiData.map((a: any) => a.name)).toEqual(['Novice', 'Rival', 'Elite', 'Champion']);
expect(aiData[0].strategies).toEqual(['DEFAULT', 'SHIELD']);
```

— i.e. assert *what was loaded*, not that *something* was loaded (§0b). Better still, if the
assertion depends on the file's contents at all, register the fixture yourself (§6, disk-fallback
rule) so the expected values are in the test rather than in `static/data`.

If the file 404s at the harness (`Unhandled GET request to ...`), register a route *before*
loading it, or pass `routes: [[pattern, data]]`.

### 5f. A file whose top level binds `$("body").on(...)` handlers

`$("body").on("click", ".check", handler)` is a **delegated** handler, so the target element does
not need to exist when the handler is bound. Bind first, inject markup, then trigger:

```ts
const { env, gm } = createBattleEnv();
env.load(...INTERFACE_STACK, 'static/js/interface/AttackChartInterface.js');
env.get('InterfaceMaster').getInstance().init(gm);   // binds $("body").on("click", ".check", …)

env.html('<div class="check"></div>');               // markup can arrive afterwards
env.$('.check').trigger('click');
```

Handlers bound **directly** (`$(".x").click(fn)`) DO need the element present at bind time — pass
`html` to `createLegacyEnv` or call `env.html(...)` before `load()`/`init()`.

Most `interface/*Interface.js` files reach for a long chain of globals. `INTERFACE_STACK` exported
by the harness (`ModalWindow`, `PokeSearch`, `PokeSelect`, `Pokebox`, `PokeMultiSelect`,
`SortableTable`, `BattleHistogram`) covers the common ones and sits on top of `createBattleEnv()`.

**Finding the rest is a loop: load, run, read the error, add the named file, repeat.**
`tests/legacy/js/interface/PokeSearch.test.ts` records that loop end to end in its header comment
— four iterations, from `ReferenceError: modalWindow is not defined` (→ add `ModalWindow.js`, i.e.
`INTERFACE_STACK.slice(0, 2)`) through `Cannot read properties of null (reading 'getCP')` (→ call
the file's own `setBattle()`) to `ReferenceError: InterfaceMaster is not defined` (→ `env.set()` a
stub, because it is an undeclared name). Read that file before you start on any interface file.

A missing *fixture* surfaces the same way, as the harness's loud `Unhandled GET request to "..."`;
route it rather than guessing.

### 5g. A file that ends in `var main = new Main()` (`js/Main.js`)

The side effect happens during `load()`, so everything it touches must already exist:

```ts
const { env } = createGameMasterEnv({ html: PAGE });
env.set('RSS', { getInstance: () => rssStub });
env.set('InterfaceMaster', { getInstance: () => interfaceStub });  // undeclared name → settable
env.load('static/js/Main.js');
expect(env.get('main').getGM()).toBe(env.get('GameMaster').getInstance());
```

Note `static/js/Main.js` guards with `typeof InterfaceMaster !== 'undefined'`, so leaving it unset
covers the other branch — that is one env each.

**`static/tera/js/Main.js` is not this file.** It has the same shape but `init()` re-declares both
locals (`var interface = InterfaceMaster.getInstance(); var gm = GameMaster.getInstance();`, lines
10-11), shadowing the outer `var interface`/`var gm` that `getGM()` closes over. So for the tera
version `main.getGM()` returns **`undefined`** — a frozen-source bug, and one worth an explicit
test pinning it. See §5i for how to build a tera env.

### 5h. A Node CLI script (`scripts/pretty-format-json.js`)

`scripts/*.js` are CommonJS Node scripts, not browser scripts. Do not use the JSDOM harness.
**Use `child_process`, not a `vm` context** — these scripts read `process.argv`, call
`process.exit()` and `require('fs')`, all of which a bare `vm` context would need shimming, and
shimming them would mean testing the shim. Write the input to a temp file, run the script the way
a human runs it, and assert on the file contents / stdout / exit code:

```ts
import { execFileSync } from 'node:child_process';
const out = execFileSync(process.execPath, [resolve(REPO_ROOT, 'scripts/pretty-format-json.js'), tmp], {
  encoding: 'utf8'
});
expect(readFileSync(tmp, 'utf8')).toBe(EXPECTED_EXACT_TEXT);
```

Use `os.tmpdir()` for the temp file and clean it up in `afterEach`. For the failure paths, catch
the thrown error and assert on `err.status` and `err.stderr`.

### 5i. The `static/tera/` subtree

`static/tera/js/GameMaster.js` declares the **same `GameMaster` global** as the main site, but it
loads `tera/data/gamemaster.json`, sorts on `pokemon.name` (not `speciesName`), keys Pokemon by
`poke.id`, and calls `InterfaceMaster.getInstance().init(object)` from inside its `success`.
`createGameMasterEnv()`, `BATTLE_STACK` and `INTERFACE_STACK` are **main-site only** — calling
`createGameMasterEnv()` for a tera file silently gives you the wrong `GameMaster` and the wrong
data. Build the env by hand:

```ts
const env = createLegacyEnv({ html: PAGE, dispatch: 'deferred' });
env.ajax.route(/tera\/data\/gamemaster\.json/, teraFixture);   // route the tera path explicitly
env.set('InterfaceMaster', { getInstance: () => interfaceStub });
env.load('static/tera/js/GameMaster.js');
const gm = env.get('GameMaster').getInstance();
env.ajax.flush();                       // the IIFE's ajax runs here, not before
env.ajax.dispatch = 'sync';
```

`dispatch: 'deferred'` for the same reason `createGameMasterEnv` uses it (§6). Build the fixture
by hand from the real `static/tera/data/gamemaster.json`'s shape and keep it small; there is no
`syntheticGameMaster()` equivalent for tera.

**`static/tera/js/ModalWindow.js` is byte-identical to `static/js/interface/ModalWindow.js`**
(`diff` them — they match exactly). DRY wins here over DAMP: export the describe block from
`tests/legacy/js/interface/ModalWindow.test.ts` as a function taking the source path, and call it
from `tests/legacy/tera/js/ModalWindow.test.ts`. Duplicating ~200 lines of assertions for a file
that is provably the same file buys nothing, and the coverage report still attributes each run to
its own source path. (This is the *only* sanctioned cross-file sharing of assertions; two files
that merely look similar get their own tests.)

## 6. The fake ajax layer

There is **no network and no XHR**. `$.ajax`, `$.get`, `$.getJSON` and `$.post` are replaced.

- A URL that resolves to a real file under `static/` is served from disk (`webRoot`, origin and
  `?v=` query are stripped): `webRoot+"data/gamemaster.json?v=1"` → `static/data/gamemaster.json`.
  JSON is parsed once at module scope and handed to each env as a `structuredClone`, so
  `GameMaster` mutating its data cannot leak between tests. `.xml` is parsed into a Document.
- **An unknown URL throws** with the URL in the message. That is deliberate: a silent 404 would
  hide a whole branch from you. Known URLs with no file on disk (e.g. the POST target
  `data/settingsCookie.php`) must be routed explicitly.

**The disk fallback exists to keep files loading, not to supply expected values.** It is there so
a file that fires six requests at load time does not need six routes before you can test its
seventh line. **If an assertion depends on the contents of a file under `static/data`, register
the route explicitly with a fixture you control** (`env.ajax.route(...)` or
`env.ajax.file(pattern, 'tests/fixtures/...')`). Otherwise your expected values live in a 1.7 MB
data file that a gamemaster recompile rewrites, and the test breaks for reasons that have nothing
to do with the code under test.

```ts
env.ajax.route('data/groups/testgroup.json', [{ speciesId: 'azumarill' }]); // value…
env.ajax.route(/rankings-1500\.json/, (req) => buildRankings(req));         // …or a function
env.ajax.file('data/gamemaster.json', 'tests/fixtures/tiny-gm.json');       // …or a file
env.ajax.fail(/gamemaster/, { status: 500 });                               // force the error branch
env.ajax.reset();

env.ajax.requests;      // every request seen, in order
env.ajax.last();        // { url, path, type, dataType, data, settings }
env.ajax.allowUnknown = true;  // last resort; prefer explicit routes
```

`env.ajax.file()` serves the fixture with whatever `dataType` the request asked for, so it works
for the `.xml` feeds (`RSSReader.js`, `devtools/RSSFeedInterface.js`) as well as for JSON.

Patterns match on the normalised `path` (exact), the raw `url` (exact or substring), a `RegExp`
against the raw url, or a predicate. **Later registrations win**, so you can override a route
mid-test.

**Dispatch mode.** By default `success`/`error` fire *synchronously* inside the `$.ajax()` call.
This is a **convenience compromise, not fidelity**: no production code can assume a synchronous
XHR, and the real site never gets one. It is the default only because it keeps the common test
(fire a request, assert the result) free of ceremony.

The compromise has a cost, and one hard rule: **any assertion about state observed *between* the
request and the response must use `dispatch: 'deferred'`** — a spinner shown then hidden, a button
disabled while in flight, a guard flag that stops a second request, an "already loading" branch.
In `'sync'` mode that window has zero width and such a branch is untestable *and* invisible.

`'deferred'` is also required when a file fires ajax from inside an IIFE that is still building
the object the callback touches — `static/js/GameMaster.js` calls `object.createSearchMaps()` from
`success`, but that method is only assigned 150 lines later:

```ts
const env = createLegacyEnv({ dispatch: 'deferred' });
env.load('static/js/GameMaster.js');
const gm = env.get('GameMaster').getInstance();   // request queued, not run
expect(env.ajax.pending()).toBe(1);                // ← the in-flight state is observable here
env.ajax.flush();                                  // now success runs, gm is populated
env.ajax.dispatch = 'sync';
```

(`createGameMasterEnv` does exactly this for you.)

## 7. Reaching private state, and when to stub

Most legacy files are closures: `var gm`, `var self`, `function init()` inside
`function Interface(){...}` are unreachable from outside. **Do not try to reach them.** Test
through the observable surface:

1. **Public methods** — anything assigned to `this.` / `object.` / returned from the IIFE.
2. **DOM effects** — classes toggled, elements appended/removed, `.val()`, `.html()`, `.attr()`,
   `el.style.display`. This is the main lever for interface files.
3. **DOM events** — `env.$('.selector').trigger('click' | 'change' | 'keyup' | 'stateChange')`,
   or `env.document.querySelector(...).dispatchEvent(new env.window.Event('...'))`.
4. **Spying via replaced globals** — `env.set('GameMaster', { getInstance: () => stub })`,
   `env.get('gtag')`, `env.ajax.requests`, `env.window.localStorage`, `env.logs`.
5. **Return values of collaborators you injected** — if the file calls `caller.displayRankingData(d)`,
   pass a `vi.fn()` caller and assert on what it received.

If a branch is genuinely only reachable through private state, say so in a comment and add it to §12.

### 7a. When to stub — the rule

**This suite is Chicago-school / Testing-Trophy by choice.** The unit under test is **one legacy
file**, and its collaborators are the *real* other legacy files wherever they will run. Nobody is
to "properly unit test" file 30 by mocking the twelve globals it touches; that would test the
mocks and pin the current call graph of frozen code we are not allowed to change anyway.

**Stub a collaborator only when it lives in another file AND (it does I/O, or it is a singleton
whose construction you are not testing).** `GameMaster` in a HomeInterface test: yes. `RSS`,
which reads a feed: yes. `InterfaceMaster`, when you are testing something that calls into the
page: yes.

**Never stub:**
- **jQuery**, or any part of it (`$.fn.animate`, `$.ajax`, `$.fn.on`). The harness already
  replaced the only part that touches the outside world. Stubbing the rest means your test no
  longer proves the file works with the jQuery the site ships.
- **The DOM.** Give the env markup instead. That is what `html`/`env.html()` are for.
- **A file you are loading anyway.** If `INTERFACE_STACK` already put `ModalWindow.js` in the
  context, drive the real modal.
- **The file under test.** Obvious, but: no partial stubbing of "the slow half".

When you do stub, prefer `vi.fn()` so you can assert on the arguments (§7.5) — a stub you never
assert against is just a way of deleting a branch.

## 8. Rules

- **No network.** Ever. The ajax layer is the only I/O; unknown URLs throw.
- **No real timers.** Use `installFakeTimers(env)` for code running inside the context.
  `vi.useFakeTimers()` only helps for timers your *test* schedules in Node.
- **No wall clock.** `installFakeTimers(env, { now: Date.parse('2025-01-01') })` also replaces the
  context's `Date`: `Date.now()` and `new Date()` read the fake clock and move with `tick()`,
  while `new Date(x)`, `Date.parse`, `Date.UTC` and the prototype stay real. Three legacy files
  depend on the wall clock and need it:
  - `static/js/interface/Pokebox.js:29` — `lastDateTime = Date.now()`, which ends up in a
    cache-busting `?t=` query string you would otherwise be unable to assert on;
  - `static/js/interface/TrainRankingInterface.js:569-570` — `new Date()` minus 30 days, rendered
    into the chart's X-axis labels;
  - `static/js/devtools/RSSFeedInterface.js:27` — `new Date().toUTCString()` written into a feed
    item's `<pubDate>`.
- **No animations, by default.** `$.fx.off = true` is set in the jQuery bootstrap. jQuery 3.3.1
  drives its effects queue off `requestAnimationFrame`, which JSDOM's `pretendToBeVisual` provides
  for real and `installFakeTimers` does **not** patch — so with effects on, a `.animate()` /
  `.fadeIn()` / `.slideUp()` completion callback either never runs inside the test or runs after
  `dispose()`, against a closed window. Ten legacy files animate. With `$.fx.off` the element
  jumps to its final state and the callback runs synchronously, which is what you assert on
  (`PokeSearch.test.ts`'s focus-scroll test). Pass `fx: true` only if you are specifically testing
  that something *is* animated, and then do not expect the callback.
- **Deterministic.** `Math.random` is pinned to `0.5` by `createLegacyEnv` for every env.
  `battle/Battle.js` (buff rolls, `waitTime`), `battle/actions/ActionLogic.js`,
  `training/TrainingAI.js` and `interface/PokeSelect.js` all roll dice; pass
  `random: 0.1` / `random: 0.9` to reach both sides of a roll, or `random: null` to opt out.
- **No snapshot tests of huge blobs.** Never snapshot the gamemaster, a rankings file, a full
  timeline or a serialised DOM. Assert on specific fields, counts and classes.
- **Name each test after the branch or behaviour it pins**, e.g.
  `it('defaults values to [0] when the argument is omitted')`, not `it('works')`. If the name and
  the assertion disagree, one of them is a bug — fix the assertion first, then the name.
- **Dispose every env.** An env created *inside* a test is registered with vitest's
  `onTestFinished` automatically, so a failing assertion can no longer leak a JSDOM window; an env
  created in `beforeAll`/`beforeEach` still needs `afterAll`/`afterEach(() => env.dispose())`.
  `dispose()` is idempotent, so doing both is safe. This matters because `isolate: false` keeps
  leaked windows alive for the worker's whole life.
- **Prefer the synthetic gamemaster** (the default) unless the test genuinely needs real data (§4).

## 9. Squeezing the last branches

- **`$.ajax` error paths** — `env.ajax.fail(/pattern/, { status: 500, statusText: 'boom' })`, or
  return `ajaxError({ status: 404 })` from a responder. `error(xhr, 'error', statusText)` and then
  `complete` are called; the returned jqXHR is a real jQuery promise, so `.fail()` works too.
- **Mobile / width branches** — use `env.resize(width, height?)`. It sets `window.innerWidth/Height`,
  `document.documentElement.clientWidth/Height` (what `$(window).width()` actually reads) and
  `screen.width/height`, then fires a `resize` event. JSDOM's raw defaults are misleading:
  `window.innerWidth` is 1024 but `$(window).width()` and `screen.width` are **0**, which silently
  pins every `if(screen.width < 721)` / `if($(window).width() > 768)` branch to one arm. Call
  `env.resize(375, 812)` for the mobile arm and `env.resize(1280, 900)` for the desktop arm — in
  both cases *before* the code under test reads the width. Watch out for files that read
  `screen.width` at **load** time (`interface/PokeSearch.js:38`): resize before `load()`.
- **`navigator`** — `env.ctx.navigator = ...` throws (getter-only). Use
  `Object.defineProperty(env.window.navigator, 'userAgent', { value: 'iPhone', configurable: true });`
- **`window.location`** — is unforgeable in JSDOM. Assigning `env.ctx.location` silently does
  nothing (and logs "Not implemented: navigation"). Set the URL up front instead:
  `createLegacyEnv({ url: 'http://localhost/battle/?p1=azumarill' })`, and use
  `env.window.history.pushState(...)` for in-page changes. For query-string branches set the page
  global directly: `createLegacyEnv({ get: { cup: 'all', p1: 'azumarill' } })`.
- **`localStorage`** — real and per-env: `env.window.localStorage.setItem('key', JSON.stringify(x))`
  before `load()` to take the "stored data exists" arm, leave it empty for the other.
- **`:hover`** — JSDOM has no pointer and nwsapi rejects `:hover`, so the harness installs its own
  pseudo: `env.hover('.modal-container')` makes that element and its ancestors match, `env.hover(null)`
  clears. Needed for `interface/Interface.js`, `interface/PokeMultiSelect.js`,
  `training/BattleInterface.js` and both `ModalWindow.js` files — and, as a practical matter, for
  any test that clicks inside a modal (§5d).
- **`:focus`** — real: `env.document.querySelector('input').focus()`.
- **`:visible` / `:hidden`** — see **§0d**. Never assert on them; a branch gated on them is
  unreachable and belongs in §12.
- **`window.matchMedia`** — does not exist in JSDOM. Stub it via `globals` if a file needs it.
- **Analytics branches** — `gtag` is a `vi.fn()`; `expect(env.get('gtag')).toHaveBeenCalledWith(...)`.
- **`Chart` / `Sortable`** — stubbed. `env.get('Chart').instances` holds every chart constructed,
  with its `config`.

## 10. Per-file / per-directory coverage

Verified working form (run from the repo root):

```
npx vitest run tests/legacy/js/battle/timeline --coverage.enabled --coverage.provider=v8 "--coverage.include=static/js/battle/timeline/**" --coverage.reporter=text
```

Single file:

```
npx vitest run tests/legacy/js/interface/ModalWindow.test.ts --coverage.enabled --coverage.provider=v8 "--coverage.include=static/js/interface/ModalWindow.js" --coverage.reporter=text
```

Whole suite: `pnpm test` / `pnpm test:coverage` (HTML report in `coverage/`, which is gitignored).
Quote the `--coverage.include=...` argument — the glob must reach vitest unexpanded.

Read the report as a **list of branches you have not thought about yet** (§0c), not as a score.

## 11. Files intentionally NOT tested

- `static/js/libs/jquery-3.3.1.min.js` — vendored, minified third-party. Excluded from coverage in
  `vite.config.ts`.
- `static/js/libs/hexagon-chart.js` — vendored third-party ("Code provided by liuxd",
  https://www.cssscript.com/minimal-hexagon-radar-chart-javascript-six-js/). **Excluded from
  coverage** for the same reason as jQuery: it is not our code, we may not change it under §1, so
  tests over it could only pin someone else's library. Our side of that boundary — that we hand
  `hexagon` the right data — is tested in whichever interface file calls it.
- `static/service-worker.js` — empty file, nothing to test (and outside the coverage globs).

## 12. Known-unreachable branches

Record every one you find here, with the reason.

- `static/js/battle/timeline/TimelineAction.js` lines 73 and 77 — `break;` statements placed after
  `return 1;` / `return 2;` inside `typeToInt()`. Dead code; the file tops out at 97.1 % stmts /
  80 % branches.
- Anything gated on jQuery `:visible` / `:hidden` (§0d) — JSDOM reports zero layout, so only
  the `:hidden` side is reachable. Do not write an assertion for either side.
