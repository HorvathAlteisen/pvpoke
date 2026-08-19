<script lang="ts">
	/** tera/header.php's `<header>` block. */
	import { page } from '$app/state';

	const { webRoot } = $derived(page.data);
</script>

<header>
	<div class="header-wrap">
		<a href="{webRoot}tera"><img src="{webRoot}img/themes/sunflower/header-white.png" title="PvPoke.com" /></a>
		<a class="home-link" href="{webRoot}">Back to main site</a>
	</div>
</header>
