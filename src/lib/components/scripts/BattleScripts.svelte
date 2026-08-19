<script lang="ts">
	/** modules/scripts/battle-scripts.php — always loaded before GameMaster.js. */
	import { page } from '$app/state';
	import Scripts from '$lib/components/layout/Scripts.svelte';

	const { webRoot, siteVersion } = $derived(page.data);
</script>

<Scripts>
<script src="{webRoot}js/battle/DamageCalculator.js?v={siteVersion}"></script>
<script src="{webRoot}js/battle/actions/ActionLogic.js?v={siteVersion}"></script>
<script src="{webRoot}js/battle/timeline/TimelineEvent.js?v={siteVersion}"></script>
<script src="{webRoot}js/battle/timeline/TimelineAction.js?v={siteVersion}"></script>
<script src="{webRoot}js/training/DecisionOption.js?v={siteVersion}"></script>
<script src="{webRoot}js/battle/Battle.js?v={siteVersion}"></script>
</Scripts>
