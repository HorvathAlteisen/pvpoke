<script lang="ts">
    export let league: string;
    export let CANONICAL: string;
    export let META_TITLE: string;
    export let META_DESCRIPTION: string;
</script>

<svelte:head>
    <title>{META_TITLE}</title>
    <meta name="description" content={META_DESCRIPTION} />
    <link rel="canonical" href={CANONICAL} />
</svelte:head>

<h1>{league} PvP Rankings</h1>

<p>{META_DESCRIPTION}</p>
