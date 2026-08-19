<script lang="ts">
	/** rankersandbox.php */
	import { page } from '$app/state';
	import Scripts from '$lib/components/layout/Scripts.svelte';
	import BattleScripts from '$lib/components/scripts/BattleScripts.svelte';
	import FormatSelect from '$lib/components/modules/FormatSelect.svelte';

	const { webRoot } = $derived(page.data);
</script>

<h1>Ranker Sandbox</h1>
<div class="section league-select-container">
	<FormatSelect />
	<button class="simulate">Simulate</button>

	<a style="margin-left: 30px;" class="rankings-link" href="{webRoot}rankings/">Rankings &rarr;</a>

	<div class="output"></div>
</div>

<BattleScripts />

<Scripts>

<!--relative, unversioned script paths exactly as in the PHP-->
<script src="js/GameMaster.js?v=50"></script>
<script src="js/pokemon/Pokemon.js"></script>
<script src="js/interface/RankerInterface.js"></script>
<script src="js/battle/rankers/RankerOverall.js"></script>
<script src="js/RankerMain.js"></script>
</Scripts>
