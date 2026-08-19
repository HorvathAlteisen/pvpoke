<script lang="ts">
	/**
	 * tera/footer.php: ad placeholders (no nitro-desktop-anchor here, unlike the main
	 * footer), <footer>, and the global inline script (share-link select/copy, `.toggle`,
	 * and `.check` click-toggle — the main site's Footer.svelte does the `.check` toggle in
	 * JS files instead, tera does it here). The closing of `#main` / `.main-wrap` lives in
	 * routes/(tera)/tera/+layout.svelte. Emitted with {@html} because a bare top-level
	 * `<script>` in a component's root fragment is rejected as a second component script
	 * (see CONVENTIONS §2).
	 */
	import { page } from '$app/state';
	import AdSlot from '$lib/components/ads/AdSlot.svelte';

	const { webRoot, siteVersion } = $derived(page.data);

	const globalScript = `<!--Global script-->
<script>

// Auto select link

$(".share-link input").click(function(e){
	this.setSelectionRange(0, this.value.length);
});

// Link share copying

$("body").on("click", ".share-link .copy", function(e){
	var el = $(e.target).prev()[0];
	el.focus();
	el.setSelectionRange(0, el.value.length);
	document.execCommand("copy");
});

// Toggleable sections

$("body").on("click", ".toggle", function(e){
	e.preventDefault();

	$(e.target).closest(".toggle").toggleClass("active");
});

// Turn checkboxes on and off

$("body").on("click", ".check", function checkBox(e){
	$(this).toggleClass("on");
	$(this).trigger("change");
});

<\/script>`;
</script>

<AdSlot name="nitro-sidebar-left" />
<AdSlot name="nitro-sidebar-left-300" />
<AdSlot name="nitro-sidebar-right" />
<AdSlot name="nitro-sidebar-right-300" />
<AdSlot name="mobile-320" />

<footer>
<p>Pokemon stats via <a href="https://victoryroadvgc.com/sv-paldea-dex/" target="_blank">victoryroadvgc.com</a></p>
<p class="copyright">Version <a href="https://github.com/pvpoke/pvpoke/releases">{siteVersion}</a> &copy; 2023 PvPoke LLC, released under the <a href="https://opensource.org/licenses/MIT" target="_blank">MIT license</a> | <a href="{webRoot}privacy/">Privacy Policy</a></p>
<p>Pokémon copyright of The Pokémon Company, GameFreak, and Nintendo. All trademarked images and names are property of their respective owners, and any such material is used on this site for educational purposes only. PvPoke LLC has no affiliation with The Pokémon Company, Niantic, Inc., or Nintendo.</p>
</footer>

{@html globalScript}
