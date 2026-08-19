#!/usr/bin/env bash
#
# Compare a page rendered by the SvelteKit port against the untouched PHP reference site.
#
#   scripts/php-diff.sh <path> [port] [curl options…]
#   scripts/php-diff.sh /settings/ 5173
#   scripts/php-diff.sh /rankings/all/1500/overall/ 5173 -b 'settings={"theme":"night"}'
#
# Fetches http://localhost/pvpoke-ref/src<path> (reference, webRoot /pvpoke-ref/src/) and
# http://localhost:<port><path> (SvelteKit dev/preview server, default port 5173), normalises
# both and prints a unified diff followed by PASS/FAIL. Environment overrides:
#   PVPOKE_REF_BASE   default http://localhost/pvpoke-ref/src
#   PVPOKE_REF_ROOT   default /pvpoke-ref/src/   (the reference site's $WEB_ROOT)
#
# Normalisation (both sides): HTML comments stripped; the reference webRoot/host rewritten
# to ours; `?v=<digits…>` cache busters and the footer version replaced by placeholders;
# HTML entities decoded; `<br/>`-style self-closing slashes removed; whitespace collapsed;
# one tag per line. Remaining differences are real.
set -u

PATH_ARG="${1:-}"
PORT="${2:-5173}"
if [ $# -ge 2 ]; then shift 2; else shift $#; fi
if [ -z "$PATH_ARG" ]; then
	echo "usage: $0 <path> [port] [curl options…]" >&2
	exit 2
fi

REF_BASE="${PVPOKE_REF_BASE:-http://localhost/pvpoke-ref/src}"
REF_ROOT="${PVPOKE_REF_ROOT:-/pvpoke-ref/src/}"
LOCAL_BASE="http://localhost:${PORT}"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

curl -s -L "$@" "${REF_BASE}${PATH_ARG}" -o "$TMP/ref.raw" || { echo "FAIL: could not fetch ${REF_BASE}${PATH_ARG}"; exit 1; }
curl -s -L "$@" "${LOCAL_BASE}${PATH_ARG}" -o "$TMP/new.raw" || { echo "FAIL: could not fetch ${LOCAL_BASE}${PATH_ARG}"; exit 1; }

# node rather than python: the container's python3 is the minimal build without `html`.
normalise() {
	node - "$1" "$2" "$REF_ROOT" "$REF_BASE" "$LOCAL_BASE" <<'JS'
const fs = require('fs');
const [src, dst, refRoot, refBase, localBase] = process.argv.slice(2);
let s = fs.readFileSync(src, 'utf8');
// strip HTML comments (PHP's own comments and Svelte's SSR markers)
s = s.replace(/<!--[\s\S]*?-->/g, '');
// reference webRoot / host → ours
s = s.split(refBase + '/').join(localBase + '/');
s = s.split('http://localhost' + refRoot).join(localBase + '/');
s = s.split(refRoot).join('/');
// cache busters (random in dev) and the footer version
s = s.replace(/\?v=[0-9][0-9.]*/g, '?v=V');
s = s.replace(/\?=[0-9][0-9.]*/g, '?=V');
s = s.replace(/(<a href="https:\/\/github.com\/pvpoke\/pvpoke\/releases">)[0-9.]+(<\/a>)/g, '$1VERSION$2');
s = s.replace(/var siteVersion = "[0-9.]+";/g, 'var siteVersion = "V";');
// decode entities (&amp; vs &, &#039; vs ', …)
const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', copy: '©', reg: '®',
	rarr: '→', larr: '←', uarr: '↑', darr: '↓', ldquo: '“', rdquo: '”', lsquo: '‘',
	rsquo: '’', sect: '§', mdash: '—', ndash: '–', hellip: '…', eacute: 'é', times: '×',
	middot: '·', bull: '•', deg: '°', trade: '™', laquo: '«', raquo: '»', frac12: '½',
	lowast: '∗', star: '☆', hearts: '♥', check: '✓', cross: '✗' };
const decode = (t) => t.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]*);/g, (m, e) => {
	if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
	return e in named ? named[e] : m;
});
s = decode(decode(s));
// self-closing slashes: <br/> <img … /> → <br> <img …>
s = s.replace(/\s*\/>/g, '>');
// boolean attributes: Svelte renders `selected=""`, PHP wrote `selected` — same thing
s = s.replace(/(\s[a-zA-Z-]+)=""/g, '$1');
// whitespace: collapse, one tag per line, drop empty lines
s = s.replace(/\s+/g, ' ');
s = s.split('<').join('\n<');
s = s.replace(/\s*>\s*/g, '>');
s = s.replace(/\s*\n\s*/g, '\n');
const lines = s.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
fs.writeFileSync(dst, lines.join('\n') + '\n');
JS
}

normalise "$TMP/ref.raw" "$TMP/ref.txt"
normalise "$TMP/new.raw" "$TMP/new.txt"

if diff -u --label "reference ${REF_BASE}${PATH_ARG}" --label "sveltekit ${LOCAL_BASE}${PATH_ARG}" "$TMP/ref.txt" "$TMP/new.txt"; then
	echo "PASS ${PATH_ARG}"
	exit 0
else
	echo "FAIL ${PATH_ARG}"
	exit 1
fi
