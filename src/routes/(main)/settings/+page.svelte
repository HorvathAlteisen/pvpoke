<script lang="ts">
	/** settings.php — form pre-filled from $_SETTINGS; saved by js/interface/Settings.js */
	import { page } from '$app/state';
	import { phpIntval } from '$lib/php';
	import { settingIsOne } from '$lib/settings';
	import Scripts from '$lib/components/layout/Scripts.svelte';

	const { webRoot, siteVersion, settings } = $derived(page.data);

	// PHP: $theme = "default"; if(isset($_SETTINGS->theme)) $theme = $_SETTINGS->theme;
	const theme = $derived(settings.theme !== undefined && settings.theme !== null ? settings.theme : 'default');
	const gamemaster = $derived(
		settings.gamemaster !== undefined && settings.gamemaster !== null ? settings.gamemaster : 'gamemaster'
	);
	const pokeboxIdSet = $derived(settings.pokeboxId !== undefined && settings.pokeboxId !== null);
	const on = (v: typeof settings.ads) => (settingIsOne(v) ? 'on' : '');
	const rankingDetails = $derived(settings.rankingDetails);
</script>

<h1>Settings</h1>
<div class="section moves white">
	<p>Adjust your site preferences below. These will be saved in a cookie to your device.</p>

	<div class="settings">

		<h3>Site Theme</h3>
		<div>
			<select class="input" id="theme-select">
				<option value="default" selected={theme == 'default'}>Default</option>
				<option value="night" selected={theme == 'night'}>Night</option>
			</select>
		</div>

		<h3>Gamemaster Version</h3>
		<p>Select the current Pokemon and move values to use in simulations. You can create new gamemaster versions using the <a href="{webRoot}gm-editor/"><b>Gamemaster Editor</b>.</a></p>
		<div>
			<select class="input" id="gm-select">
				<option value="gamemaster" selected={gamemaster == 'gamemaster'}>Default</option>
			</select>
		</div>

		<h3>Pokebox</h3>
		<p>PvPoke integrates with <a target="_blank" href="https://www.pokebattler.com/" class="pokebattler">Pokebattler</a> so you can permanently store your Pokemon and import them anywhere on the site. Enter your Pokebattler account ID below to link your Pokebox:</p>
		{#if pokeboxIdSet}
			<input type="text" class="input" id="pokebox-id" value="{phpIntval(settings.pokeboxId)}" />
		{:else}
			<input type="text" class="input" id="pokebox-id" />
		{/if}

		<h3>Performance Mode</h3>
		<div class="check performanceMode {on(settings.performanceMode)}"><span></span> Performance mode</div>
		<p>Improve CPU performance on the Rankings and Battle pages. Enable this if you experience lag or freezes on your browser. This feature disables the Suggested Teammates and Similar Pokemon lists in the ranking details, and timeline animations on the Battle page.</p>


		<h3>Colorblind Mode</h3>
		<div class="check colorblindMode {on(settings.colorblindMode)}"><span></span> Colorblind mode</div>
		<p>Increase contrast for battle rating colors, symbols, and tables.</p>

		<table class="rating-table" cellspacing="0">
			<tbody><tr>
				<td><a href="javascript:void(0)" class="rating margin-6 loss"><span></span>200</a></td>
				<td><a href="javascript:void(0)" class="rating margin-6 close-loss"><span></span>400</a></td>
				<td><a href="javascript:void(0)" class="rating margin-6 tie"><span></span>500</a></td>
				<td><a href="javascript:void(0)" class="rating margin-6 close-win"><span></span>600</a></td>
				<td><a href="javascript:void(0)" class="rating margin-6 win"><span></span>800</a></td>
			</tr>
		</tbody></table>

		<h3>Advertisements</h3>
		<div class="check ads {on(settings.ads)}"><span></span> Show ads</div>
		<p>Ads help support the site and the Pokemon GO community!</p>

		<h3>XL Pokemon</h3>
		<div class="check xls {on(settings.xls)}"><span></span> Show XL Pokemon</div>
		<p>Choose whether to show Pokemon over Level 40 in the primary rankings or Team Builder results. You can temporarily toggle them on the respective pages.</p>

		<h3>Default Pokemon Preferences</h3>
		<select class="input" id="default-ivs">
			<option value="gamemaster" selected={settings.defaultIVs == 'gamemaster'}>Typical IV's (~Rank 500)</option>
			<option value="maximize" selected={settings.defaultIVs == 'maximize'}>Maximum stat product (Rank 1)</option>
		</select>
		<p>Currently, this will choose which IV's to set for Pokemon you select in Single Battle, Multi-Battle, and the Team Builder. Opponents in Multi-Battle and the Team Builder will still use the "typical" IV's.</p>

		<h3>Ranking Details Display</h3>
		<p>Select how to display a Pokemon's stats, moves, matchups, and other details on the rankings pages.</p>
		<select class="input" id="ranking-details">
			<option value="one-page" selected={rankingDetails !== undefined && rankingDetails !== null && rankingDetails == 'one-page'}>One Page</option>
			<option value="tabs" selected={rankingDetails !== undefined && rankingDetails !== null && rankingDetails == 'tabs'}>Tabs</option>
		</select>

		<h3>Hard Moveset Links</h3>
		<div class="check hard-moveset-links {on(settings.hardMovesetLinks)}"><span></span> Bake move ID's into battle links</div>
		<p>This setting is for article writing purposes. When active, movesets are hard coded into the URL so battle links are preserved during future moveset updates.</p>

		<div class="save button">Save Settings</div>
	</div>
</div>

<Scripts>
<script src="{webRoot}js/GameMaster.js?v={siteVersion}"></script>
<script src="{webRoot}js/interface/Settings.js?v={siteVersion}"></script>
<script src="{webRoot}js/interface/ModalWindow.js?v={siteVersion}"></script>
<script src="{webRoot}js/RankingMain.js?v={siteVersion}"></script>
</Scripts>
