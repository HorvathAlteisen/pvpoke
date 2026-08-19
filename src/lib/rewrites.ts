/**
 * Line-by-line port of the mod_rewrite table that lived in `src/.htaccess`.
 *
 * Each entry keeps the original regex body (same anchoring, same `.*$` tails, same
 * character classes) and the original substitution query string, in the original rule
 * order — first match wins, exactly like `[L]`. The PHP target file becomes the SvelteKit
 * route path (`rankings.php` → `/rankings`, `gm-editor/edit.php` → `/gm-editor/edit`, …).
 *
 * mod_rewrite matched per-directory rules against the path *relative to the directory*,
 * i.e. without the leading slash, so `matchRewrite()` expects `rankings/all/1500/overall/`
 * (see `src/hooks.ts`). Because the patterns were never anchored with `^` in many cases,
 * `foo/battle/` matches too — that quirk is preserved on purpose.
 *
 * The `[QSA]` flag (append the original query string) is applied by the root layout load,
 * which overlays `url.searchParams` on top of the params returned here.
 *
 * The legacy redirects (`season-*`, `unite`, `contribute`, `index.php`) live in
 * `src/hooks.server.ts`; the `tera/...` rules were guarded by `!-f/!-d` conditions, which
 * SvelteKit satisfies by serving `static/` before any routing happens.
 */

export interface RewriteMatch {
	/** SvelteKit route path the request is rerouted to, e.g. '/rankings'. */
	route: string;
	/** Query parameters the rule produced, in substitution order (PHP `$_GET` order). */
	params: Record<string, string>;
}

interface Rule {
	re: RegExp;
	route: string;
	/** Substitution query string with `$n` backreferences, e.g. 'cup=$1&cp=$2'. '' = none. */
	query: string;
}

const rule = (pattern: string, route: string, query = ''): Rule => ({
	re: new RegExp(pattern),
	route,
	query
});

// prettier-ignore
export const RULES: Rule[] = [
	// battle.php — multi battle
	rule('battle/multi/([\\d-]+)/([a-zA-Z0-9-]+)/([a-zA-Z_\\d\\.-]+)/([\\d-]+)/([\\da-zA-Z_-]+)/([a-z\\d-]+)/(\\d+)/(\\d+)/([a-zA-Z_]+).*$', '/battle', 'mode=multi&cp=$1&cup=$2&p1=$3&s=$4&m1=$5&cms=$6&h=$7&e=$8&g1=$9'),
	rule('battle/multi/([\\d-]+)/([a-zA-Z0-9-]+)/([a-zA-Z_\\d\\.-]+)/([\\d-]+)/([\\da-zA-Z_-]+)/([a-z\\d-]+)/(\\d+)/(\\d+).*$', '/battle', 'mode=multi&cp=$1&cup=$2&p1=$3&s=$4&m1=$5&cms=$6&h=$7&e=$8'),
	rule('battle/multi/([\\d-]+)/([a-zA-Z0-9-]+)/([a-zA-Z_\\d\\.-]+)/([\\d-]+)/([\\da-zA-Z_-]+)/([a-z\\d-]+)/([a-zA-Z_]+).*$', '/battle', 'mode=multi&cp=$1&cup=$2&p1=$3&s=$4&m1=$5&cms=$6&g1=$7'),
	rule('battle/multi/([\\d-]+)/([a-zA-Z0-9-]+)/([a-zA-Z_\\d\\.-]+)/([\\d-]+)/([\\da-zA-Z_-]+)/([a-z\\d-]+).*$', '/battle', 'mode=multi&cp=$1&cup=$2&p1=$3&s=$4&m1=$5&cms=$6'),
	rule('battle/multi/([\\d-]+)/([a-zA-Z0-9-]+)/([a-zA-Z_\\d\\.-]+)/([\\d-]+)/([a-z\\d-]+).*$', '/battle', 'mode=multi&cp=$1&cup=$2&p1=$3&s=$4&cms=$5'),

	rule('battle/multi.*$', '/battle', 'mode=multi'),

	// battle.php — matrix battle
	rule('battle/matrix/([\\d-]+)/([a-zA-Z_\\-0-9,\\.]+)/([a-zA-Z_\\-0-9,\\.]+)/([\\d-]+).*$', '/battle', 'mode=matrix&cp=$1&matrix1=$2&matrix2=$3&s=$4'),
	rule('battle/matrix/([\\d-]+)/([a-zA-Z_\\-0-9,\\.]+)/([a-zA-Z_\\-0-9,\\.]+).*$', '/battle', 'mode=matrix&cp=$1&matrix1=$2&matrix2=$3'),
	rule('battle/matrix.*$', '/battle', 'mode=matrix'),

	// battle.php — sandbox
	rule('battle/sandbox/(\\d+)/([a-zA-Z_\\d\\.-]+)/([a-zA-Z_\\d\\.-]+)/(\\d+)/([\\da-zA-Z_-]+)/([\\da-zA-Z_-]+)/([\\d-]+)/([\\d-]+)/([\\d\\.-]+).*$', '/battle', 'cp=$1&p1=$2&p2=$3&s=$4&m1=$5&m2=$6&h=$7&e=$8&sandbox=1&a=$9'),
	rule('battle/sandbox/(\\d+)/([a-zA-Z_\\d\\.-]+)/([a-zA-Z_\\d\\.-]+)/(\\d+)/([\\da-zA-Z_-]+)/([\\da-zA-Z_-]+)/([\\d\\.-]+).*$', '/battle', 'cp=$1&p1=$2&p2=$3&s=$4&m1=$5&m2=$6&sandbox=1&a=$7'),

	// battle.php — single battle
	rule('battle/([\\d-]+)/([a-zA-Z_\\d\\.-]+)/([a-zA-Z_\\d\\.-]+)/(\\d+)/([\\da-zA-Z_-]+)/([\\da-zA-Z_-]+)/([\\d-]+)/([\\d-]+).*$', '/battle', 'cp=$1&p1=$2&p2=$3&s=$4&m1=$5&m2=$6&h=$7&e=$8'),
	rule('battle/([\\d-]+)/([a-zA-Z_\\d\\.-]+)/([a-zA-Z_\\d\\.-]+)/(\\d+)/([\\da-zA-Z_-]+)/([\\da-zA-Z_-]+).*$', '/battle', 'cp=$1&p1=$2&p2=$3&s=$4&m1=$5&m2=$6'),
	rule('battle/([\\d-]+)/([a-zA-Z_]+)/([a-zA-Z_]+)/(\\d+).*$', '/battle', 'cp=$1&p1=$2&p2=$3&s=$4'),
	rule('battle.?$', '/battle'),

	// rankings.php
	rule('^rankings/([a-zA-Z0-9-]+)/(\\d+)/([a-zA-Z]+)/([a-zA-Z_]+).*$', '/rankings', 'cup=$1&cp=$2&cat=$3&p=$4'),
	rule('^rankings/(\\d+)/([a-zA-Z0-9-]+)/([a-zA-Z_]+).*$', '/rankings', 'cp=$1&cat=$2&p=$3'),
	rule('^rankings/([a-zA-Z0-9-]+)/(\\d+)/([a-zA-Z]+).*$', '/rankings', 'cup=$1&cp=$2&cat=$3'),
	rule('^rankings/(\\d+)/([a-zA-Z0-9-]+).*$', '/rankings', 'cp=$1&cat=$2'),
	rule('^rankings/(\\d+).*$', '/rankings', 'cp=$1'),
	rule('^rankings.?$', '/rankings'),

	// team-builder.php
	rule('team-builder/([a-zA-Z0-9-]+)/([\\d-]+)/([a-zA-Z_]+)/([a-zA-Z_]+)/([a-zA-Z_]+)/([\\da-zA-Z_-]+)/([\\da-zA-Z_-]+)/([\\da-zA-Z_-]+).*$', '/team-builder', 'cup=$1&cp=$2&p1=$3&p2=$4&p3=$5&m1=$6&m2=$7&m3=$8'),
	rule('team-builder/([a-zA-Z0-9-]+)/([\\d-]+)/([a-zA-Z_]+)/([a-zA-Z_]+)/([\\da-zA-Z_-]+)/([\\da-zA-Z_-]+).*$', '/team-builder', 'cup=$1&cp=$2&p1=$3&p2=$4&m1=$5&m2=$6'),
	rule('team-builder/([a-zA-Z0-9-]+)/([\\d-]+)/([a-zA-Z_]+)/([\\da-zA-Z_-]+).*$', '/team-builder', 'cup=$1&cp=$2&p1=$3&m1=$4'),
	rule('team-builder/([a-zA-Z0-9-]+)/([\\d-]+)/([a-zA-Z_\\-0-9,\\.]+).*$', '/team-builder', 'cup=$1&cp=$2&t=$3'),
	rule('team-builder.?$', '/team-builder'),

	// train/analysis.php
	rule('train/analysis.?$', '/train/analysis'),
	rule('^train/analysis/([a-zA-Z0-9-]+)/(\\d+)/.*$', '/train/analysis', 'cup=$1&cp=$2'),

	// attack-cmp-chart.php
	rule('^attack-cmp-chart/([a-zA-Z0-9-]+)/(\\d+)/([a-zA-Z_]+).*$', '/attack-cmp-chart', 'cup=$1&cp=$2&p=$3'),
	rule('^attack-cmp-chart/([a-zA-Z0-9-]+)/(\\d+).*$', '/attack-cmp-chart', 'cup=$1&cp=$2'),
	rule('attack-cmp-chart.?$', '/attack-cmp-chart'),

	// train/editor.php
	rule('train/editor.?$', '/train/editor'),

	// gm-editor/pokemon.php, gm-editor/edit.php?c=pokemon
	rule('^gm-editor/pokemon/([a-zA-Z0-9_]+).*$', '/gm-editor/pokemon', 'p=$1'),
	rule('gm-editor/pokemon.?$', '/gm-editor/edit', 'c=pokemon'),

	// gm-editor/move.php, gm-editor/edit.php?c=moves
	rule('^gm-editor/moves/([a-zA-Z0-9_]+).*$', '/gm-editor/move', 'm=$1'),
	rule('gm-editor/moves.?$', '/gm-editor/edit', 'c=moves'),

	// tera/index.php (originally guarded by RewriteCond %{REQUEST_FILENAME} !-f / !-d)
	rule('tera/([\\da-zA-Z_-]+)/([\\da-zA-Z_-]+)/([\\da-zA-Z_-]+)/([\\da-zA-Z_-]+).*$', '/tera', 'p=$1&t=$2&a=$3&tr=$4'),
	rule('tera/([\\da-zA-Z_-]+)/([\\da-zA-Z_-]+)/([\\da-zA-Z_-]+).*$', '/tera', 'p=$1&t=$2&a=$3'),
	rule('tera/([\\da-zA-Z_-]+)/([\\da-zA-Z_-]+).*$', '/tera', 'p=$1&t=$2'),
	rule('tera/([\\da-zA-Z_-]+).*$', '/tera', 'p=$1'),

	// moves.php
	rule('moves/([a-zA-Z_]+).*$', '/moves', 'mode=$1'),
	rule('moves.?$', '/moves'),

	// contact.php, privacy.php, settings.php, custom-rankings.php
	rule('contact.?$', '/contact'),
	rule('privacy.?$', '/privacy'),
	rule('settings.?$', '/settings'),
	rule('custom-rankings.?$', '/custom-rankings'),

	// articles/$1.php
	rule('articles/(.*)/$', '/articles/$1'),

	// rss/feed.xml
	rule('rss/$', '/rss')
];

function substitute(template: string, m: RegExpExecArray): string {
	return template.replace(/\$(\d)/g, (_s, n: string) => m[Number(n)] ?? '');
}

function parseQuery(query: string): Record<string, string> {
	const params: Record<string, string> = {};
	if (query === '') return params;
	for (const pair of query.split('&')) {
		const eq = pair.indexOf('=');
		if (eq === -1) {
			params[pair] = '';
		} else {
			params[pair.slice(0, eq)] = pair.slice(eq + 1);
		}
	}
	return params;
}

/**
 * Match a request path (without leading slash, without query string) against the rewrite
 * table. Returns the first matching rule's route and params, or null when no rule matches
 * (the request then goes to the SvelteKit router untouched, e.g. `/`, `/train/`,
 * `/gm-editor/`, `/articles/`, `/pokedex.php`, `/tera/`).
 */
export function matchRewrite(path: string): RewriteMatch | null {
	for (const r of RULES) {
		const m = r.re.exec(path);
		if (m) {
			return {
				route: substitute(r.route, m),
				params: parseQuery(substitute(r.query, m))
			};
		}
	}
	return null;
}
