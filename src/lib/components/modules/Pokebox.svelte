<script lang="ts">
	/**
	 * modules/pokebox.php — Pokebattler import UI, nested inside PokeSelect and
	 * PokeMultiSelect (PHP `include`, so it repeats for every selector on the page).
	 *
	 * Two fragments are emitted with {@html} because the original markup is intentionally
	 * kept byte-identical although it is malformed (an unclosed `<span>` in the button and a
	 * stray `</a>` in the error message); Svelte would balance the tags and change the output.
	 */
	import { page } from '$app/state';

	const { webRoot } = $derived(page.data);

	const openButton =
		'<a href="#" class="open-pokebox button-highlight"><span>Import from</span><span>Pokebox<span></a>';
	const errorText = $derived(
		`There was an error loading your Pokebox. Check your <a href="${webRoot}settings/" target="_blank">settings</a> to ensure they're correct and refresh this page.</a>`
	);
</script>

<div class="pokebox">
	{@html openButton}

	<div class="pokebox-import hide">
		<div class="pokebox-on hide">
			<p>Select Pokemon below to import.</p>
			<div class="poke-count-container multi">
				<span class="poke-count">0</span> / <span class="poke-max-count">100</span>
			</div>
			<div class="pokebox-options">
				<a href="#" class="pokebox-refresh">Refresh</a>
				<a href="https://www.pokebattler.com/pokebox" class="pokebox-edit" target="_blank">Edit Pokebox</a>
				<a href="https://www.pokebattler.com/user/sponsor/pvpoke" class="pvpoke-sponsor" target="_blank">Sponsor PvPoke</a>
			</div>

			<div class="poke-search-container">
				<input class="poke-search" context="ranking-search" type="text" placeholder="Search Pokemon" />
				<div class="check select-all"><span></span>Select all</div>
			</div>

			<div class="pokebox-list rankings-container">
				Loading Pokebox...
			</div>
			<div class="error hide">
				{@html errorText}
			</div>
			<div class="center multi">
				<div class="button select">Select Pokemon</div>
			</div>
		</div>
		<div class="pokebox-off hide">
			<p>PvPoke integrates with <a href="https://www.pokebattler.com/" class="pokebattler">Pokebattler</a> so you can permanently store your Pokemon and import them on any device:</p>
			<ol>
				<li><a href="https://www.pokebattler.com/user" target="_blank">Create or log in</a> to your Pokebattler account.</li>
				<li>Add Pokemon to your Pokebox.</li>
				<li>Enter your Pokebattler ID (top right corner):<input type="text" class="pokebox-id" placeholder="Pokebattler ID" /></li>
			</ol>
			<p>With a Pokebattler subscription, you can store even more Pokemon and <a href="https://www.pokebattler.com/user/sponsor/pvpoke" target="_blank">sponsor PvPoke!</a></p>
			<div class="center">
				<div class="button save">Save Settings</div>
			</div>
		</div>
	</div>
</div>
