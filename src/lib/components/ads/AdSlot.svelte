<script lang="ts">
	/**
	 * modules/ads/*.php and tera/modules/ads/*.php: every one of them is
	 * `<?php if($_SETTINGS->ads == 1) : ?>\n\n<?php endif; ?>` — an empty slot gated on the
	 * `ads` setting. Nothing is rendered; the component keeps the structure in place so ad
	 * code can be added later without touching the pages. `name` is the PHP file name
	 * without extension (base-code, body-728, header-728, mobile-320, nitro-*).
	 */
	import { page } from '$app/state';
	import { settingIsOne } from '$lib/settings';

	let { name }: { name: string } = $props();

	const ads = $derived(settingIsOne(page.data.settings.ads));
</script>

{#if ads}{/if}
