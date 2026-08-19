<script lang="ts">
	/** train/analytics.php */
	import { page } from '$app/state';
	import Scripts from '$lib/components/layout/Scripts.svelte';
	import PokeSelect from '$lib/components/modules/PokeSelect.svelte';
	import PokeMultiSelect from '$lib/components/modules/PokeMultiSelect.svelte';

	const { webRoot, siteVersion } = $derived(page.data);
</script>

<h1>Training Battle Analytics</h1>
<div class="section home white">
	<p>Gather pick rate data from AI selected teams.</p>
</div>

<div class="hide">
	<PokeSelect />
</div>

<div class="section poke-select-container train">
	<div class="poke">
		<h3>Your Team</h3>
		<PokeMultiSelect />
		<a class="random" href="#">Random</a>
	</div>

	<div class="poke ai-options">
		<h3>Settings</h3>
		<div class="poke-stats">
			<h3 class="section-title">League &amp; Cup</h3>
			<select class="league-cup-select">
				<option value="1500 gobattleleague">GO Battle League</option>
				<option value="2500 gobattleleague">GO Battle League (Ultra)</option>
				<option value="1500 all">Great League</option>
				<option value="2500 all">Ultra League</option>
				<option value="10000 all">Master League</option>
				<option value="1500 voyager">Voyager Cup</option>
			</select>
		</div>
	</div>
	<div class="clear"></div>
</div>

<div class="section">
	<button class="battle-btn button">Simulate</button>
</div>

<Scripts>
<script src="{webRoot}js/GameMaster.js?v={siteVersion}"></script>
<script src="{webRoot}js/pokemon/Pokemon.js?v={siteVersion}"></script>
<script src="{webRoot}js/pokemon/Player.js?v={siteVersion}"></script>
<script src="{webRoot}js/training/TrainingAnalytics.js?v={siteVersion}"></script>
<script src="{webRoot}js/training/BattleInterface.js?v={siteVersion}"></script>
<script src="{webRoot}js/training/DecisionOption.js?v={siteVersion}"></script>
<script src="{webRoot}js/training/TrainingAI.js?v={siteVersion}"></script>
<script src="{webRoot}js/interface/PokeSearch.js?v={siteVersion}"></script>
<script src="{webRoot}js/interface/PokeSelect.js?v={siteVersion}"></script>
<script src="{webRoot}js/interface/PokeMultiSelect.js?={siteVersion}"></script>
<script src="{webRoot}js/interface/ModalWindow.js?v={siteVersion}"></script>
<script src="{webRoot}js/battle/timeline/TimelineEvent.js?v={siteVersion}"></script>
<script src="{webRoot}js/battle/timeline/TimelineAction.js?v={siteVersion}"></script>
<script src="{webRoot}js/battle/Battle.js?v={siteVersion}"></script>
<script src="{webRoot}js/battle/rankers/TeamRanker.js?v={siteVersion}"></script>
<script src="{webRoot}js/training/MatchHandler.js?v={siteVersion}"></script>
</Scripts>
