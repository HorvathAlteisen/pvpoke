<script lang="ts">
	/** articles/index.php */
	import { page } from '$app/state';
	import Scripts from '$lib/components/layout/Scripts.svelte';
	import ArticlePreview from '$lib/components/modules/ArticlePreview.svelte';

	const { webRoot, siteVersion } = $derived(page.data);
</script>

<h1>Articles</h1>
<div class="section home white">

	<input type="text" class="article-search" placeholder="Search title or tag" />

	<div class="articles"></div>
	<ArticlePreview />

	<Scripts>
	<script src="{webRoot}js/GameMaster.js?v={siteVersion}"></script>
	<script src="{webRoot}js/pokemon/Pokemon.js?v={siteVersion}"></script>
	<script src="{webRoot}js/interface/ArticlesInterface.js?v={siteVersion}"></script>
	<script src="{webRoot}js/battle/timeline/TimelineEvent.js?v={siteVersion}"></script>
	<script src="{webRoot}js/battle/Battle.js?v={siteVersion}"></script>
	<script src="{webRoot}js/Main.js?v={siteVersion}"></script>
	</Scripts>

</div>
