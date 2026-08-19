<script lang="ts">
	/** index.php */
	import { page } from '$app/state';
	import AdSlot from '$lib/components/ads/AdSlot.svelte';
	import { settingIsOne } from '$lib/settings';

	const { webRoot, siteVersion, settings, dev } = $derived(page.data);
	const ads = $derived(settingIsOne(settings.ads));
</script>

<!--<div class="banner-link">Take the <a href="https://forms.gle/jUVrKMjGRkYSzui59" target="_blank">PvPoke.com feedback survey</a> and help improve the website!</div>-->

<div class="section home white">

	<p class="small">Welcome to PvPoke.com, an open-source tool for Pokemon GO PvP and GO Battle League!</p>

	<a href="{webRoot}battle/" class="button">
		<span class="btn-content-wrap">
			<span class="btn-icon btn-icon-battle"></span>
			<span class="btn-label">
				<h2>Battle</h2>
				<p>Simulate battles between two or more Pokemon.</p>
			</span>
		</span>
	</a>

	<a href="{webRoot}rankings/" class="button">
		<span class="btn-content-wrap">
			<span class="btn-icon btn-icon-rankings"></span>
			<span class="btn-label">
				<h2>Rankings</h2>
				<p>Explore the rankings, movesets, and counters for the top Pokemon in each league.</p>
			</span>
		</span>
	</a>

	<a href="{webRoot}team-builder/" class="button">
		<span class="btn-content-wrap">
			<span class="btn-icon btn-icon-team"></span>
			<span class="btn-label">
				<h2>Team Builder</h2>
				<p>Build your own team and see potential threats and suggestions.</p>
			</span>
		</span>
	</a>

	<a href="{webRoot}train/" class="button">
		<span class="btn-content-wrap">
			<span class="btn-icon btn-icon-train"></span>
			<span class="btn-label">
				<h2>Train</h2>
				<p>Play real-time battle simulations against a CPU opponent.</p>
			</span>
		</span>
	</a>


	<a href="{webRoot}contact/" class="button">
		<span class="btn-content-wrap">
			<span class="btn-icon btn-icon-heart"></span>
			<span class="btn-label">
				<h2>Contact</h2>
				<p>Get in touch, report a technical issue, or lend your support through Patreon.</p>
			</span>
		</span>
	</a>

	<h3>Pokemon Scarlet &amp; Violet</h3>

	<a name="news"></a>

	<a href="{webRoot}tera/" class="button tera-button">
		<span class="btn-content-wrap">
			<span class="btn-icon btn-icon-tera"></span>
			<span class="btn-label">
				<h2>Tera Raid Counter Calculator</h2>
				<p>Take on Tera Raid bosses with this tool to look up Pokemon with the best type matchups.</p>
			</span>
		</span>
	</a>

	<AdSlot name="body-728" />

	<!--Update section for updates-->
	<div class="flex new-header">
		<h3>What's New</h3>
		<a href="{webRoot}rss/" target="_blank" class="feed-subscribe">RSS Feed</a>
	</div>

	<div class="feed-container expanded">
		<div class="feed"></div>

		<div class="news-item template hide">
			<h4></h4>
			<div class="news-content"></div>
			<div class="news-info">
				<div class="news-date"></div>
				<a href="#"><div class="link-text">pvpoke.com</div><div>&rarr;</div></a>
			</div>
		</div>

		<button class="feed-expand"></button>
	</div>

	{#if ads}
		<span data-ccpa-link="1"></span>
	{/if}

</div>

{#if dev}

	<script src="{webRoot}js/GameMaster.js?v={siteVersion}"></script>
	<script src="{webRoot}js/pokemon/Pokemon.js?v={siteVersion}"></script>
	<script src="{webRoot}js/interface/HomeInterface.js?v={siteVersion}"></script>
	<script src="{webRoot}js/interface/ModalWindow.js?v={siteVersion}"></script>
	<script src="{webRoot}js/interface/PokeSearch.js?v={siteVersion}"></script>
	<script src="{webRoot}js/battle/timeline/TimelineEvent.js?v={siteVersion}"></script>
	<script src="{webRoot}js/battle/timeline/TimelineAction.js?v={siteVersion}"></script>
	<script src="{webRoot}js/battle/Battle.js?v={siteVersion}"></script>
	<script src="{webRoot}js/battle/rankers/TeamRanker.js?v={siteVersion}"></script>
	<script src="{webRoot}js/Main.js?v={siteVersion}"></script>

{:else}

	<script src="{webRoot}js/GameMaster.js?v={siteVersion}"></script>
	<script src="{webRoot}js/pokemon/Pokemon.js?v={siteVersion}"></script>
	<script src="{webRoot}js/interface/HomeInterface.js?v={siteVersion}"></script>
	<script src="{webRoot}js/Main.js?v={siteVersion}"></script>

{/if}
