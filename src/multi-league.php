<?php

$CANONICAL = '/multi-league/';

$META_TITLE = 'Multi-League IV Checker';

$META_DESCRIPTION = 'Check one Pokemon against every league at once. Enter the IVs you caught it with and see its best CP, level, IV rank and meta ranking in Little Cup, Great League, Ultra League and Master League side by side.';

require_once 'header.php';

?>

<h1>Multi-League IV Checker</h1>
<div class="section white">

	<p>You just caught something. Rather than picking a league, finding the Pokemon, reading its stats, and doing it again for the next league, enter it once here and see every league at the same time.</p>

	<div class="multi-league-input flex gap-15" style="flex-wrap: wrap; align-items: flex-end; margin-bottom: 15px;">
		<div style="flex: 1 1 240px;">
			<h3 class="section-title">Pokemon</h3>
			<select class="poke-select">
				<option disabled selected value="">Select a Pokemon</option>
			</select>
		</div>

		<div>
			<h3 class="section-title">Attack</h3>
			<input class="iv" iv="atk" type="number" min="0" max="15" step="1" value="0" style="width: 80px;" />
		</div>

		<div>
			<h3 class="section-title">Defense</h3>
			<input class="iv" iv="def" type="number" min="0" max="15" step="1" value="0" style="width: 80px;" />
		</div>

		<div>
			<h3 class="section-title">HP</h3>
			<input class="iv" iv="hp" type="number" min="0" max="15" step="1" value="0" style="width: 80px;" />
		</div>
	</div>

	<div class="multi-league-results-container table-container hide">
		<table class="stats-table multi-league-results" cellspacing="0">
			<thead>
				<tr>
					<td>League</td>
					<td>Best CP</td>
					<td>Level</td>
					<td>IV Rank</td>
					<td>Meta Rank</td>
					<td>Score</td>
					<td>Recommended Moves</td>
				</tr>
				<!--Row html to clone-->
				<tr class="template hide">
					<td class="league"></td>
					<td class="cp"></td>
					<td class="level"></td>
					<td class="iv-rank-cell"></td>
					<td class="species-rank"></td>
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
		<p><b>Best CP and Level</b> are the highest this Pokemon can reach with those IVs while staying under the league's CP cap. A level above 40 needs XL Candy.</p>
		<p><b>IV Rank</b> is where that IV spread places among all 4096 combinations for that league, by overall stat product &mdash; the same number the IV Rankings window shows in the battle simulator. Lower is better. It only means something where the CP cap is actually squeezing your stats: if this Pokemon tops out below the cap anyway, higher IVs are simply better and there is no trade-off to rank, so the row reads <i>not CP capped</i> instead. That is always true of Master League, and true of Ultra League for something like Azumarill that maxes out near 1800.</p>
		<p><b>Meta Rank and Score</b> come from the overall rankings for each league, and describe the species rather than your individual Pokemon. A great IV rank on a species that is unranked in that league still means it is not worth powering up.</p>
		<p>Together those two answer different halves of the question: IV Rank is "is this a good one of these?", Meta Rank is "is this worth having at all here?"</p>
	</div>
</div>

<?php require_once 'modules/scripts/battle-scripts.php'; ?>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/MultiLeagueInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=3"></script>

<?php require_once 'footer.php'; ?>
