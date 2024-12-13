<script lang="ts">
	import { dev } from '$app/environment';

	import Body from '$lib/components/Body.svelte';
	import Header from '$lib/components/Header.svelte';
	//import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let SITE_VERSION: string = $state('1.3.11');

	$effect(() => {
		if (dev) {
			SITE_VERSION = `${Math.floor(Math.random() * 1000)}.${Math.floor(Math.random() * 1000)}.${Math.floor(Math.random() * 1000)}`;
		}
	});
</script>

<Header version={SITE_VERSION} />
<!--index.php-->
<div class="main-wrap">
	<div id="main">
		<div class="hide mega-warning">
			<b
				>Stats for unreleased Mega Evolutions are speculative. Don't invest any resources until
				they're officially released.</b
			>
		</div>
		<Body version={SITE_VERSION} />
		<slot />
	</div>
</div>
<Footer version={SITE_VERSION} />
