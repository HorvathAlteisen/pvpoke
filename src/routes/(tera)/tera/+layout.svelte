<script lang="ts">
	/**
	 * tera/header.php + tera/footer.php: the tera mini-site's own chrome, independent of the
	 * main site's (main)/+layout.svelte. Differences from the main layout: no RSSReader.js,
	 * different default title/description/og:image, a `$_SETTINGS` that only carries `ads`
	 * (page.data.settings.ads is identical either way — parseSettingsCookie()/
	 * parseTeraSettings() apply the same default-1 rule to that field), no `settings` in the
	 * inline globals script, canonical is htmlspecialchars()'d at render time (tera/header.php
	 * `echo htmlspecialchars($CANONICAL)`, vs. the main layout which echoes canonical raw
	 * because its callers already escape their $_GET-derived pieces before building it).
	 */
	import { page } from '$app/state';
	import { htmlspecialchars, phpJsonEncode } from '$lib/php';
	import Analytics from '$lib/components/layout/Analytics.svelte';
	import TeraHeader from '$lib/components/tera/TeraHeader.svelte';
	import TeraFooter from '$lib/components/tera/TeraFooter.svelte';
	import AdSlot from '$lib/components/ads/AdSlot.svelte';

	let { children } = $props();

	const TERA_DEFAULT_META_TITLE = 'Tera Raid Counter Calculator | PvPoke';
	const TERA_DEFAULT_META_DESCRIPTION =
		'Find the best Pokemon, typings, and Tera types to use against Tera Raid bosses in Pokemon Scarlet & Pokemon Violet.';
	const TERA_DEFAULT_OG_IMAGE = 'https://pvpoke.com/tera/img/og.jpg';

	const { host, webRoot, siteVersion, get } = $derived(page.data);
	const meta = $derived(page.data.meta ?? {});

	// tera/header.php: $META_TITLE default or "<title> | PvPoke"
	const title = $derived(
		meta.title === undefined ? TERA_DEFAULT_META_TITLE : meta.title + ' | PvPoke'
	);
	const description = $derived(meta.description ?? TERA_DEFAULT_META_DESCRIPTION);
	const ogImage = $derived(meta.ogImage ?? TERA_DEFAULT_OG_IMAGE);
	// tera/header.php: <?php echo htmlspecialchars($CANONICAL); ?> — $CANONICAL itself is built
	// from raw (unescaped) $_GET values by tera/index.php, escaped only here.
	const canonical = $derived(meta.canonical !== undefined ? htmlspecialchars(meta.canonical) : undefined);

	// header.php echoes these raw (no escaping) and Svelte would move a <title> written in
	// <svelte:head> to the end of the head, so the block is emitted as one raw HTML string.
	const metaHtml = $derived(
		`<title>${title}</title>
<meta name="description" content="${description}" />
` +
			(canonical !== undefined
				? `
	<link rel="canonical" href="${canonical}" /><!--Prevents Google from indexing hundreds of different versions of the same page-->
`
				: '') +
			`
<!--OG tags for social-->
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${ogImage}" />`
	);

	// tera/header.php's inline globals script: no `settings` global here (only `ads` is read,
	// server-side, to gate the ad slots).
	const getScript = $derived(get ? 'var get = ' + phpJsonEncode(get) + ';' : 'var get = false;');

	const globalsScript = $derived(`<script>
	// Host for link reference

	var host = "${host}";
	var webRoot = "${webRoot}";
	var siteVersion = "${siteVersion}";

	// If $_GET request exists, output as JSON into Javascript

	${getScript}
<\/script>`);
</script>

<svelte:head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

{@html metaHtml}

<meta name="apple-mobile-web-app-capable">
<meta name="mobile-web-app-capable">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<link rel="manifest" href="{webRoot}data/manifest.json?v=3">


<link id="favicon" rel="icon" href="{webRoot}img/favicon.png">

<link rel="stylesheet" type="text/css" href="{webRoot}tera/css/tera-style.css?v=7">

<script src="{webRoot}js/libs/jquery-3.3.1.min.js"></script>

<Analytics />

{@html globalsScript}

<AdSlot name="base-code" />
</svelte:head>

<TeraHeader />
	<div class="main-wrap">
		<div id="main">

{@render children()}

		</div><!--end #main-->
	</div><!--end #main-wrap-->

<TeraFooter />
