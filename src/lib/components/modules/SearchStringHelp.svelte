<script lang="ts">
	/**
	 * modules/search-string-help.php — hidden help table for the Pokemon search syntax. No PHP.
	 *
	 * The nickname cell is emitted with {@html} to keep the original (malformed) markup
	 * byte-identical: it opens a second `<a>` where it meant to close the first one.
	 */
</script>

<div class="sandbox-search-strings article hide">
	<p>You can use the following search formats to filter Pokemon:</p>
	<table cellspacing="0">
		<tbody>
			<tr>
				<td><strong>Pokemon Name</strong></td>
				<td>azumarill</td>
			</tr>
			<tr>
				<td><strong>Pokemon Nickname</strong></td>
				<td>{@html 'gfisk (<a class="nickname-list" href="#">List of nicknames<a>)'}</td>
			</tr>
			<tr>
				<td><strong>Pokemon Type</strong></td>
				<td>water</td>
			</tr>
			<tr>
				<td><strong>Pokemon Tag</strong></td>
				<td>legendary, mythical, ultrabeast, regional, alolan, galarian, starter, shadow, shadoweligible, xl</td>
			</tr>
			<tr>
				<td><strong>Generation/Region</strong></td>
				<td>gen1, gen2, gen3, etc. <br>kanto, johto, hoenn, etc.</td>
			</tr>
			<tr>
				<td><strong>Pokedex Number</strong></td>
				<td>184</td>
			</tr>
			<tr>
				<td><strong>Evolution Family</strong></td>
				<td>+politoed</td>
			</tr>
			<tr>
				<td><strong>Move Name</strong></td>
				<td>@counter</td>
			</tr>
			<tr>
				<td><strong>Move Type</strong></td>
				<td>@fighting</td>
			</tr>
			<tr>
				<td><strong>Fast Move only</strong></td>
				<td>@1fighting</td>
			</tr>
			<tr>
				<td><strong>Charged Move only</strong></td>
				<td>@2mud</td>
			</tr>
			<tr>
				<td><strong>Legacy Moves (excl. Return)</strong></td>
				<td>@legacy</td>
			</tr>
			<tr>
				<td><strong>Special Moves (incl. Return)</strong></td>
				<td>@special</td>
			</tr>
			<tr>
				<td><strong>Traits</strong></td>
				<td>Bulky, Spammy, Risky, etc. See adjacent trait guide.</td>
			</tr>
			<tr>
				<td><strong>Charged Move Cost</strong></td>
				<td>10k, 50k, 75k, 100k</td>
			</tr>
			<tr>
				<td><strong>Buddy Walk Distance</strong></td>
				<td>1km, 3km, 5km, 20km</td>
			</tr>
			<tr>
				<td><strong>Meta Pokemon</strong></td>
				<td>meta</td>
			</tr>
			<tr>
				<td><strong>Editor Notes</strong></td>
				<td>notes</td>
			</tr>
			<tr>
				<td><strong>4* Pokemon</strong></td>
				<td>4*, Hundo</td>
			</tr>
			<tr>
				<td><strong>And</strong></td>
				<td>water&amp;@fighting</td>
			</tr>
			<tr>
				<td><strong>Or</strong></td>
				<td>water,fighting</td>
			</tr>
			<tr>
				<td><strong>Not</strong></td>
				<td>!water</td>
			</tr>
		</tbody>
	</table>
</div>

<div class="search-nicknames article hide">
	<p>You can select or search for Pokemon using the common nicknames below:</p>
	<table cellspacing="0">
		<thead>
			<tr>
				<th>Pokemon</th>
				<th>Nicknames</th>
	
			</tr>
		</thead>

		<tbody>
		</tbody>
	</table>
</div>
