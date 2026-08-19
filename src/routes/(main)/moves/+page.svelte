<script lang="ts">
	/** moves.php */
	import { page } from '$app/state';
	import Scripts from '$lib/components/layout/Scripts.svelte';
	import BattleScripts from '$lib/components/scripts/BattleScripts.svelte';

	const { webRoot, siteVersion } = $derived(page.data);
</script>


<h1>Moves</h1>
<div class="section moves white">
	<select class="mode-select">
		<option value="fast">Fast Moves</option>
		<option value="charged">Charged Moves</option>
		<option value="explore">Moveset Explorer</option>
	</select>
	<p>Sort or filter the moves below, or experiment with a custom moveset.</p>

	<h2 class="loading">Loading data...</h2>
	<div class="move-table-container fast charged">
		<table class="stats-table" cellpadding="0" cellspacing="0">
			<tbody>
			<tr>
				<td class="label">D</td>
				<td>Damage</td>
			</tr>
			<tr>
				<td class="label">E</td>
				<td>Energy</td>
			</tr>
			<tr class="fast">
				<td class="label">T</td>
				<td>Turns</td>
			</tr>
			<tr class="fast">
				<td class="label">DPT</td>
				<td>Damage Per Turn</td>
			</tr>
			<tr class="fast">
				<td class="label">EPT</td>
				<td>Energy Per Turn</td>
			</tr>
			<tr class="hide"></tr>
			<tr class="charged hide">
				<td class="label">DPE</td>
				<td>Damage Per Energy</td>
			</tr>
			</tbody>
		</table>
		<div class="check mega-move-toggle hide"><span></span>Show Mega Moves (+)</div>
		<input class="poke-search" context="move-search" type="text" placeholder="Search Move or Type" />
		<div class="table-container">
			<table class="sortable-table stats-table moves" cellpadding="0" cellspacing="0"></table>
		</div>

		<a href="#" class="button download-csv">Export to CSV</a>
	</div>

	<div class="move-explore-container explore hide">
		<div class="move-select-container flex">
			<div class="move-select-item" >
				<input class="poke-search" context="move-search" type="text" placeholder="Search move"/>
				<select class="move-select fast">
					<option selected disabled value="">Select a Fast Move</option>
				</select>
				<h3>Options</h3>
				<select class="effectiveness-select fast">
					<option selected value=".244140625">Triple resisted (x0.24)</option>
					<option selected value=".390625">Double resisted (x0.39)</option>
					<option selected value=".625">Resisted (x0.625)</option>
					<option selected value="1">Neutral (x1)</option>
					<option value="1.6">Super effective (x1.6)</option>
					<option value="2.56">Double super effective (x2.56)</option>
				</select>
				<div class="stab fast check on"><span></span>Same type attack bonus</div>
			</div>
			<div class="move-select-item">
				<input class="poke-search" context="move-search" type="text" placeholder="Search move" />
				<select class="move-select charged">
					<option selected disabled value="">Select a Charged Move</option>
				</select>
				<h3>Options</h3>
				<select class="effectiveness-select charged">
					<option selected value=".244140625">Triple resisted (x0.24)</option>
					<option selected value=".390625">Double resisted (x0.39)</option>
					<option selected value=".625">Resisted (x0.625)</option>
					<option selected value="1">Neutral (x1)</option>
					<option value="1.6">Super effective (x1.6)</option>
					<option value="2.56">Double super effective (x2.56)</option>
				</select>
				<div class="stab charged check on"><span></span>Same type attack bonus</div>
			</div>
		</div>

		<div class="explore-results hide">
			<div class="moveset-stats flex"></div>
			<h2>Pokemon with this moveset:</h2>
			<div>* Legacy moveset</div>
			<div class="rankings-container clear"></div>
		</div>

	</div>
</div>

<BattleScripts />

<Scripts>

<script src="{webRoot}js/GameMaster.js?v={siteVersion}"></script>
<script src="{webRoot}js/pokemon/Pokemon.js?v={siteVersion}"></script>
<script src="{webRoot}js/interface/SortableTable.js?v={siteVersion}"></script>
<script src="{webRoot}js/interface/MovesInterface.js?v={siteVersion}"></script>
<script src="{webRoot}js/battle/timeline/TimelineEvent.js?v={siteVersion}"></script>
<script src="{webRoot}js/RankingMain.js?v={siteVersion}"></script>
</Scripts>
