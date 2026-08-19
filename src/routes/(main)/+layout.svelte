<script lang="ts">
	/**
	 * header.php + footer.php for the main site. Pages never write <svelte:head>; they
	 * return `meta` from their `+page.server.ts` load and this layout renders the head in
	 * the exact order header.php did.
	 */
	import { page } from '$app/state';
	import { DEFAULT_META_DESCRIPTION, DEFAULT_META_TITLE, DEFAULT_OG_IMAGE } from '$lib/site';
	import Analytics from '$lib/components/layout/Analytics.svelte';
	import Globals from '$lib/components/layout/Globals.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import AdSlot from '$lib/components/ads/AdSlot.svelte';

	let { children } = $props();

	const { webRoot, siteVersion, settings, requestUri } = $derived(page.data);
	const meta = $derived(page.data.meta ?? {});

	// header.php: $META_TITLE default or "<title> | PvPoke"
	const title = $derived(meta.title === undefined ? DEFAULT_META_TITLE : meta.title + ' | PvPoke');
	const description = $derived(meta.description ?? DEFAULT_META_DESCRIPTION);
	const ogImage = $derived(meta.ogImage ?? DEFAULT_OG_IMAGE);
	const canonical = $derived(meta.canonical);

	// header.php echoes these raw (no escaping), and Svelte would move a <title> written in
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

	const trainCss = $derived(title.includes('Train') || title.includes('Performers'));
	const articleCss = $derived(requestUri.includes('articles'));
	const theme = $derived(settings.theme);
	const customGm = $derived(settings.gamemaster != 'gamemaster');
</script>

<svelte:head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

{@html metaHtml}

<meta name="apple-mobile-web-app-capable">
<meta name="mobile-web-app-capable">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<link rel="manifest" href="{webRoot}data/manifest.json?v=3">

<link id="favicon" rel="icon" href="{webRoot}img/themes/sunflower/favicon.png">

<link rel="stylesheet" type="text/css" href="{webRoot}css/style.css?v=228">

{#if trainCss}
	<link rel="stylesheet" type="text/css" href="{webRoot}css/train.css?v=21">
{/if}

{#if articleCss}
	<link rel="stylesheet" type="text/css" href="{webRoot}css/article-extras.css?v=23">
{/if}

{#if theme !== undefined && theme !== null && theme != 'default'}
	<link rel="stylesheet" type="text/css" href="{webRoot}css/themes/{theme}.css?v=30">
{/if}

<script src="{webRoot}js/libs/jquery-3.3.1.min.js"></script>
<script src="{webRoot}js/interface/RSSReader.js?v={siteVersion}"></script>

<Analytics />

<Globals />

<AdSlot name="base-code" />
</svelte:head>

<Header />
	<div class="main-wrap">
		<div id="main">
			{#if customGm}
				<div class="custom-gm-banner">
					A <a href="{webRoot}gm-editor/">custom gamemaster</a> is active. Simulations and content may change.
				</div>
			{/if}

{@render children()}

		</div><!--end #main-->
	</div><!--end #main-wrap-->

<Footer />
