<script lang="ts">
	/**
	 * Transparent wrapper for the `<script src>` lists at the end of a page. Svelte rejects a
	 * script tag that sits directly at the top level of a component's markup (it is taken for
	 * a second component script), but nested inside a component's children it is an ordinary
	 * element. Renders nothing of its own — usage:
	 *
	 *   <Scripts>
	 *     (the page's script tags, verbatim, with {webRoot} and {siteVersion})
	 *   </Scripts>
	 */
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

{@render children()}
