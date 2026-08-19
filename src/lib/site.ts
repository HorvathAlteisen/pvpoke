import type { Settings } from '$lib/settings';

/** header.php `$SITE_VERSION` */
export const SITE_VERSION = '1.37.4.6';
/** tera/header.php `$SITE_VERSION` */
export const TERA_SITE_VERSION = '1.3.11';

/**
 * Default `<title>` / description / og:image from header.php. Like the PHP, meta strings are
 * echoed RAW into the head (the layout uses {@html}), so this one keeps its `&amp;` entity
 * and page titles built from htmlspecialchars()'d names keep their `&#039;`.
 */
export const DEFAULT_META_TITLE =
	'PvPoke | Open-Source Battle Simulator, Rankings &amp; Team Building for Pokemon GO PvP';
export const DEFAULT_META_DESCRIPTION =
	'Looking for an edge in Pokemon GO Trainer Battles? Become a master with our open-source Pokemon battle simulator, explore the top Pokemon rankings, and get your team rated for PvP battles.';
export const DEFAULT_OG_IMAGE = 'https://pvpoke.com/img/og.jpg';

function rand(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * header.php: the real version in production, a random `x.y.z` on every request in
 * development so nothing is cached while testing.
 */
export function siteVersion(dev: boolean, version: string = SITE_VERSION): string {
	if (dev) {
		return `${rand(1, 1000)}.${rand(1, 1000)}.${rand(1, 1000)}`;
	}
	return version;
}

/**
 * The `switch($cp)` used by rankings.php / attack-cmp-chart.php / train/analysis.php to
 * turn a CP cap into a league name. `includeClassic` adds the `10000-40` case that only
 * rankings.php has; `fallback` is what the switch's default branch yields.
 */
export function leagueName(cp: string, fallback = 'Great League', includeClassic = true): string {
	switch (cp) {
		case '500':
			return 'Little Cup';
		case '1500':
			return 'Great League';
		case '2500':
			return 'Ultra League';
		case '10000':
			return 'Master League';
		case '10000-40':
			return includeClassic ? 'Master League Classic' : fallback;
		default:
			return fallback;
	}
}

/** What a page's `+page.server.ts` load returns as `meta` (header.php's $META_* variables). */
export interface PageMeta {
	/**
	 * `$META_TITLE` WITHOUT the ` | PvPoke` suffix; undefined → header.php's long default title.
	 * Emitted raw (not HTML-escaped), exactly like PHP's `echo $META_TITLE` — escape yourself where
	 * the PHP page did (htmlspecialchars on $_GET values).
	 */
	title?: string;
	/** `$META_DESCRIPTION`; undefined → default description. */
	description?: string;
	/** `$CANONICAL` (relative path like `/rankings/all/1500/overall/`); undefined → no tag. */
	canonical?: string;
	/** `$OG_IMAGE`; undefined → `https://pvpoke.com/img/og.jpg`. */
	ogImage?: string;
}

/** Data returned by the root `+layout.server.ts` (available as `page.data` everywhere). */
export interface PvpokeLayoutData {
	dev: boolean;
	webRoot: string;
	host: string;
	siteVersion: string;
	requestUri: string;
	get: Record<string, string> | false;
	settings: Settings;
	gaId: string;
	performGroupMigration: boolean;
	cookieGroupsToMigrate: string[];
}
