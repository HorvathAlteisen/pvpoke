/**
 * PHP `$_SETTINGS` semantics from header.php: the `settings` cookie is a JSON object
 * written by data/settingsCookie.php (all values are strings, e.g. "1"), decoded and then
 * padded with defaults. When no cookie exists a fixed default object is used instead.
 *
 * Values are kept loosely typed on purpose (string | number | boolean | …) because the
 * PHP templates apply `intval()`, truthiness and `== 1` comparisons at the point of use
 * (see `$lib/php` for those helpers and `settingIsOne()` below).
 */

export type SettingValue = string | number | boolean | null | undefined;

export interface Settings {
	defaultIVs: SettingValue;
	animateTimeline: SettingValue;
	theme: SettingValue;
	matrixDirection: SettingValue;
	gamemaster: SettingValue;
	pokeboxId: SettingValue;
	pokeboxLastDateTime: SettingValue;
	ads: SettingValue;
	xls: SettingValue;
	rankingDetails: SettingValue;
	hardMovesetLinks: SettingValue;
	colorblindMode: SettingValue;
	performanceMode: SettingValue;
	/** Display language for Pokemon names; "en" is the gamemaster's own names. */
	language: SettingValue;
	/** true when the `settings` cookie was present (header.php `isset($_COOKIE['settings'])`). */
	fromCookie: boolean;
	/** Any other keys the cookie carried (PHP keeps them on the object). */
	[key: string]: SettingValue;
}

/** header.php: `$_SETTINGS` when no cookie is set. */
export function defaultSettings(): Settings {
	return {
		defaultIVs: 'gamemaster',
		animateTimeline: 1,
		theme: 'default',
		gamemaster: 'gamemaster',
		pokeboxId: 0,
		ads: 1,
		xls: 1,
		rankingDetails: 'one-page',
		hardMovesetLinks: 0,
		colorblindMode: 0,
		performanceMode: 0,
		language: 'en',
		matrixDirection: undefined,
		pokeboxLastDateTime: undefined,
		fromCookie: false
	};
}

/** PHP isset(): present and not null. */
function isset(obj: Record<string, unknown>, key: string): boolean {
	return obj[key] !== undefined && obj[key] !== null;
}

/**
 * Port of the cookie branch of header.php. `raw` is the url-decoded cookie value (or
 * undefined when the cookie is absent).
 */
export function parseSettingsCookie(raw: string | undefined): Settings {
	if (raw === undefined) {
		return defaultSettings();
	}

	let decoded: unknown;
	try {
		decoded = JSON.parse(raw);
	} catch {
		decoded = null;
	}

	// json_decode() of anything but an object gives PHP something it cannot set properties
	// on; treat it as an empty object so the defaults below apply.
	const obj: Record<string, unknown> =
		decoded !== null && typeof decoded === 'object' && !Array.isArray(decoded)
			? { ...(decoded as Record<string, unknown>) }
			: {};

	if (!isset(obj, 'matrixDirection')) {
		obj.matrixDirection = 'row';
	}

	// Deprecate old gamemaster versions
	if (!isset(obj, 'gamemaster')) {
		obj.gamemaster = 'gamemaster';
	} else if (obj.gamemaster == 'gamemaster-paldea') {
		obj.gamemaster = 'gamemaster';
	} else if (obj.gamemaster == 'gamemaster-mega') {
		obj.gamemaster = 'gamemaster';
	}

	if (!isset(obj, 'pokeboxId')) {
		obj.pokeboxId = false;
	}

	if (!isset(obj, 'pokeboxLastDateTime')) {
		obj.pokeboxLastDateTime = 0;
	}

	if (!isset(obj, 'ads')) {
		obj.ads = 1;
	}

	if (!isset(obj, 'xls')) {
		obj.xls = 1;
	}

	if (!isset(obj, 'rankingDetails')) {
		obj.rankingDetails = 'one-page';
	}

	if (!isset(obj, 'hardMovesetLinks')) {
		obj.hardMovesetLinks = 0;
	}

	if (!isset(obj, 'colorblindMode')) {
		obj.colorblindMode = 0;
	}

	if (!isset(obj, 'performanceMode')) {
		obj.performanceMode = 0;
	}

	if (!isset(obj, 'theme')) {
		obj.theme = 'default';
	}

	// Not part of the original PHP: Pokemon name language, added with the localized names.
	if (!isset(obj, 'language')) {
		obj.language = 'en';
	}

	// Nested values cannot occur from settingsCookie.php (flat form post); flatten defensively.
	const settings = {} as Settings;
	for (const [key, value] of Object.entries(obj)) {
		settings[key] =
			typeof value === 'object' && value !== null ? JSON.stringify(value) : (value as SettingValue);
	}
	settings.fromCookie = true;
	return settings;
}

/**
 * PHP `$_SETTINGS->x == 1` (loose comparison). PHP 8 rules: true, 1, numeric strings equal
 * to one ("1", "01", "1.0", " 1") are equal to 1; "1abc", "", "0", null, false are not.
 */
export function settingIsOne(value: SettingValue): boolean {
	if (value === true || value === 1) return true;
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (trimmed === '') return false;
		return /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(trimmed) && Number(trimmed) === 1;
	}
	return false;
}

/** tera/header.php only reads `ads` from the cookie (default 1). */
export function parseTeraSettings(raw: string | undefined): { ads: SettingValue } {
	if (raw === undefined) return { ads: 1 };
	return { ads: parseSettingsCookie(raw).ads };
}
