<script lang="ts">
	/**
	 * data/overrideEditor.php — lives in the (main) route group so the page can sit at
	 * /data/overrideEditor.php next to the `routes/data/*` +server.ts endpoints.
	 */
	import { page } from '$app/state';
	import Scripts from '$lib/components/layout/Scripts.svelte';
	import BattleScripts from '$lib/components/scripts/BattleScripts.svelte';
	import FormatSelect from '$lib/components/modules/FormatSelect.svelte';
	import SearchStringHelp from '$lib/components/modules/SearchStringHelp.svelte';
	import SearchTraits from '$lib/components/modules/SearchTraits.svelte';
	import PokeSelect from '$lib/components/modules/PokeSelect.svelte';
	import RankingDetails from '$lib/components/modules/RankingDetails.svelte';

	const { webRoot, siteVersion } = $derived(page.data);
</script>

<h1>Override Editor</h1>
<div class="section league-select-container white">
	<FormatSelect />

	<a class="ranker-link" style="margin-left: 20px;" href="{webRoot}ranker.php">Ranker &rarr;</a>

	<p style="margin-top: 10px;">Select a format to edit the moveset and weighting overrides.</p>

	<div class="override-controls flex" style="margin-bottom: 20px;">
		<button class="new-pokemon">+ New Pokemon</button>
		<button class="import-movesets" style="margin-left: 15px;">Import League Movesets</button>
		<button class="clear-weights" style="margin-left: 15px;">Clear Weights</button>
		<button class="clear-editor-scores" style="margin-left: 15px;">Clear Editor Scores</button>
	</div>
	<!--`<hr></hr>` is invalid (hr is a void element) but present in the PHP, so it is emitted raw-->
	{@html '<hr></hr>'}
	<br>
	<div class="poke-search-container">
		<input class="poke-search" context="ranking-search" type="text" placeholder="Search Pokemon" />
		<a href="#" class="search-info" title="Search Help">?</a>
		<a href="#" class="search-traits" title="Search Traits">+</a>

		<div  style="margin-left: 100px;" class="flex align-items-center">
			<label>Sort:</label>
			<select style="margin-left: 5px; width:100px;" class="sort-select">
				<option value="id">ID</option>
				<option value="weight">Weight</option>
				<option value="editorscore">Editor Score</option>
			</select>
		</div>

	</div>


	<div class="ranking-header">Pokemon</div>
	<div class="ranking-header right">Weight</div>

	<h2 class="loading">Loading data...</h2>
	<div class="rankings-container clear"></div>
</div>

<textarea class="import" style="width:100%; height: 150px; padding: 10px;"></textarea>
<div class="button copy export-json">Copy</div>

<SearchStringHelp />

<SearchTraits />

<div class="hide">
	<PokeSelect />
</div>


<RankingDetails />

<BattleScripts />

<Scripts>

<script src="{webRoot}js/GameMaster.js?v={siteVersion}"></script>
<script src="{webRoot}js/pokemon/Pokemon.js?v={siteVersion}"></script>
<script src="{webRoot}js/devtools/OverrideInterface.js?v={siteVersion}"></script>
<script src="{webRoot}js/interface/ModalWindow.js?v={siteVersion}"></script>
<script src="{webRoot}js/interface/PokeSelect.js?v={siteVersion}"></script>
<script src="{webRoot}js/interface/PokeMultiSelect.js?={siteVersion}"></script>
<script src="{webRoot}js/interface/Pokebox.js?={siteVersion}"></script>
<script src="{webRoot}js/interface/PokeSearch.js?v={siteVersion}"></script>

<!--CONVENTIONS §0.2: the PHP's js/battle/TeamRanker.js is a 404; fixed to js/battle/rankers/TeamRanker.js-->
<script src="{webRoot}js/battle/rankers/TeamRanker.js?v={siteVersion}"></script>
<script src="{webRoot}js/RankingMain.js?v={siteVersion}"></script>
<script src="{webRoot}js/libs/hexagon-chart.js?v={siteVersion}"></script>
</Scripts>
