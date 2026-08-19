<script lang="ts">
	/** community-day/22-02-hoppip.php */
	import { page } from '$app/state';
	import Scripts from '$lib/components/layout/Scripts.svelte';
	import ChecklistTemplate from '$lib/components/articles/ChecklistTemplate.svelte';

	const { webRoot, siteVersion } = $derived(page.data);
</script>

<div class="section article white hoppip">
	<h1>Hoppip Community Day Guide for PvP</h1>
	<div class="date">Last updated February 10th, 2022</div>
	<img src="{webRoot}articles/article-assets/community-day/22-02-hoppip/banner.jpg" />
	<p>Jumpluff's time to shine is skip and a hop away! Hoppip Community Day is Saturday, February 12th, and Jumpluff will receive a Flying-type Charged Move, Acrobatics. You can find more info about Hoppip Community Day at the official <a href="https://pokemongolive.com/en/post/communityday-feb22-hoppip/" target="_blank">Pokemon GO blog</a>. Below are the leagues and IV spreads to look out for, and answers to frequently asked questions.</p>

	<a name="overview"></a>
	<h3 class="article-header"><strong>Overview</strong></h3>

	<div class="cd-features">
		<div class="feature">
			<h4>Date &amp; Time</h4>
			<div class="value">Saturday, February 12th<br></div>
			<div class="detail">11am - 5pm local time</div>
		</div>
		<div class="feature">
			<h4>Exclusive Charged Move</h4>
			<div class="value">Acrobatics</div>
			<div class="detail">110 power</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">3x Catch Stardust</div>
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
			<div class="mega-item" mega="venusaur">
				<div class="mega-image"></div>
				<div class="mega-label">Venusaur</div>
			</div>
			<div class="mega-item" mega="charizard-y">
				<div class="mega-image"></div>
				<div class="mega-label">Charizard Y</div>
			</div>
			<div class="mega-item" mega="pidgeot">
				<div class="mega-image"></div>
				<div class="mega-label">Pidgeot</div>
			</div>
			<div class="mega-item" mega="aerodactyl">
				<div class="mega-image"></div>
				<div class="mega-label">Aerodactyl</div>
			</div>
			<div class="mega-item" mega="abomasnow">
				<div class="mega-image"></div>
				<div class="mega-label">Abomasnow</div>
			</div>
		</div>
	</div>

	<a name="faq"></a>
	<div class="faq-item">
		<h3 class="article-header"><strong>How good is Jumpluff with Acrobatics?</strong></h3>
		<div class="faq-answer">
			<p><b>Acrobatics is a minor upgrade for Jumpluff but it's unlikely to push Jumpluff above its current standing among Grass types.</b> Jumpluff is a solid Pokemon for Great League PvP that's usually overshadowed by stronger Grass options like Venusaur or Tropius. It will be strongest in themed cups where those Grass types are unavailable, such as Johto Cup.</p>
			<p>Acrobatics takes the spot of Aerial Ace and is Jumpluff's most efficient Charged Move. It gives Jumpluff more closing power, shield pressure, and Flying damage output. However, Acrobatics sacrifices speed and leaves Jumpluff with high energy Charged Moves. For this reason, Acrobatics isn't a strict upgrade, and Jumpluff may find itself missing Aerial Ace in scenarios where it can't reach Acrobatics.</p>
			<p>Jumpluff maxes at 1636 CP, so it isn't relevant for Ultra League or Master League. It's viable in potential Little Cup formats but not a priority.</p>
		</div>
	</div>

	<div class="faq-item">
		<h3 class="article-header"><strong>I'm not level 40 and can't obtain Candy XL yet. Should I still evolve a Jumpluff?</strong></h3>
		<div class="faq-answer">
			<p><b>Yes, Jumpluff is worth evolving even if you can't power one above level 40.</b> The difference between a level 43 Jumpluff and a level 40 Jumpluff is minimal. Look for Jumpluff with IV's that can reach 1500 CP without Candy XL, such as 4/15/14.</p>
		</div>
	</div>

	<div class="faq-item">
		<h3 class="article-header"><strong>My Shadow Jumpluff still has Frustration. Can it learn Acrobatics if I evolve it during Community Day?</strong></h3>
		<div class="faq-answer">
			<p><b>No, a Shadow Pokemon with Frustration cannot learn an exclusive Charged Move when it evolves, </b> even if it has a 2nd Charged Move unlocked. You must have removed Frustration during a previous Team Rocket event.</p>
		</div>
	</div>

	<div class="faq-item">
		<h3 class="article-header"><strong>Is Return Jumpluff worth a look?</strong></h3>
		<div class="faq-answer">
			<p><b>No, Acrobatics is now a better Charged Move option than Return.</b> Almost all Pokemon that resist Acrobatics and Energy Ball also resist Return.</p>
			<p>Acrobatics will replace Return if you evolve a purified Jumpluff during event hours. To obtain a Jumpluff with both Acrobatics and Return, you must use an Elite TM to obtain Acrobatics after the event.</p>
		</div>
	</div>

	<a name="further-resources"></a>
	<h3 class="article-header"><strong>Additional Resources</strong></h3>

	<div class="flex further-resource-links">
		<a href="{webRoot}articles/article-assets/community-day/22-02-hoppip/hoppip-infographic.jpg" class="infographic" target="_blank">&darr; Infographic Version</a>
		<a href="https://www.stadiumgaming.gg/rank-checker" class="gostadium" target="_blank">Stadium Gaming<br>Rank Checker</a>
		<a href="https://pvpivs.com/" target="_blank">pvpivs.com</a>
	</div>

	<div class="share-link-container">
		<p>Share this article:</p>
		<div class="share-link">
			<input type="text" value="https://pvpoke.com/articles/community-day/22-02-hoppip/" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<Scripts>
<script>
	var articleId = "22-02-hoppip"; // This is used to fetch JSON data for this page's checklist
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
