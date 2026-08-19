<script lang="ts">
	/**
	 * The <header> part of header.php (site header + nav). The `.main-wrap > #main` wrapper
	 * and the custom-gm banner that follow it in header.php live in routes/(main)/+layout.svelte,
	 * because Svelte components must close every tag they open. Markup is kept identical to the PHP.
	 *
	 * Nav `selected` classes: PHP used `if(strpos($_SERVER['REQUEST_URI'], '/battle/'))`,
	 * which is only truthy when the match is NOT at position 0 — i.e. it depended on a
	 * non-root $WEB_ROOT. Here the URI always starts at the root, so `includes()` is used;
	 * this matches the reference dev site (webRoot /pvpoke-ref/src/) the harness diffs against.
	 */
	import { page } from '$app/state';

	const { webRoot, settings, requestUri } = $derived(page.data);
	const sel = (needle: string) => (requestUri.includes(needle) ? 'selected' : '');
</script>

	<header>
		<div class="header-wrap">
			{#if settings.theme == 'night'}
				<a href="{webRoot}"><img src="{webRoot}img/themes/sunflower/header-white.png" title="PvPoke.com" /></a>
			{:else}
				<a href="{webRoot}"><img src="{webRoot}img/themes/sunflower/header.png" title="PvPoke.com" /></a>
			{/if}

			<div class="hamburger mobile">
				<!--Because I'm too lazy to make a graphic-->
				<div class="meat"></div>
				<div class="meat"></div>
				<div class="meat"></div>
			</div>
			<div class="menu">
				<div class="menu-content">
					<div class="parent-menu">
						<a class="icon-battle {sel('/battle/')}" href="{webRoot}battle/">
							Battle<span></span>
						</a>
						<div class="submenu">
							<div class="submenu-wrap">
								<a class="nav-great" href="{webRoot}battle/">Single Battle</a>
								<a class="nav-ultra" href="{webRoot}battle/multi/">Multi Battle</a>
								<a class="nav-master" href="{webRoot}battle/matrix/">Matrix Battle</a>
							</div>
						</div>
					</div>
					<div class="parent-menu">
						<a class="icon-rankings {sel('/rankings/')}" href="{webRoot}rankings/">
							Rankings <span></span>
						</a>
						<div class="submenu">
							<div class="submenu-wrap">
								<a class="nav-great" href="{webRoot}rankings/all/1500/overall/">Great League</a>
								<a class="nav-ultra" href="{webRoot}rankings/all/2500/overall/">Ultra League</a>
								<a class="nav-master" href="{webRoot}rankings/all/10000/overall/">Master League</a>
								<a href="{webRoot}custom-rankings/">Custom Rankings</a>
							</div>
						</div>
					</div>
					<a class="icon-team {sel('/team-builder/')}" href="{webRoot}team-builder/">Team Builder</a>
					<div class="parent-menu">
						<a class="icon-train {sel('/train/')}" href="{webRoot}train/">
							Train <span></span>
						</a>
						<div class="submenu">
							<div class="submenu-wrap">
								<a href="{webRoot}train/analysis/">Top Performers</a>
							</div>
						</div>
					</div>
					<div class="parent-menu more-parent-menu">
						<a class="more desktop" href="#">
							<div class="hamburger desktop">
								<!--Because I'm too lazy to make a graphic-->
								<div class="meat"></div>
								<div class="meat"></div>
								<div class="meat"></div>
							</div>
						</a>
						<div class="submenu">
							<div class="submenu-wrap">
								<a href="{webRoot}attack-cmp-chart/">CMP Chart</a>
								<a href="{webRoot}moves/">Moves</a>
								<a href="{webRoot}articles/">Articles</a>
								<a href="{webRoot}settings/">Settings</a>
								<a class="icon-heart" href="{webRoot}contact/">Contact</a>
								<a class="tera" href="{webRoot}tera/">Tera Raid Counters</a>
								<div class="latest-section mobile">
									<h4>Latest <a href="{webRoot}#news"></a></h4>
									<a class="latest-link" href="#"></a>
									<div class="date"></div>
								</div>
							</div>
						</div>
						<div class="safe-mouse-space"></div>
					</div>
				</div>
			</div>
		</div>
	</header>
