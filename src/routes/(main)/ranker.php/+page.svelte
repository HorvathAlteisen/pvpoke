<script lang="ts">
	/** ranker.php */
	import { page } from '$app/state';
	import Scripts from '$lib/components/layout/Scripts.svelte';
	import BattleScripts from '$lib/components/scripts/BattleScripts.svelte';
	import FormatSelect from '$lib/components/modules/FormatSelect.svelte';

	const { webRoot } = $derived(page.data);
</script>

<h1>Ranker</h1>
<div class="section white">
	<FormatSelect />
	<a style="margin-left: 30px;" class="rankersandbox-link" href="{webRoot}rankersandbox.php">Rankersandbox &rarr;</a>
	<p></p>
	<p>Select your format above and generate rankings. These will be saved as JSON to the '/data/rankings/' directory. This process may take a few minutes. Follow the instructions below to set up rankings for a new cup, or open the developer console for more info.</p>

	<button class="button simulate">Simulate</button>

	<div class="output"></div>
</div>

<BattleScripts />

<Scripts>

<!--relative, unversioned script paths exactly as in the PHP: they resolve against /ranker.php → /js/…-->
<script src="js/GameMaster.js?v=2"></script>
<script src="js/pokemon/Pokemon.js?v=2"></script>
<script src="js/interface/RankerInterface.js?v=2"></script>
<script src="js/battle/rankers/Ranker.js"></script>
<script src="js/RankerMain.js"></script>
</Scripts>
