<script lang="ts">
	/**
	 * pokedex.php — shared by the `/pokedex.php` route (the only URL the PHP had) and by
	 * `/pokedex/`, which is what the page's own canonical points at.
	 */
	import { page } from '$app/state';
	import Scripts from '$lib/components/layout/Scripts.svelte';
	import LeagueSelect from '$lib/components/modules/LeagueSelect.svelte';

	const { webRoot, siteVersion } = $derived(page.data);
</script>


<h1>Pokedex</h1>
<div class="section moves white">
	<LeagueSelect />

	<p>Sort or filter the moves below, or experiment with a custom moveset.</p>

	<h2 class="loading">Loading data...</h2>
	<div class="poke-table-container">
		<input class="poke-search" context="poke-search" type="text" placeholder="Search Move or Type" />
		<table class="sortable-table stats-table pokemon" cellpadding="0" cellspacing="0"></table>
	</div>
</div>


<!--test 2-->
<Scripts>

<script src="{webRoot}js/GameMaster.js?v={siteVersion}"></script>
<script src="{webRoot}js/pokemon/Pokemon.js?v={siteVersion}"></script>
<script src="{webRoot}js/interface/SortableTable.js?v={siteVersion}"></script>
<script src="{webRoot}js/interface/PokedexInterface.js?v={siteVersion}"></script>
<script src="{webRoot}js/battle/timeline/TimelineEvent.js?v={siteVersion}"></script>
<script src="{webRoot}js/battle/Battle.js?v={siteVersion}"></script>
<script src="{webRoot}js/RankingMain.js?v={siteVersion}"></script>
</Scripts>
