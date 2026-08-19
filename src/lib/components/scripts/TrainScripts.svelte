<script lang="ts">
	/** modules/scripts/train-scripts.php — loaded by train/index.php after battle-scripts. */
	import { page } from '$app/state';
	import Scripts from '$lib/components/layout/Scripts.svelte';

	const { webRoot, siteVersion } = $derived(page.data);
</script>

<Scripts>
<script src="{webRoot}js/training/TrainingSetupInterface.js?v={siteVersion}"></script>
<script src="{webRoot}js/training/BattleInterface.js?v={siteVersion}"></script>
<script src="{webRoot}js/training/DecisionOption.js?v={siteVersion}"></script>
<script src="{webRoot}js/training/TrainingAI.js?v={siteVersion}"></script>
</Scripts>
