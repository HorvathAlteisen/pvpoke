<script lang="ts">
	/** articles/community-day/23-09-grubbin.php */
	import { page } from '$app/state';
	import Scripts from '$lib/components/layout/Scripts.svelte';
	import ChecklistTemplate from '$lib/components/articles/ChecklistTemplate.svelte';

	const { webRoot, siteVersion } = $derived(page.data);
</script>

<div class="section article white grubbin">
	<h1>Grubbin  Community Day Guide for PvP</h1>
	<div class="date">Last updated September 21st, 2023</div>
	<img src="{webRoot}articles/article-assets/community-day/23-09-grubbin/banner.jpg" />
	<p>Both Charjabug and Vikavolt are getting the exlusive treatment this Community Day! How will they fare in PvP with Volt Switch? Let's dig into the details below and explore their viability. You can also see more info on Grubbin Community Day at the <a href="https://pokemongolive.com/en/post/communityday-september-2023-grubbin/" target="_blank">Pokemon GO blog</a>. </p>

	<a name="overview"></a>
	<h3 class="article-header"><strong>Overview</strong></h3>

	<div class="cd-features">
		<div class="feature">
			<h4>Date &amp; Time</h4>
			<div class="value">Saturday, September 23rd<br></div>
			<div class="detail">2pm - 5pm local time</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">3x Catch XP</div>
		</div>
		<div class="feature">
			<h4>Exclusive Fast Move</h4>
			<div class="value">Volt Switch</div>
			<div class="detail">Both Charjabug and Vikavolt will learn Volt Switch</div>
		</div>
	</div>

	<a name="checklist"></a>
	<h3 class="article-header"><strong>League &amp; IV Recommendations</strong></h3>

	<ChecklistTemplate />

	<div class="mega-section">
		<div class="mega-title">
			<div class="mega-icon"></div>
			<h4>Mega Evolve one of these Pokemon during Community Day to earn bonus catch candy!</h4>
		</div>
		<div class="mega-list">
			<div class="mega-item" mega="beedrill">
				<div class="mega-image"></div>
				<div class="mega-label">Beedrill</div>
			</div>
			<div class="mega-item" mega="pinsir">
				<div class="mega-image"></div>
				<div class="mega-label">Pinsir</div>
			</div>
			<div class="mega-item" mega="scizor">
				<div class="mega-image"></div>
				<div class="mega-label">Scizor</div>
			</div>
			<div class="mega-item" mega="kyogre">
				<div class="mega-image"></div>
				<div class="mega-label">Kyogre</div>
			</div>
		</div>
	</div>

	<a name="faq"></a>
	<div class="faq-item">
		<h3 class="article-header"><strong>How good is Vikavolt with Volt Switch?</strong></h3>
		<div class="faq-answer">
			<p><b>Vikavolt lacks the stats and moves to be relevant in PvP, even with Volt Switch.</b> Volt Switch provides a small upgrade over Spark, but Vikavolt doesn't yet have the powerful Charged Moves it needs to overcome its low stat product. Look to obtain Vikavolt during this event in case of a future move update.</p>
		</div>
	</div>

	<a name="faq"></a>
	<div class="faq-item">
		<h3 class="article-header"><strong>How good is Charjabug with Volt Switch?</strong></h3>
		<div class="faq-answer">
			<p><b>Charjabug with Volt Switch should have a stronger presence in themed cups and may even see some play in open Great League.</b> Charjabug is far bulkier than Vikavolt and squeezes a lot more mileage out of the Fast Move upgrade. Along with the boost to X-Scissor this season, Charjabug stands to take advantage of these improvements in future formats such as Halloween Cup.</p>
			<p>In the open Great League, Charjabug stands out among the limited number of viable Electric types thanks to its bulk and handy resistances to Fighting and Grass. However, the rise of Gligar as the dominant Flying type raises questions about Charjabug's overall viability. Its chances look more favorable in tournament play where hard counters such as Galarian Stunfisk, Bastiodon, and Steelix see less play than in GO Battle League.</p>
		</div>
	</div>

	<a name="further-resources"></a>
	<h3 class="article-header"><strong>Additional Resources</strong></h3>

	<div class="flex further-resource-links">
		<a href="https://www.stadiumgaming.gg/rank-checker" class="gostadium" target="_blank">Stadium Gaming<br>Rank Checker</a>
		<a href="https://pvpivs.com/" target="_blank">pvpivs.com</a>
	</div>

	<div class="share-link-container">
		<p>Share this article:</p>
		<div class="share-link">
			<input type="text" value="https://pvpoke.com/articles/community-day/23-09-grubbin/" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<!-- Scripts -->
<Scripts>
	<script>
		var articleId = "23-09-grubbin"; // This is used to fetch JSON data for this page's checklist
	</script>

	<script src="{webRoot}js/GameMaster.js?v={siteVersion}"></script>
	<script src="{webRoot}js/pokemon/Pokemon.js?v={siteVersion}"></script>
	<script src="{webRoot}js/interface/ModalWindow.js?v={siteVersion}"></script>
	<script src="{webRoot}js/interface/ArticleChecklist.js?v={siteVersion}"></script>
	<script src="{webRoot}js/battle/timeline/TimelineEvent.js?v={siteVersion}"></script>
	<script src="{webRoot}js/battle/Battle.js?v={siteVersion}"></script>
	<script src="{webRoot}js/battle/Battle.js?v={siteVersion}"></script>
	<script src="{webRoot}js/Main.js?v={siteVersion}"></script>
</Scripts>
