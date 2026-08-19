<script lang="ts">
	/** rss/feedEditor.php */
	import { page } from '$app/state';
	import Scripts from '$lib/components/layout/Scripts.svelte';

	const { webRoot, siteVersion } = $derived(page.data);
</script>

<h1>RSS Feed</h1>
<div class="section league-select-container white">
	<p>Add a post to the site's RSS feed and copy the output to rss/feed.xml.</p>

	<input type="text" id="post-title" placeholder="Post title" style="margin-bottom: 10px; font-weight: bold;" />
	<input type="text" id="post-link" placeholder="URL" value="https://pvpoke.com/" />
	<textarea id="post-content" style="margin-top: 10px; width: 100%; height: 200px; font-family: sans-serif; font-size: 16px;" ></textarea>

	<div id="add-post" class="button" style="max-width: 200px; margin: 20px 0 0 0;">Add Post</div>

	<!--`<hr></hr>` is invalid (hr is a void element) but present in the PHP, so it is emitted raw-->
	{@html '<hr></hr>'}
	<br>

	<div class="feed"></div>

	<div class="news-item template hide">
		<h4></h4>
		<div class="news-content"></div>
		<div class="news-info">
			<div class="news-date"></div>
			<a href="#"><div class="link-text">pvpoke.com</div><div>&rarr;</div></a>
		</div>
	</div>

</div>

<textarea class="export" style="width:100%; height: 150px; padding: 10px;"></textarea>
<div class="button copy export-xml">Copy</div>

<Scripts>
<script src="{webRoot}js/GameMaster.js?v={siteVersion}"></script>
<script src="{webRoot}js/pokemon/Pokemon.js?v={siteVersion}"></script>
<script src="{webRoot}js/interface/RSSReader.js?v={siteVersion}"></script>
<script src="{webRoot}js/devtools/RSSFeedInterface.js?v={siteVersion}"></script>
</Scripts>
