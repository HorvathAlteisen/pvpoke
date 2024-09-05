<script lang="ts">
    import { dev } from '$app/environment';
    import Header from './Header.svelte';
    import Footer from './Footer.svelte';

    let SITE_VERSION: string;

    $: {
        if (dev) {
            SITE_VERSION = `${Math.floor(Math.random() * 1000)}.${Math.floor(Math.random() * 1000)}.${Math.floor(Math.random() * 1000)}`;
        }
    }
</script>

<Header siteVersion={SITE_VERSION} />
<div class="main-wrap">
    <div id="main">
        <div class="hide mega-warning">
            <b
                >Stats for unreleased Mega Evolutions are speculative. Don't invest any resources
                until they're officially released.</b
            >
        </div>

        <div class="section home white">
            <slot />
        </div>
    </div>
</div>
<Footer siteVersion={SITE_VERSION} />
