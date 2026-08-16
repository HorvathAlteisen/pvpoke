<?php

$CANONICAL = '/multi-league/';

$META_TITLE = 'Multi-League IV Checker';

$META_DESCRIPTION = 'Pick a Pokemon and see the best IV spread, level, CP and meta ranking for it and its whole evolution family in Little Cup, Great League, Ultra League and Master League, all on one page.';

require_once 'header.php';

?>

<h1>Multi-League IV Checker</h1>
<div class="section white">

	<p>Pick a Pokemon once and see what it needs to be in every league &mdash; the best IV spread, the level to power it to, and how the species actually rates there. Its whole evolution family is included, because the answer to "which league is this for?" is often "a different stage of it".</p>

	<div class="multi-league-input" style="margin-bottom: 15px;">
		<h3 class="section-title">Pokemon</h3>
		<select class="poke-select">
			<option disabled selected value="">Select a Pokemon</option>
		</select>
	</div>

	<div class="multi-league-results-container table-container hide">
		<table class="stats-table multi-league-results" cellspacing="0">
			<thead>
				<tr>
					<td>Pokemon</td>
					<td>Best IVs</td>
					<td>Level</td>
					<td>CP</td>
					<td>Meta Rank</td>
					<td>Score</td>
					<td>Recommended Moves</td>
				</tr>
				<!--Row html to clone-->
				<tr class="league-template hide">
					<td class="league" colspan="7"><b></b></td>
				</tr>
				<tr class="result-template hide">
					<td class="name"></td>
					<td class="ivs"></td>
					<td class="level"></td>
					<td class="cp"></td>
					<td class="rank"></td>
					<td class="score"></td>
					<td class="moveset"></td>
				</tr>
			</thead>
			<tbody>
			</tbody>
		</table>
	</div>

</div>

<div class="section about white">
	<a class="toggle" href="#">How to read this <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content">
		<p><b>Best IVs</b> is the IV spread with the highest overall stat product that still fits under that league's CP cap &mdash; the same result as the Maximize button in the battle simulator. In a capped league that usually means low Attack, because trading Attack for Defense and HP buys you more of both under the same CP.</p>
		<p>Where a Pokemon tops out below the cap anyway, there is no trade-off to make and the answer is simply 15/15/15. Those rows are marked <i>under the cap</i>. That is always true in Master League, and true in Ultra League for something like Azumarill that maxes out near 1800.</p>
		<p><b>Level</b> is what you would need to power it to. Anything above 40 needs XL Candy.</p>
		<p><b>Meta Rank and Score</b> come from the overall rankings for each league and describe the species, not your individual Pokemon. A perfect IV spread on a species that is unranked in that league still means it is not worth the candy.</p>
		<p>The <b>&#9733;</b> marks the family member ranked highest in that league &mdash; the stage worth building there.</p>
	</div>
</div>

<?php require_once 'modules/scripts/battle-scripts.php'; ?>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/MultiLeagueInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=3"></script>

<?php require_once 'footer.php'; ?>
