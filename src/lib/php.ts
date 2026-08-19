/**
 * Small helpers that reproduce the exact semantics of the PHP functions the
 * legacy templates relied on, so the rendered markup stays byte-compatible.
 */

/** PHP string conversion of a loosely typed value (what `echo` / htmlspecialchars() would print). */
export function phpString(value: unknown): string {
	if (value === null || value === undefined || value === false) return '';
	if (value === true) return '1';
	if (typeof value === 'number') return String(value);
	if (typeof value === 'string') return value;
	if (Array.isArray(value)) return 'Array';
	return String(value);
}

/** PHP truthiness ("0", "", 0, null, false, [] are false; "false" is true). */
export function phpTruthy(value: unknown): boolean {
	if (value === null || value === undefined || value === false) return false;
	if (value === true) return true;
	if (typeof value === 'number') return value !== 0;
	if (typeof value === 'string') return value !== '' && value !== '0';
	if (Array.isArray(value)) return value.length > 0;
	return true;
}

/** PHP intval(): leading-integer parse for strings, 1/0 for booleans, truncation for floats. */
export function phpIntval(value: unknown): number {
	if (value === null || value === undefined || value === false) return 0;
	if (value === true) return 1;
	if (typeof value === 'number') return Number.isFinite(value) ? Math.trunc(value) : 0;
	if (typeof value === 'string') {
		const m = /^\s*([+-]?\d+)/.exec(value);
		return m ? parseInt(m[1], 10) : 0;
	}
	if (Array.isArray(value)) return value.length > 0 ? 1 : 0;
	return 1;
}

/** PHP htmlspecialchars() with PHP 8.1+ default flags (ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML401). */
export function htmlspecialchars(value: unknown): string {
	return phpString(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

/** PHP ucwords(): uppercase the first character of every whitespace-delimited word. */
export function ucwords(value: string): string {
	return value.replace(/(^|[ \t\r\n\f\v])([a-z])/g, (_m, sep: string, c: string) => sep + c.toUpperCase());
}

/**
 * The name derivation used by rankings.php / battle.php / gm-editor / tera:
 * `ucwords(str_replace('_', ' ', explode('-', htmlspecialchars($speciesId))[0]))`
 */
export function phpNameFromSpeciesId(speciesId: string): string {
	return ucwords(htmlspecialchars(speciesId).split('-')[0].replace(/_/g, ' '));
}

/** PHP json_encode() default flags: escaped slashes and \uXXXX for non-ASCII. */
export function phpJsonEncode(value: unknown): string {
	return JSON.stringify(value)
		.replace(/\//g, '\\/')
		.replace(/[\u0080-\uffff]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
}

/** PHP urlencode() (what setcookie() applies to cookie values). */
export function phpUrlencode(value: string): string {
	return encodeURIComponent(value)
		.replace(/[!'()*~]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
		.replace(/%20/g, '+');
}

/** PHP urldecode() (what PHP applies when populating $_COOKIE). */
export function phpUrldecode(value: string): string {
	try {
		return decodeURIComponent(value.replace(/\+/g, ' '));
	} catch {
		return value;
	}
}
