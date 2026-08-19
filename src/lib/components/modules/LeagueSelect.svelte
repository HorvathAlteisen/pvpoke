<script lang="ts">
	/**
	 * modules/leagueselect.php — the option list differs when the request URI contains
	 * `custom-rankings` (level 40/50 variants for Ultra and Master).
	 */
	import { page } from '$app/state';

	const customRankings = $derived(page.data.requestUri.includes('custom-rankings'));
</script>

{#if customRankings}
	<select class="league-select">
		<option value="500" level-cap="50">Little League</option>
		<option value="1500" level-cap="50" selected>Great League</option>
		<option value="2500" level-cap="40">Ultra League (Level 40)</option>
		<option value="2500" level-cap="50">Ultra League (Level 50)</option>
		<option value="10000" level-cap="40">Master League (Level 40)</option>
		<option value="10000" level-cap="50">Master League (Level 50)</option>
	</select>
{:else}
	<select class="league-select">
		<option value="500" level-cap="50">Little League</option>
		<option value="1500" level-cap="50" selected>Great League</option>
		<option value="2500" level-cap="50">Ultra League</option>
		<option value="10000" level-cap="50">Master League</option>
	</select>
{/if}
