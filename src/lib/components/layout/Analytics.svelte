<script lang="ts">
	/** modules/analytics.php — the gtag snippet; `$UA` comes from env PVPOKE_GA_ID. */
	import { page } from '$app/state';

	const gaId = $derived(page.data.gaId);

	const html = $derived(`<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"><\/script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${gaId}');

  var gaId = '${gaId}';
<\/script>`);
</script>

{@html html}
