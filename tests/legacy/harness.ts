/**
 * Test harness for the FROZEN legacy browser JavaScript under `static/` and `scripts/`.
 *
 * The legacy files are classic (non-module, sloppy-mode) browser scripts that talk to each
 * other through globals. To run them we build a JSDOM window per test file and execute the
 * sources inside that window's own VM context with `vm.runInContext`, which gives us:
 *   - sloppy mode (the legacy code uses `var interface = ...`, illegal in strict mode),
 *   - real *script* semantics, so top-level `class X {}` / `const X = ...` bindings live in the
 *     context's global lexical scope and are reachable from later scripts,
 *   - per-test-file isolation without paying vitest's `environment: 'jsdom'` cost.
 *
 * We deliberately do NOT use `environment: 'jsdom'`: on a 9p mount importing jsdom costs ~35s,
 * and vitest pays that per test FILE. See the comment in `vite.config.ts`.
 *
 * Everything mutable lives on the env instance returned by `createLegacyEnv()`; only immutable
 * parsed data is cached at module scope, because vitest runs with `isolate: false` and module
 * scope is therefore SHARED between test files inside a worker.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import { onTestFinished, vi } from 'vitest';

/** Absolute path of the repo root. All `load()` paths are resolved against it. */
export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
/** Absolute path of `static/`, the web root the fake ajax layer serves files from. */
export const STATIC_ROOT = resolve(REPO_ROOT, 'static');

/* -------------------------------------------------------------------------- */
/* Module-scope caches — immutable data only (isolate: false shares this!)     */
/* -------------------------------------------------------------------------- */

const sourceCache = new Map<string, string>();
const textCache = new Map<string, string>();
const jsonCache = new Map<string, unknown>();

function readSource(abs: string): string {
	let src = sourceCache.get(abs);
	if (src === undefined) {
		src = readFileSync(abs, 'utf8');
		sourceCache.set(abs, src);
	}
	return src;
}

function readText(abs: string): string {
	let text = textCache.get(abs);
	if (text === undefined) {
		text = readFileSync(abs, 'utf8');
		textCache.set(abs, text);
	}
	return text;
}

/** Parsed JSON is cached once and handed out as a `structuredClone` — GameMaster mutates it. */
function readJson(abs: string): any {
	if (!jsonCache.has(abs)) jsonCache.set(abs, JSON.parse(readText(abs)));
	return structuredClone(jsonCache.get(abs));
}

/* -------------------------------------------------------------------------- */
/* Page globals                                                               */
/* -------------------------------------------------------------------------- */

/**
 * The default `settings` object emitted by `src/lib/components/layout/Globals.svelte`
 * when no settings cookie is present. Mirrors it field for field.
 */
export const DEFAULT_SETTINGS = Object.freeze({
	defaultIVs: 'gamemaster',
	animateTimeline: 1,
	matrixDirection: 'row',
	gamemaster: 'gamemaster',
	pokeboxId: 0,
	pokeboxLastDateTime: 0,
	xls: true,
	rankingDetails: 'one-page',
	hardMovesetLinks: 0,
	colorblindMode: 0,
	performanceMode: 0,
	theme: 'default'
});

/**
 * The `settings` object emitted by `src/lib/components/layout/Globals.svelte` when a settings
 * cookie *is* present. Same keys, different JS types: `pokeboxId`/`pokeboxLastDateTime` are
 * emitted as **strings** and `animateTimeline`/`xls` as **booleans**, because the PHP the
 * component mirrors interpolated `intval()` inside quotes for the first two and used a ternary
 * for the second two. That flips branches — `interface/Pokebox.js:258` tests
 * `settings.pokeboxId && settings.pokeboxId > 0`, and `"0"` is truthy where `0` is not.
 *
 * If the file under test reads `pokeboxId`, `pokeboxLastDateTime`, `animateTimeline` or `xls`,
 * test it against both shapes (see CONVENTIONS §4).
 */
export const COOKIE_SETTINGS = Object.freeze({
	defaultIVs: 'gamemaster',
	animateTimeline: true,
	matrixDirection: 'row',
	gamemaster: 'gamemaster',
	pokeboxId: '0',
	pokeboxLastDateTime: '0',
	xls: true,
	rankingDetails: 'one-page',
	hardMovesetLinks: 0,
	colorblindMode: 0,
	performanceMode: 0,
	theme: 'default'
});

/** Path of the vendored jQuery, relative to the repo root. Never load an npm jQuery instead. */
export const JQUERY_PATH = 'static/js/libs/jquery-3.3.1.min.js';

/* -------------------------------------------------------------------------- */
/* Fake ajax layer                                                            */
/* -------------------------------------------------------------------------- */

/** A single request seen by the fake `$.ajax`. */
export interface AjaxRequest {
	/** The URL exactly as the legacy code passed it. */
	url: string;
	/** URL with origin, `webRoot` prefix and query string stripped, e.g. `data/gamemaster.json`. */
	path: string;
	/** `GET` / `POST` / ... (uppercased `type` or `method`). */
	type: string;
	dataType: string;
	/** Request payload (`settings.data`). */
	data: any;
	/** The full settings object handed to `$.ajax`. */
	settings: any;
}

/** A route pattern: exact path, substring of the URL, regexp, or predicate. */
export type AjaxPattern = string | RegExp | ((req: AjaxRequest) => boolean);

/** What a route returns: the response body, or a value built by a function. */
export type AjaxResponder = any | ((req: AjaxRequest) => any);

/** Marker returned by a responder (or produced by `fail()`) to take the `error` branch. */
export interface AjaxFailure {
	__legacyAjaxError: true;
	status: number;
	statusText: string;
	responseText: string;
}

/** Build an error response for `ajax.route(...)`; `ajax.fail(...)` is the shorthand. */
export function ajaxError(opts: Partial<Omit<AjaxFailure, '__legacyAjaxError'>> = {}): AjaxFailure {
	return {
		__legacyAjaxError: true,
		status: opts.status ?? 404,
		statusText: opts.statusText ?? 'error',
		responseText: opts.responseText ?? ''
	};
}

function isFailure(v: any): v is AjaxFailure {
	return !!v && typeof v === 'object' && (v as any).__legacyAjaxError === true;
}

/** Controls for the deterministic, file-backed replacement of `$.ajax`/`$.getJSON`/`$.post`. */
export interface AjaxMock {
	/** Every request seen so far, in order. */
	readonly requests: AjaxRequest[];
	/** The most recent request, or `undefined`. */
	last(): AjaxRequest | undefined;
	/**
	 * `'sync'` (default) fires `success`/`error` during the `$.ajax()` call itself.
	 * `'deferred'` queues them until `flush()` — needed when the file under test fires ajax
	 * from inside an IIFE that is still building the object the callback touches
	 * (`static/js/GameMaster.js` does exactly that).
	 */
	dispatch: 'sync' | 'deferred';
	/** Run every queued request (only meaningful in `'deferred'` mode). Returns how many ran. */
	flush(): number;
	/** Number of queued, not-yet-dispatched requests. */
	pending(): number;
	/** Register/override a route. Later registrations win. */
	route(pattern: AjaxPattern, responder: AjaxResponder): void;
	/** Serve a route from a file relative to the repo root (e.g. `tests/fixtures/x.json`). */
	file(pattern: AjaxPattern, relPath: string): void;
	/** Force the `error` branch for a route. */
	fail(pattern: AjaxPattern, opts?: Partial<Omit<AjaxFailure, '__legacyAjaxError'>>): void;
	/** Drop all registered routes and the request log. Disk-backed serving still works. */
	reset(): void;
	/** When true, unknown URLs resolve to `undefined` instead of throwing. Default false. */
	allowUnknown: boolean;
}

/* -------------------------------------------------------------------------- */
/* Env                                                                        */
/* -------------------------------------------------------------------------- */

export interface LegacyEnvStubs {
	/** Silence + capture `console.*` into `env.logs`. Default true. */
	console?: boolean;
	/** Install a `vi.fn()` `gtag`. Default true. */
	gtag?: boolean;
	/** Install a recording `Chart` constructor (chart.js). Default true. */
	chart?: boolean;
	/** Install a `Sortable` stub with a `create` spy. Default true. */
	sortable?: boolean;
}

export interface LegacyEnvOptions {
	/** Initial `document.body` markup. Default: empty body. */
	html?: string;
	/** Document URL. Default `http://localhost/`. */
	url?: string;
	/** Page global `host`. Default `http://localhost/`. */
	host?: string;
	/** Page global `webRoot`. Default `/`. */
	webRoot?: string;
	/** Page global `siteVersion`. Default `1.0`. */
	siteVersion?: string;
	/** Page global `settings`; merged over {@link DEFAULT_SETTINGS}. */
	settings?: Record<string, any>;
	/** Page global `get` (the parsed query string). Default `false`. */
	get?: any;
	/** Extra values assigned onto the context before any script runs. */
	globals?: Record<string, any>;
	/** Load the vendored jQuery 3.3.1. Default true. */
	jquery?: boolean;
	/**
	 * Let jQuery effects (`.animate()`, `.fadeIn()`, `.slideUp()`, ...) run for real. Default
	 * `false`, i.e. the harness sets `$.fx.off = true`. jQuery 3.3.1 drives its `fx` queue from
	 * `requestAnimationFrame`, which JSDOM's `pretendToBeVisual` supplies for real and
	 * `installFakeTimers` does NOT patch, so with effects on a completion callback either never
	 * fires inside the test or fires after `dispose()`. With `$.fx.off` the target jumps to its
	 * final state and the callback runs synchronously, which is what a test wants to assert on.
	 */
	fx?: boolean;
	/**
	 * Fixed value for `Math.random` inside the context. Default `0.5`; pass `null` to leave the
	 * real `Math.random` alone. `battle/Battle.js`, `battle/actions/ActionLogic.js`,
	 * `training/TrainingAI.js` and `interface/PokeSelect.js` all roll dice — vary this per test
	 * to reach both sides of a roll.
	 */
	random?: number | null;
	/** Install stubs for third-party globals. Default true; pass an object to pick. */
	stubs?: boolean | LegacyEnvStubs;
	/** Routes registered on the fake ajax layer before anything loads. */
	routes?: Array<[AjaxPattern, AjaxResponder]>;
	/** Initial ajax dispatch mode. Default `'sync'`. */
	dispatch?: 'sync' | 'deferred';
	/** Legacy scripts to `load()` immediately (after jQuery/stubs). */
	scripts?: string[];
}

/** Captured `console` output, when the console stub is installed. */
export interface LegacyLogs {
	log: any[][];
	info: any[][];
	warn: any[][];
	error: any[][];
	debug: any[][];
	all: Array<{ level: string; args: any[] }>;
}

export interface LegacyEnv {
	/** The JSDOM window (also the VM context's global object). */
	window: any;
	document: any;
	/** The raw VM context — `Object.assign(ctx, {...})` defines `var`-style globals. */
	ctx: any;
	/** The vendored jQuery 3.3.1 instance from inside the context. */
	$: any;
	/** The underlying JSDOM, if you need `dom.serialize()` etc. */
	dom: JSDOM;
	/** Run one or more legacy scripts (paths relative to the repo root) in the context. */
	load(...relPaths: string[]): void;
	/** Evaluate an expression/statement inside the context and return its value. */
	exec<T = any>(code: string): T;
	/**
	 * Read a global or top-level `class`/`const`/`let` binding out of the context.
	 * Throws `ReferenceError` if the name does not exist (that is a signal, not a bug).
	 */
	get<T = any>(name: string): T;
	/**
	 * Define/overwrite a global. Works for `var` globals and undeclared names.
	 * It CANNOT override a name the loaded scripts declared with `class`/`const`/`let`,
	 * because those bindings live in the global lexical scope and shadow the property.
	 */
	set(name: string, value: any): void;
	/** Replace `document.body.innerHTML`. */
	html(markup: string): void;
	/**
	 * Set the element the fake pointer is over, so jQuery's `:hover` selector matches it and its
	 * ancestors (JSDOM has no pointer, and nwsapi rejects `:hover` outright). Pass `null` to clear.
	 */
	hover(target: string | any | null): void;
	/**
	 * Resize the fake viewport. Sets `window.innerWidth/innerHeight`,
	 * `document.documentElement.clientWidth/clientHeight` (what `$(window).width()` reads) and
	 * `screen.width/height` — JSDOM reports 0 for the last two, which silently pins every
	 * `if(screen.width < 721)` style branch to the mobile arm.
	 */
	resize(width: number, height?: number): void;
	/** Controls for the fake `$.ajax` layer. */
	ajax: AjaxMock;
	/** Captured console output (empty when the console stub is disabled). */
	logs: LegacyLogs;
	/** Scripts loaded so far, in order. */
	readonly loaded: string[];
	/**
	 * Close the JSDOM window. Idempotent. An env created *inside a test* is disposed
	 * automatically via vitest's `onTestFinished`, so a failing assertion cannot leak it; an env
	 * created in `beforeAll` still needs an explicit `afterAll(() => env.dispose())`.
	 */
	dispose(): void;
	/** Whether {@link dispose} has run. (JSDOM does not implement `window.closed`.) */
	readonly disposed: boolean;
}

/* -------------------------------------------------------------------------- */

function normalizePath(url: string, webRoot: string): string {
	let u = String(url);
	const hash = u.indexOf('#');
	if (hash !== -1) u = u.slice(0, hash);
	const q = u.indexOf('?');
	if (q !== -1) u = u.slice(0, q);
	u = u.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]*/i, '');
	if (webRoot && webRoot !== '/' && u.startsWith(webRoot)) u = u.slice(webRoot.length);
	return u.replace(/^\/+/, '');
}

function matchesPattern(pattern: AjaxPattern, req: AjaxRequest): boolean {
	if (typeof pattern === 'function') return pattern(req);
	if (pattern instanceof RegExp) return pattern.test(req.url);
	return req.path === pattern || req.url === pattern || req.url.includes(pattern);
}

const EMPTY_LOGS = (): LegacyLogs => ({ log: [], info: [], warn: [], error: [], debug: [], all: [] });

/**
 * Build an isolated JSDOM + VM context in which frozen legacy scripts can be executed.
 *
 * ```ts
 * const env = createLegacyEnv({ html: '<div class="feed"></div>' });
 * env.load('static/js/battle/timeline/TimelineEvent.js');
 * const TimelineEvent = env.get('TimelineEvent');
 * ```
 */
export function createLegacyEnv(opts: LegacyEnvOptions = {}): LegacyEnv {
	const {
		html = '',
		url = 'http://localhost/',
		host = 'http://localhost/',
		webRoot = '/',
		siteVersion = '1.0',
		get: pageGet = false,
		globals = {},
		jquery = true,
		fx = false,
		random = 0.5,
		stubs = true,
		routes = [],
		dispatch = 'sync',
		scripts = []
	} = opts;

	const stubOpts: LegacyEnvStubs =
		stubs === false ? {} : stubs === true ? { console: true, gtag: true, chart: true, sortable: true } : stubs;

	const dom = new JSDOM(`<!doctype html><html><head></head><body>${html}</body></html>`, {
		runScripts: 'outside-only',
		url,
		pretendToBeVisual: true
	});
	const ctx: any = dom.getInternalVMContext();
	const window: any = dom.window;

	const logs = EMPTY_LOGS();
	const loaded: string[] = [];

	// Deterministic by default: pinned here rather than in createBattleEnv, because
	// `interface/PokeSelect.js` (and anything reached through createLegacyEnv) rolls dice too.
	if (random !== null) ctx.Math.random = () => random;

	Object.assign(ctx, {
		host,
		webRoot,
		siteVersion,
		settings: { ...DEFAULT_SETTINGS, ...(opts.settings ?? {}) },
		get: pageGet
	});

	if (stubOpts.console !== false) {
		const record = (level: keyof LegacyLogs) => (...args: any[]) => {
			(logs[level] as any[][]).push(args);
			logs.all.push({ level, args });
		};
		ctx.console = {
			log: record('log'),
			info: record('info'),
			warn: record('warn'),
			error: record('error'),
			debug: record('debug'),
			trace: record('debug'),
			table: record('log'),
			group: record('log'),
			groupEnd: () => {},
			time: () => {},
			timeEnd: () => {},
			assert: () => {},
			dir: record('log')
		};
	}
	if (stubOpts.gtag !== false) ctx.gtag = vi.fn();
	if (stubOpts.chart !== false) {
		const instances: any[] = [];
		function Chart(this: any, canvas: any, config: any) {
			this.canvas = canvas;
			this.config = config;
			this.data = config?.data;
			this.options = config?.options;
			this.update = vi.fn();
			this.destroy = vi.fn();
			this.resize = vi.fn();
			instances.push(this);
		}
		(Chart as any).instances = instances;
		(Chart as any).defaults = { global: {}, font: {} };
		(Chart as any).register = vi.fn();
		ctx.Chart = Chart;
	}
	if (stubOpts.sortable !== false) ctx.Sortable = { create: vi.fn(() => ({ destroy: vi.fn() })) };

	Object.assign(ctx, globals);

	/* ------------------------------ ajax mock ------------------------------ */

	const routeList: Array<{ pattern: AjaxPattern; responder: AjaxResponder }> = [];
	const requests: AjaxRequest[] = [];
	const queue: Array<() => void> = [];

	const ajax: AjaxMock = {
		requests,
		dispatch,
		allowUnknown: false,
		last: () => requests[requests.length - 1],
		pending: () => queue.length,
		flush() {
			let n = 0;
			while (queue.length) {
				queue.shift()!();
				n++;
			}
			return n;
		},
		route(pattern, responder) {
			routeList.push({ pattern, responder });
		},
		file(pattern, relPath) {
			// dataType comes from the request, not hardcoded: `RSSReader.js` and
			// `devtools/RSSFeedInterface.js` ask for `dataType: 'xml'` and must get a Document.
			routeList.push({
				pattern,
				responder: (req: AjaxRequest) => loadFromDisk(resolve(REPO_ROOT, relPath), req.dataType)
			});
		},
		fail(pattern, o) {
			routeList.push({ pattern, responder: () => ajaxError(o) });
		},
		reset() {
			routeList.length = 0;
			requests.length = 0;
			queue.length = 0;
		}
	};

	function loadFromDisk(abs: string, dataType: string): any {
		if (/\.json$/i.test(abs) || dataType === 'json') return readJson(abs);
		const text = readText(abs);
		if (/\.xml$/i.test(abs) || dataType === 'xml') return new window.DOMParser().parseFromString(text, 'text/xml');
		return text;
	}

	function resolveResponse(req: AjaxRequest): { data?: any; failure?: AjaxFailure } {
		for (let i = routeList.length - 1; i >= 0; i--) {
			if (!matchesPattern(routeList[i].pattern, req)) continue;
			const r = routeList[i].responder;
			let value = typeof r === 'function' ? r(req) : r;
			if (isFailure(value)) return { failure: value };
			if (typeof value === 'string' && req.dataType === 'xml') {
				value = new window.DOMParser().parseFromString(value, 'text/xml');
			}
			return { data: value };
		}

		if (req.path && !req.path.includes('..')) {
			const abs = resolve(STATIC_ROOT, req.path);
			if (abs.startsWith(STATIC_ROOT) && existsSync(abs) && statSync(abs).isFile()) {
				return { data: loadFromDisk(abs, req.dataType) };
			}
		}

		if (ajax.allowUnknown) return { data: undefined };
		throw new Error(
			`[legacy harness] Unhandled ${req.type} request to "${req.url}" ` +
				`(resolved path "${req.path}"). No route is registered and ` +
				`"${resolve(STATIC_ROOT, req.path)}" does not exist. ` +
				`Register one with env.ajax.route(pattern, data) / .fail(pattern) / .file(pattern, relPath).`
		);
	}

	function makeJqXHR(extra: Record<string, any>) {
		const deferred = ctx.$ ? ctx.$.Deferred() : null;
		const xhr: any = {
			readyState: 4,
			status: 200,
			statusText: 'OK',
			responseText: '',
			abort: () => {},
			getAllResponseHeaders: () => '',
			getResponseHeader: () => null,
			setRequestHeader: () => xhr,
			overrideMimeType: () => xhr,
			...extra
		};
		if (deferred) {
			deferred.promise(xhr);
			xhr.__deferred = deferred;
		} else {
			xhr.done = () => xhr;
			xhr.fail = () => xhr;
			xhr.always = () => xhr;
			xhr.then = () => xhr;
		}
		return xhr;
	}

	function doAjax(a: any, b?: any) {
		const settings: any = typeof a === 'string' ? { ...(b || {}), url: a } : { ...(a || {}) };
		const rawUrl = String(settings.url ?? '');
		const req: AjaxRequest = {
			url: rawUrl,
			path: normalizePath(rawUrl, webRoot),
			type: String(settings.type ?? settings.method ?? 'GET').toUpperCase(),
			dataType: String(settings.dataType ?? 'json'),
			data: settings.data,
			settings
		};
		requests.push(req);

		const xhr = makeJqXHR({});
		const ctxThis = settings.context ?? settings;

		const run = () => {
			// An unhandled URL throws out of here: it is a harness misconfiguration, never an
			// ajax `error` branch, so it must reach the test runner rather than the code under test.
			const result = resolveResponse(req);
			if (result.failure) {
				const f = result.failure;
				xhr.status = f.status;
				xhr.statusText = f.statusText;
				xhr.responseText = f.responseText;
				settings.error?.call(ctxThis, xhr, 'error', f.statusText);
				xhr.__deferred?.rejectWith(ctxThis, [xhr, 'error', f.statusText]);
				settings.complete?.call(ctxThis, xhr, 'error');
			} else {
				const data = result.data;
				if (typeof data === 'string') xhr.responseText = data;
				else if (data && typeof data === 'object' && req.dataType === 'json') xhr.responseJSON = data;
				settings.success?.call(ctxThis, data, 'success', xhr);
				xhr.__deferred?.resolveWith(ctxThis, [data, 'success', xhr]);
				settings.complete?.call(ctxThis, xhr, 'success');
			}
		};

		if (ajax.dispatch === 'sync') run();
		else queue.push(run);

		return xhr;
	}

	function shorthand(method: string, forcedDataType?: string) {
		return function (url: any, data?: any, success?: any, dataType?: any) {
			if (typeof url === 'object' && url !== null) return doAjax(url);
			if (typeof data === 'function') {
				dataType = success;
				success = data;
				data = undefined;
			}
			return doAjax({ url, type: method, data, success, dataType: forcedDataType ?? dataType ?? 'json' });
		};
	}

	/* ------------------------------ bootstrap ------------------------------ */

	let hoverEl: any = null;
	let disposed = false;

	const env: LegacyEnv = {
		window,
		document: window.document,
		ctx,
		get $() {
			return ctx.$;
		},
		dom,
		ajax,
		logs,
		loaded,
		load(...relPaths: string[]) {
			for (const rel of relPaths) {
				const abs = resolve(REPO_ROOT, rel);
				vm.runInContext(readSource(abs), ctx, { filename: abs });
				loaded.push(rel);
			}
		},
		exec<T = any>(code: string): T {
			return vm.runInContext(code, ctx) as T;
		},
		get<T = any>(name: string): T {
			return vm.runInContext(name, ctx) as T;
		},
		set(name: string, value: any) {
			ctx[name] = value;
		},
		html(markup: string) {
			window.document.body.innerHTML = markup;
		},
		resize(width: number, height = 768) {
			ctx.innerWidth = width;
			ctx.innerHeight = height;
			const de = window.document.documentElement;
			Object.defineProperty(de, 'clientWidth', { value: width, configurable: true });
			Object.defineProperty(de, 'clientHeight', { value: height, configurable: true });
			Object.defineProperty(window.screen, 'width', { value: width, configurable: true });
			Object.defineProperty(window.screen, 'height', { value: height, configurable: true });
			window.dispatchEvent(new window.Event('resize'));
		},
		hover(target: string | any | null) {
			if (!ctx.$) throw new Error('[legacy harness] env.hover() needs jQuery (jquery: true)');
			hoverEl = target == null ? null : (ctx.$(target)[0] ?? null);
		},
		get disposed() {
			return disposed;
		},
		dispose() {
			if (disposed) return;
			disposed = true;
			window.close();
		}
	};

	// Envs leak on a failed assertion: `dispose()` written as the last statement of a test never
	// runs when an expect above it throws, and `isolate: false` keeps the JSDOM window alive for
	// the worker's whole life. Register the teardown with vitest instead. `onTestFinished` throws
	// when there is no test running (an env built in `beforeAll`/module scope), in which case the
	// test file's own `afterAll(() => env.dispose())` is still the contract — dispose() is
	// idempotent, so doing both is safe.
	try {
		onTestFinished(() => env.dispose());
	} catch {
		/* not inside a test — the caller disposes */
	}

	if (jquery) {
		env.load(JQUERY_PATH);
		const $ = ctx.$;
		$.ajax = doAjax;
		$.getJSON = shorthand('GET', 'json');
		$.get = shorthand('GET');
		$.post = shorthand('POST');
		$.ajaxSetup = () => {};
		// See the `fx` option: jQuery's effects queue runs off requestAnimationFrame, which
		// installFakeTimers does not reach. Off by default so `.animate(..., cb)` completes
		// synchronously and `cb` is observable from the test.
		if (!fx) $.fx.off = true;
		// JSDOM has no pointer and nwsapi throws on `:hover`, but a dozen legacy click handlers
		// branch on `$(".thing:hover").length`. Teach Sizzle a `:hover` driven by `env.hover()`.
		$.expr.pseudos.hover = (elem: any) =>
			!!hoverEl && (elem === hoverEl || (typeof elem.contains === 'function' && elem.contains(hoverEl)));
	}

	for (const [pattern, responder] of routes) ajax.route(pattern, responder);
	if (scripts.length) env.load(...scripts);

	return env;
}

/* -------------------------------------------------------------------------- */
/* GameMaster helpers                                                         */
/* -------------------------------------------------------------------------- */

/**
 * A tiny, hand-built gamemaster with the same top-level shape as
 * `static/data/gamemaster.json`, for tests that need exotic or minimal data.
 * Mutate the returned object freely — it is built fresh on every call.
 */
export function syntheticGameMaster(overrides: Record<string, any> = {}): any {
	return {
		timestamp: '2024-01-01 00:00:00',
		id: 'synthetic',
		title: 'Synthetic Gamemaster',
		settings: { partySize: 3, maxBuffStages: 4, buffDivisor: 4 },
		rankingScenarios: [{ slug: 'leads', shields: [1, 1], energy: [0, 0], bait: [true, true] }],
		cups: [{ name: 'all', title: 'All Pokemon', include: [], exclude: [] }],
		formats: [
			{
				title: 'Great League',
				cup: 'all',
				cp: 1500,
				meta: 'all',
				showCup: true,
				showFormat: true,
				showMeta: true
			}
		],
		pokemonTags: ['legendary', 'mega', 'shadow'],
		pokemonTraits: { pros: ['bulky'], cons: ['glass cannon'] },
		fastMoveArchetypes: ['Fast Charge'],
		chargedMoveArchetypes: ['High Energy'],
		pokemonRegions: [{ name: 'Kanto', dex: [1, 151] }],
		shadowPokemon: [],
		greatLeagueIneligible: [],
		pokemon: [
			// The optional fields are split deliberately between the two entries so that BOTH arms
			// of every `if(pokemon.tags)` / `if(pokemon.thirdMoveCost)` style branch are reachable
			// against the synthetic gamemaster: Azumarill has `tags` + `level25CP` and no
			// `buddyDistance`/`thirdMoveCost`, Machamp has the other two and neither of the first.
			// Keep it that way when you extend this fixture.
			{
				dex: 184,
				speciesName: 'Azumarill',
				speciesId: 'azumarill',
				baseStats: { atk: 112, def: 152, hp: 225 },
				types: ['water', 'fairy'],
				fastMoves: ['BUBBLE'],
				chargedMoves: ['ICE_BEAM', 'PLAY_ROUGH'],
				tags: ['teraeligible'],
				defaultIVs: { cp1500: [43, 4, 15, 13], cp2500: [50, 15, 15, 15], cp500: [12, 4, 15, 15] },
				level25CP: 1258,
				released: true,
				family: { id: 'FAMILY_MARILL', parent: 'marill' }
			},
			{
				dex: 68,
				speciesName: 'Machamp',
				speciesId: 'machamp',
				baseStats: { atk: 234, def: 159, hp: 207 },
				types: ['fighting', 'none'],
				fastMoves: ['COUNTER'],
				chargedMoves: ['CROSS_CHOP', 'ROCK_SLIDE'],
				defaultIVs: { cp1500: [21.5, 0, 14, 13], cp2500: [40, 0, 15, 14], cp500: [7, 6, 15, 14] },
				buddyDistance: 3,
				thirdMoveCost: 10000,
				released: true,
				family: { id: 'FAMILY_MACHOP', parent: 'machoke' }
			}
		],
		// `abbreviation` is optional in the real gamemaster and `GameMaster.js:808` branches on it
		// (predefined vs. built from the initials of each word), so BUBBLE deliberately has none.
		moves: [
			{ moveId: 'BUBBLE', name: 'Bubble', type: 'water', power: 8, energy: 0, energyGain: 11, cooldown: 1500, archetype: 'Fast Charge', turns: 3 },
			{ moveId: 'COUNTER', name: 'Counter', abbreviation: 'Co', type: 'fighting', power: 8, energy: 0, energyGain: 7, cooldown: 1000, archetype: 'General', turns: 2 },
			{ moveId: 'ICE_BEAM', name: 'Ice Beam', abbreviation: 'IB', type: 'ice', power: 90, energy: 55, energyGain: 0, cooldown: 500, archetype: 'High Energy', turns: 1 },
			{ moveId: 'PLAY_ROUGH', name: 'Play Rough', abbreviation: 'PR', type: 'fairy', power: 90, energy: 60, energyGain: 0, cooldown: 500, archetype: 'High Energy', turns: 1 },
			{ moveId: 'CROSS_CHOP', name: 'Cross Chop', abbreviation: 'CC', type: 'fighting', power: 50, energy: 45, energyGain: 0, cooldown: 500, archetype: 'Low Energy', turns: 1 },
			{ moveId: 'ROCK_SLIDE', name: 'Rock Slide', abbreviation: 'RS', type: 'rock', power: 75, energy: 45, energyGain: 0, cooldown: 500, archetype: 'Low Energy', turns: 1 }
		],
		...overrides
	};
}

export interface GameMasterEnvOptions extends LegacyEnvOptions {
	/**
	 * Serve the real 1.7 MB `static/data/gamemaster.json` instead of {@link syntheticGameMaster}.
	 * Opt-in on purpose: against the real file the only assertions that stay true across a
	 * gamemaster recompile are stable identity facts (dex numbers, move ids). See CONVENTIONS §4.
	 */
	real?: boolean;
	/** Serve this exact object as the gamemaster (wins over `real`). */
	gamemaster?: any;
}

/**
 * An env with jQuery + `static/js/GameMaster.js` loaded and the singleton fully populated from
 * {@link syntheticGameMaster} — 2 Pokemon and 6 moves whose every number you can compute by hand.
 * Pass `{ real: true }` for the real `static/data/gamemaster.json`.
 *
 * `GameMaster` fires its `$.ajax` from inside the still-building IIFE, so this helper runs the
 * ajax layer in `'deferred'` mode, calls `getInstance()`, then flushes — after which the mock is
 * switched back to `'sync'`.
 *
 * ```ts
 * const { env, gm } = createGameMasterEnv();
 * expect(gm.getPokemonById('azumarill').baseStats.atk).toBe(112);
 * ```
 *
 * This helper is **main-site only**: `static/tera/js/GameMaster.js` declares the same `GameMaster`
 * global but loads `tera/data/gamemaster.json` and has a different object shape. See CONVENTIONS §5i.
 */
export function createGameMasterEnv(opts: GameMasterEnvOptions = {}): { env: LegacyEnv; gm: any } {
	const { real = false, gamemaster, ...rest } = opts;
	const env = createLegacyEnv({ ...rest, jquery: true, dispatch: 'deferred' });
	const data = gamemaster ?? (real ? undefined : syntheticGameMaster());
	if (data) {
		env.ajax.route(/data\/gamemaster(\.min)?\.json/, () => structuredClone(data));
	}
	env.load('static/js/GameMaster.js');
	const gm = env.get('GameMaster').getInstance();
	env.ajax.flush();
	env.ajax.dispatch = opts.dispatch ?? 'sync';
	return { env, gm };
}

/**
 * Legacy scripts that make up the battle simulator, in dependency order.
 * Frozen: `isolate: false` shares module scope between test files in a worker, so a test that
 * pushed onto this array would silently change what every later file loads.
 */
export const BATTLE_STACK: readonly string[] = Object.freeze([
	'static/js/GameMaster.js',
	'static/js/pokemon/Pokemon.js',
	'static/js/battle/timeline/TimelineEvent.js',
	'static/js/battle/timeline/TimelineAction.js',
	'static/js/battle/DamageCalculator.js',
	'static/js/battle/actions/ActionLogic.js',
	'static/js/pokemon/Player.js',
	'static/js/battle/Battle.js'
]);

/**
 * Shared widgets most `static/js/interface/*Interface.js` files reach for through globals,
 * in dependency order. They sit on top of {@link BATTLE_STACK} (they use `Battle` and `Pokemon`),
 * so load them after `createBattleEnv()`. Individual interface files may need more — load,
 * call `getInstance()`, read the `ReferenceError`, add the named file, repeat
 * (`tests/legacy/js/interface/PokeSearch.test.ts` is the worked example).
 *
 * Frozen for the same reason as {@link BATTLE_STACK}.
 */
export const INTERFACE_STACK: readonly string[] = Object.freeze([
	'static/js/interface/ModalWindow.js',
	'static/js/interface/PokeSearch.js',
	'static/js/interface/PokeSelect.js',
	'static/js/interface/Pokebox.js',
	'static/js/interface/PokeMultiSelect.js',
	'static/js/interface/SortableTable.js',
	'static/js/interface/BattleHistogram.js'
]);

export interface BattleEnvOptions extends GameMasterEnvOptions {
	/** Also load `static/js/training/TrainingAI.js` (needed for `new Player(i, aiType, battle)`). */
	trainingAI?: boolean;
}

/**
 * An env with the whole battle stack loaded, the synthetic GameMaster populated (pass
 * `{ real: true }` for the real one) and `Math.random` pinned.
 *
 * ```ts
 * const { env, gm, newBattle } = createBattleEnv();
 * const battle = newBattle();
 * battle.setNewPokemon(new (env.get('Pokemon'))('azumarill', 0, battle), 0);
 * ```
 */
export function createBattleEnv(opts: BattleEnvOptions = {}): {
	env: LegacyEnv;
	gm: any;
	newBattle: () => any;
} {
	const { trainingAI = false, ...gmOpts } = opts;
	// `Math.random` is already pinned by createLegacyEnv (see its `random` option).
	const { env, gm } = createGameMasterEnv(gmOpts);
	const rest = BATTLE_STACK.filter((f) => f !== 'static/js/GameMaster.js');
	if (trainingAI) rest.splice(rest.indexOf('static/js/pokemon/Player.js'), 0, 'static/js/training/TrainingAI.js');
	env.load(...rest);
	return { env, gm, newBattle: () => env.exec('new Battle()') };
}

/* -------------------------------------------------------------------------- */
/* Fake timers                                                                */
/* -------------------------------------------------------------------------- */

/** Controllable clock installed over the JSDOM window's timer functions. */
export interface FakeTimers {
	/** Advance the clock, running everything due. Returns how many callbacks ran. */
	tick(ms: number): number;
	/** Run every pending timeout (and up to `max` interval iterations). */
	runAll(max?: number): number;
	/** Number of scheduled, not-yet-run timers. */
	pending(): number;
	/** Elapsed fake time in ms, counted from 0 at install. */
	now(): number;
	/** Wall-clock time the context's `Date` reports: `wallClock() === options.now + now()`. */
	wallClock(): number;
	/** Put the real JSDOM timers and `Date` back. */
	restore(): void;
}

export interface FakeTimerOptions {
	/**
	 * Epoch ms the context's `Date` starts at. Default `Date.parse('2025-01-01T00:00:00.000Z')`.
	 * `new Date()` and `Date.now()` inside the context then track the fake clock, so `tick(1000)`
	 * moves them forward by exactly a second.
	 */
	now?: number | Date;
}

/**
 * Replace `setTimeout`/`setInterval`/`Date` inside the legacy context with a controllable clock.
 *
 * `vi.useFakeTimers()` patches Node's globals and does NOT reach the JSDOM window the legacy
 * scripts resolve `setTimeout` from, so use this instead for anything running in the context.
 *
 * The `Date` replacement matters for `interface/Pokebox.js:29` (`lastDateTime = Date.now()`,
 * which ends up in a cache-busting query string), `interface/TrainRankingInterface.js:569-570`
 * (`new Date()` minus 30 days, rendered into the chart's X axis) and
 * `devtools/RSSFeedInterface.js:27` (`new Date().toUTCString()` written into a feed item).
 */
export function installFakeTimers(env: LegacyEnv, options: FakeTimerOptions = {}): FakeTimers {
	const ctx = env.ctx;
	const epoch =
		options.now === undefined
			? Date.parse('2025-01-01T00:00:00.000Z')
			: options.now instanceof Date
				? options.now.getTime()
				: Number(options.now);
	const original = {
		setTimeout: ctx.setTimeout,
		clearTimeout: ctx.clearTimeout,
		setInterval: ctx.setInterval,
		clearInterval: ctx.clearInterval,
		Date: ctx.Date
	};
	type Timer = { id: number; at: number; fn: any; args: any[]; every: number | null };
	let clock = 0;
	let nextId = 1;
	let timers: Timer[] = [];

	const schedule = (fn: any, ms: any, args: any[], every: number | null) => {
		const delay = Number(ms) || 0;
		const t: Timer = { id: nextId++, at: clock + delay, fn, args, every };
		timers.push(t);
		return t.id;
	};
	const clear = (id: any) => {
		timers = timers.filter((t) => t.id !== id);
	};

	ctx.setTimeout = (fn: any, ms: any, ...args: any[]) => schedule(fn, ms, args, null);
	ctx.setInterval = (fn: any, ms: any, ...args: any[]) => schedule(fn, ms, args, Number(ms) || 1);
	ctx.clearTimeout = clear;
	ctx.clearInterval = clear;

	// A Date whose "now" is the fake clock. Everything else (parsing, explicit arguments, the
	// static helpers, the prototype) is the context's real Date, inherited.
	const RealDate = original.Date;
	class FakeDate extends RealDate {
		constructor(...args: any[]) {
			if (args.length === 0) super(epoch + clock);
			else super(...(args as [any]));
		}
		static now() {
			return epoch + clock;
		}
	}
	ctx.Date = FakeDate;

	const runDue = (until: number) => {
		let ran = 0;
		for (;;) {
			timers.sort((a, b) => a.at - b.at || a.id - b.id);
			const t = timers[0];
			if (!t || t.at > until) break;
			timers.shift();
			clock = t.at;
			if (t.every !== null) timers.push({ ...t, at: t.at + t.every });
			if (typeof t.fn === 'function') t.fn(...t.args);
			else env.exec(String(t.fn));
			ran++;
			if (ran > 10000) throw new Error('[legacy harness] fake timers: runaway timer loop');
		}
		clock = until;
		return ran;
	};

	return {
		tick: (ms: number) => runDue(clock + ms),
		runAll(max = 1000) {
			let ran = 0;
			for (let i = 0; i < max; i++) {
				const t = timers.slice().sort((a, b) => a.at - b.at)[0];
				if (!t) break;
				ran += runDue(t.at);
			}
			return ran;
		},
		pending: () => timers.length,
		now: () => clock,
		wallClock: () => epoch + clock,
		restore() {
			Object.assign(ctx, original);
		}
	};
}
