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

<slot />

<Footer siteVersion={SITE_VERSION} />
