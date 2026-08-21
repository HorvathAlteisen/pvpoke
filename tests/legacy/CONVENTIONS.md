# Legacy JS test conventions

Briefing for every agent writing vitest tests against the frozen legacy browser JavaScript.
Read this once; you should not need to read `harness.ts` itself.

---

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

`isolate: false` means **module scope is shared between test files inside a worker.** Never put
mutable state at module scope in a test file or a helper. Keep everything on the env instance.

## 4. Harness API

```ts
import {
  createLegacyEnv, createGameMasterEnv, createBattleEnv,
  installFakeTimers, syntheticGameMaster, ajaxError,
  DEFAULT_SETTINGS, BATTLE_STACK, INTERFACE_STACK, JQUERY_PATH, REPO_ROOT, STATIC_ROOT,
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
| `dispose()` | close the window — call it in `afterEach`/`afterAll` |

**`get` vs `set` — the one rule you must internalise.**
`function foo(){}` and `var x` create *properties of the context global*: `env.get('x')` reads
them and `env.set('x', v)` overwrites them.
`class X {}`, `const X = ...`, `let X = ...` create *global lexical bindings*: `env.get('X')`
reads them (it evaluates the name in the context), but `env.ctx.X` is `undefined` and
`env.set('X', ...)` **cannot** override them. To fake such a collaborator, `set()` it *before*
loading the file that consumes it — undeclared names resolve to the global object.

Loading the same file twice into one env throws (`class`/`const` redeclaration). Create a new env.

### `createGameMasterEnv(opts?): { env, gm }`

jQuery + `static/js/GameMaster.js` loaded and the singleton fully populated from the real
`static/data/gamemaster.json`. Accepts everything `createLegacyEnv` accepts plus:

- `synthetic: true` — use `syntheticGameMaster()` (2 Pokemon, 6 moves, same top-level shape) instead
  of the real 1.7 MB file. Use it whenever your test does not need real data — it is much faster.
- `gamemaster: obj` — serve exactly `obj`. Build it with `syntheticGameMaster({ ...overrides })`
  for exotic data shapes.

### `createBattleEnv(opts?): { env, gm, newBattle }`

`createGameMasterEnv` plus the whole battle stack in dependency order (`BATTLE_STACK`):
`Pokemon` → `TimelineEvent` → `TimelineAction` → `DamageCalculator` → `ActionLogic` → `Player`
→ `Battle`. Extra options: `trainingAI: true` (also load `training/TrainingAI.js`, required
before `new Player(i, aiType, battle)` with a real AI) and `random` (fixed `Math.random`,
default `0.5`; pass `null` to leave it alone).

### `installFakeTimers(env): FakeTimers`

`{ tick(ms), runAll(max?), pending(), now(), restore() }`. **Use this, not `vi.useFakeTimers()`** —
vitest's fake timers patch Node's globals, and the legacy scripts resolve `setTimeout` from the
JSDOM window, which they do not touch.

## 5. Copy-pasteable patterns

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

it('defaults values to [0]', () => {
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

it('constructs once', () => { const { IM } = boot(); expect(IM.getInstance()).toBe(IM.getInstance()); });
```

### 5d. A jQuery/DOM interface file (`interface/ModalWindow.js`)

Give the env the markup the file expects, drive it with `trigger`, assert on the DOM.

```ts
const env = createLegacyEnv({ html: '<div class="template hide">hi</div>' });
env.load('static/js/interface/ModalWindow.js');

env.get('modalWindow')('Title', '.template');
expect(env.$('body > .modal').length).toBe(1);

env.$('.modal-close').trigger('click');
expect(env.$('.modal').length).toBe(0);
```

### 5e. A file that fires `$.ajax` at load time (`training/TrainingAI.js`, `interface/ArticleChecklist.js`)

Requests that map onto real files under `static/` are served from disk automatically, so this
usually just works:

```ts
const env = createLegacyEnv();
env.load('static/js/training/TrainingAI.js');   // GETs data/training/aiArchetypes.json
expect(env.get('aiData').length).toBeGreaterThan(0);
```

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
If something is still missing you get a plain `ReferenceError: Foo is not defined` naming the file
to add — load it and repeat. Likewise a missing fixture surfaces as the harness's loud
`Unhandled GET request to "..."`; route it rather than guessing.

### 5g. A file that ends in `var main = new Main()` (`js/Main.js`, `tera/js/Main.js`)

The side effect happens during `load()`, so everything it touches must already exist:

```ts
const { env } = createGameMasterEnv({ html: PAGE });
env.set('RSS', { getInstance: () => rssStub });
env.set('InterfaceMaster', { getInstance: () => interfaceStub });  // undeclared name → settable
env.load('static/js/Main.js');
expect(env.get('main').getGM()).toBe(env.get('GameMaster').getInstance());
```

Note `Main.js` guards with `typeof InterfaceMaster !== 'undefined'`, so leaving it unset covers
the other branch — that is one env each.

### 5h. A Node CLI script (`scripts/pretty-format-json.js`)

`scripts/*.js` are CommonJS Node scripts, not browser scripts. Do not use the JSDOM harness for
them; run them in a plain `vm` context or via `child_process` against a temp file, and assert on
the file contents / stdout / `process.exitCode`.

## 6. The fake ajax layer

There is **no network and no XHR**. `$.ajax`, `$.get`, `$.getJSON` and `$.post` are replaced.

- A URL that resolves to a real file under `static/` is served from disk (`webRoot`, origin and
  `?v=` query are stripped): `webRoot+"data/gamemaster.json?v=1"` → `static/data/gamemaster.json`.
  JSON is parsed once at module scope and handed to each env as a `structuredClone`, so
  `GameMaster` mutating its data cannot leak between tests. `.xml` is parsed into a Document.
- **An unknown URL throws** with the URL in the message. That is deliberate: a silent 404 would
  hide a whole branch from you. Known URLs with no file on disk (e.g. the POST target
  `data/settingsCookie.php`) must be routed explicitly.

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

Patterns match on the normalised `path` (exact), the raw `url` (exact or substring), a `RegExp`
against the raw url, or a predicate. **Later registrations win**, so you can override a route
mid-test.

**Dispatch mode.** By default `success`/`error` fire *synchronously* inside the `$.ajax()` call,
which is what most legacy code assumes. Some files fire ajax from inside an IIFE that is still
building the object the callback touches — `static/js/GameMaster.js` calls
`object.createSearchMaps()` from `success`, but that method is only assigned 150 lines later. For
those, queue and flush:

```ts
const env = createLegacyEnv({ dispatch: 'deferred' });
env.load('static/js/GameMaster.js');
const gm = env.get('GameMaster').getInstance();   // request queued, not run
env.ajax.flush();                                  // now success runs, gm is populated
env.ajax.dispatch = 'sync';
```

(`createGameMasterEnv` does exactly this for you.)

## 7. Reaching private state — you usually can't

Most legacy files are closures: `var gm`, `var self`, `function init()` inside
`function Interface(){...}` are unreachable from outside. **Do not try to reach them.** Test
through the observable surface:

1. **Public methods** — anything assigned to `this.` / `object.` / returned from the IIFE.
2. **DOM effects** — classes toggled, elements appended/removed, `.val()`, `.html()`, `.attr()`.
   This is the main lever for interface files.
3. **DOM events** — `env.$('.selector').trigger('click' | 'change' | 'keyup' | 'stateChange')`,
   or `env.document.querySelector(...).dispatchEvent(new env.window.Event('...'))`.
4. **Spying via replaced globals** — `env.set('GameMaster', { getInstance: () => stub })`,
   `env.get('gtag')`, `env.ajax.requests`, `env.window.localStorage`, `env.logs`.
5. **Return values of collaborators you injected** — if the file calls `caller.displayRankingData(d)`,
   pass a `vi.fn()` caller and assert on what it received.

If a branch is genuinely only reachable through private state, say so in a comment and move on.

## 8. Rules

- **No network.** Ever. The ajax layer is the only I/O; unknown URLs throw.
- **No real timers.** Use `installFakeTimers(env)` for code running inside the context.
  `vi.useFakeTimers()` only helps for timers your *test* schedules in Node.
- **Deterministic.** `battle/Battle.js` (buff rolls, `waitTime`), `battle/actions/ActionLogic.js`,
  `training/TrainingAI.js` and `interface/PokeSelect.js` all use `Math.random`. Pin it:
  `env.exec('Math.random = () => 0.5;')` (or the `random` option of `createBattleEnv`), and vary
  the value per test to reach both sides of a roll.
- **No snapshot tests of huge blobs.** Never snapshot the gamemaster, a rankings file, a full
  timeline or a serialised DOM. Assert on specific fields, counts and classes.
- **Name each test after the branch or behaviour it pins**, e.g.
  `it('defaults values to [0] when the argument is omitted')`, not `it('works')`.
- **Dispose every env** (`afterEach`/`afterAll`) — `isolate: false` means leaked windows pile up
  in the worker.
- **Prefer `synthetic: true`** gamemasters unless the test genuinely needs real data.

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
  both cases *before* the code under test reads the width.
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
  `training/BattleInterface.js` and both `ModalWindow.js` files.
- **`:focus`** — real: `env.document.querySelector('input').focus()`.
- **`:visible` / `:hidden`** — jQuery decides these from `offsetWidth`/`offsetHeight`, which are
  always `0` in JSDOM. **Everything is `:hidden` and nothing is `:visible`.** If a branch depends
  on it, that branch is unreachable — say so in a comment instead of faking layout.
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

## 11. Files intentionally NOT tested

- `static/js/libs/jquery-3.3.1.min.js` — vendored, minified third-party. Excluded from coverage in
  `vite.config.ts`.
- `static/service-worker.js` — empty file, nothing to test (and outside the coverage globs).

## 12. Known-unreachable branches

Record every one you find here, with the reason.

- `static/js/battle/timeline/TimelineAction.js` lines 73 and 77 — `break;` statements placed after
  `return 1;` / `return 2;` inside `typeToInt()`. Dead code; the file tops out at 97.1 % stmts /
  80 % branches.
- Anything gated on jQuery `:visible` / `:hidden` (see §9) — JSDOM reports zero layout, so only
  the `:hidden` side is reachable.
