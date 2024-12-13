<script lang="ts">
	import {
		WEB_HOST,
		WEB_ROOT
	} from '$lib/config';
	/*import Analytics from '$lib/modules/analytics.svelte';
	import BaseCode from '$lib/modules/ads/base-code.svelte';*/

	let { version, title = '', description = '', ogimage = '', canonical = '' } = $props();

	// Set meta variables
	title =
		title ||
		'PvPoke | Open-Source Battle Simulator, Rankings & Team Building for Pokemon GO PvP';
	if (!title.includes('PvPoke')) {
		title += ' | PvPoke';
	}

	description =
		description ||
		'Looking for an edge in Pokemon GO Trainer Battles? Become a master with our open-source Pokemon battle simulator, explore the top Pokemon rankings, and get your team rated for PvP battles.';
	ogimage = ogimage || 'https://pvpoke.com/img/og.jpg';

	// Mock location/URI if needed for conditions (replace this with an actual route if available)
	let locationPath = ''; // Set this to your current route as needed

	/**
	 * Temporary
	 */
	let menuSlideProtection = true;
	let colorblindMode = '';
	let SETTINGS = '';
</script>

<svelte:head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>{title}</title>
	<meta name="description" content={description} />

	{#if canonical}
		<link rel="canonical" href={canonical} />
	{/if}

	<!--OG tags for social-->
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogimage} />

	<meta name="apple-mobile-web-app-capable" />
	<meta name="mobile-web-app-capable" />
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
	<link rel="manifest" href={WEB_ROOT + 'data/manifest.json?v=3'} />

	<!-- Favicon logic simplified to a single default icon -->
	<link id="favicon" rel="icon" href={WEB_ROOT + 'img/themes/sunflower/favicon.png'} />

	<link rel="stylesheet" type="text/css" href={WEB_ROOT + 'css/style.css?v=196'} />

	{#if title.includes('Train')}
		<link rel="stylesheet" type="text/css" href={WEB_ROOT + 'css/train.css?v=21'} />
	{/if}

	{#if locationPath.includes('articles')}
		<link rel="stylesheet" type="text/css" href={WEB_ROOT + 'css/article-extras.css?v=21'} />
	{/if}

	<!--{#if SETTINGS.theme && SETTINGS.theme !== 'default'}
		<link
			rel="stylesheet"
			type="text/css"
			href={WEB_ROOT + 'css/themes/' + SETTINGS.theme + '.css?v=27'}
		/>
	{/if}-->

	<script src={WEB_ROOT + 'js/libs/jquery-3.3.1.min.js'}></script>
	<script src={WEB_ROOT + 'js/interface/RSSReader.js?v=' + version}></script>

	<!--<Analytics />
	<BaseCode />-->

	<script>
		var host = '{WEB_HOST}';
		var webRoot = '{WEB_ROOT}';
		var siteVersion = '{version}';

		var settings = {
			defaultIVs: SETTINGS.defaultIVs || 'gamemaster',
			animateTimeline: SETTINGS.animateTimeline ? true : false,
			matrixDirection: 'row',
			gamemaster: SETTINGS.gamemaster || 'gamemaster',
			pokeboxId: SETTINGS.pokeboxId || 0,
			pokeboxLastDateTime: SETTINGS.pokeboxLastDateTime || 0,
			xls: SETTINGS.xls ? true : false,
			rankingDetails: SETTINGS.rankingDetails || 'one-page',
			hardMovesetLinks: SETTINGS.hardMovesetLinks || 0,
			colorblindMode: SETTINGS.colorblindMode || 0,
			performanceMode: SETTINGS.performanceMode || 0
		};

		var get = false; // In Svelte, you can handle query params differently if needed
	</script>
</svelte:head>

<svelte:body class:{colorblindMode} />
<!-- The "colorblindMode" class would be set if SETTINGS.colorblindMode == 1 -->
<header>
	<div class="header-wrap">
		{#if SETTINGS.theme === 'night'}
			<a href={WEB_ROOT}
				><img src={WEB_ROOT + 'img/themes/sunflower/header-white.png'} title="PvPoke.com" /></a
			>
		{:else}
			<a href={WEB_ROOT}
				><img src={WEB_ROOT + 'img/themes/sunflower/header.png'} title="PvPoke.com" /></a
			>
		{/if}

		<div class="hamburger mobile" onclick={() => menuSlideProtection = !menuSlideProtection}>
			<div class="meat"></div>
			<div class="meat"></div>
			<div class="meat"></div>
		</div>
		<!--
		$('.hamburger.mobile').click(e => {
			$('header .menu').slideToggle(125);

			menuSlideProtection = true;
			setTimeout(() => {
				menuSlideProtection = false;
			}, 125);
		});
		-->

		<div class="menu">
			<div class="parent-menu">
				<a class="icon-battle" href={WEB_ROOT + 'battle/'}>
					Battle<span></span>
				</a>
				<div class="submenu">
					<div class="submenu-wrap">
						<a class="nav-great" href={WEB_ROOT + 'battle/'}>Single Battle</a>
						<a class="nav-ultra" href={WEB_ROOT + 'battle/multi/'}>Multi Battle</a>
						<a class="nav-master" href={WEB_ROOT + 'battle/matrix/'}>Matrix Battle</a>
					</div>
				</div>
			</div>
			<div class="parent-menu">
				<a class="icon-rankings" href={WEB_ROOT + 'rankings/'}>
					Rankings <span></span>
				</a>
				<div class="submenu">
					<div class="submenu-wrap">
						<a class="nav-great" href={WEB_ROOT + 'rankings/all/1500/overall/'}>Great League</a>
						<a class="nav-ultra" href={WEB_ROOT + 'rankings/all/2500/overall/'}>Ultra League</a>
						<a class="nav-master" href={WEB_ROOT + 'rankings/all/10000/overall/'}>Master League</a>
						<a href={WEB_ROOT + 'custom-rankings/'}>Custom Rankings</a>
					</div>
				</div>
			</div>
			<a class="icon-team" href={WEB_ROOT + 'team-builder/'}>Team Builder</a>
			<div class="parent-menu">
				<a class="icon-train" href={WEB_ROOT + 'train/'}>
					Train <span></span>
				</a>
				<div class="submenu">
					<div class="submenu-wrap">
						<a href={WEB_ROOT + 'train/analysis/'}>Top Performers</a>
					</div>
				</div>
			</div>
			<div class="parent-menu more-parent-menu">
				<a class="more desktop" href="#">
					<div class="hamburger desktop">
						<div class="meat"></div>
						<div class="meat"></div>
						<div class="meat"></div>
					</div>
				</a>
				<div class="submenu">
					<div class="submenu-wrap">
						<a href={WEB_ROOT + 'moves/'}>Moves</a>
						<a href={WEB_ROOT + 'articles/'}>Articles</a>
						<a href={WEB_ROOT + 'settings/'}>Settings</a>
						<a class="icon-heart" href={WEB_ROOT + 'contact/'}>Contact</a>
						<a class="tera" href={WEB_ROOT + 'tera/'}>Tera Raid Counters</a>
						<div class="latest-section mobile">
							<h4>Latest <a href={WEB_ROOT + '#news'}></a></h4>
							<a class="latest-link" href="#"></a>
							<div class="date"></div>
						</div>
					</div>
				</div>
				<div class="safe-mouse-space"></div>
			</div>
		</div>
	</div>
</header>
