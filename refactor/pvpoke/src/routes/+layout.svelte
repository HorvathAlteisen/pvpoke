<script lang="ts">
    import { dev } from '$app/environment'

    import Body from '$lib/components/Body.svelte'
    import Header from '$lib/components/Header.svelte'
    	//import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

    let SITE_VERSION: string = $state(`${Math.floor(Math.random() * 1000)}.${Math.floor(Math.random() * 1000)}.${Math.floor(Math.random() * 1000)}`);

    $effect(() => {
        if (dev) {
            SITE_VERSION = `${Math.floor(Math.random() * 1000)}.${Math.floor(Math.random() * 1000)}.${Math.floor(Math.random() * 1000)}`;
        }
    });

</script>

<div class="main-wrap">
	<div id="main">
		<div class="hide mega-warning"><b>Stats for unreleased Mega Evolutions are speculative. Don't invest any resources until they're officially released.</b></div>
        <Header />
        <Body version={SITE_VERSION} />
        <slot/>
    </div>
</div>
<Footer />