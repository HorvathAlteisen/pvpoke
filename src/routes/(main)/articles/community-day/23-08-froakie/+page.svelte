<script lang="ts">
	/** articles/community-day/23-08-froakie.php */
	import { page } from '$app/state';
	import Scripts from '$lib/components/layout/Scripts.svelte';
	import ChecklistTemplate from '$lib/components/articles/ChecklistTemplate.svelte';

	const { webRoot, siteVersion } = $derived(page.data);
</script>

<div class="section article white poliwag">
	<h1>Froakie Community Day Guide for PvP</h1>
	<div class="date">Last updated August 9th, 2023</div>
	<img src="{webRoot}articles/article-assets/community-day/23-08-froakie/banner.jpg" />
	<p>The fan favorite Greninja is finally getting the level-up it needs! Will it be enough to become viable in PvP? Let's find out more about Greninja and IV's to look for during the upcoming Community Day! You can also see more info on Froakie Community Day at the <a href="https://pokemongolive.com/en/post/communityday-august-2023-froakie/" target="_blank">Pokemon GO blog</a>. </p>

	<a name="overview"></a>
	<h3 class="article-header"><strong>Overview</strong></h3>

	<div class="cd-features">
		<div class="feature">
			<h4>Date &amp; Time</h4>
			<div class="value">Sunday, August 13th<br></div>
			<div class="detail">2pm - 5pm local time</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">3x Catch Stardust</div>
		</div>
		<div class="feature">
			<h4>Exclusive Charged Move</h4>
			<div class="value">Hydro Cannon</div>
		</div>
		<div class="feature">
			<h4>New Fast Move</h4>
			<div class="value">Water Shuriken</div>
			<div class="detail">Available via regular TM and<br> after the event</div>
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
			<div class="mega-item" mega="blastoise">
				<div class="mega-image"></div>
				<div class="mega-label">Blastoise</div>
			</div>
			<div class="mega-item" mega="slowbro">
				<div class="mega-image"></div>
				<div class="mega-label">Slowbro</div>
			</div>
			<div class="mega-item" mega="gyarados">
				<div class="mega-image"></div>
				<div class="mega-label">Gyarados</div>
			</div>
			<div class="mega-item" mega="swampert">
				<div class="mega-image"></div>
				<div class="mega-label">Swampert</div>
			</div>
			<div class="mega-item" mega="kyogre">
				<div class="mega-image"></div>
				<div class="mega-label">Primal Kyogre</div>
			</div>
		</div>
	</div>

	<a name="faq"></a>
	<div class="faq-item">
		<h3 class="article-header"><strong>How good is Greninja with Hydro Cannon and Water Shuriken?</strong></h3>
		<div class="faq-answer">
			<p><b>Hydro Cannon and Water Shuriken dramatically improve Greninja as a viable glass cannon for Great and Ultra League, especially themed cups.</b> Water Shuriken is currently the highest energy-generating Fast Move and allows Greninja to reach Hydro Cannon at incredible speed, <i>even faster than Swampert</i>. Combined with the 35-energy move Night Slash, Greninja has one of fastest movesets in the game. That said, Greninja is unlikely to unseat Swampert in the open leagues because of its worse weakness profile, so it may see more action in themed cups.</p>
			<p>Greninja's playstyle is comparable to Shiftry's, another Dark type with similar energy generation and spammy Charged Moves. Like Shiftry, Greninja has low stat product. It needs shields to stay in the fight and is vulnerable to any kind of Fast Move pressure. Greninja thrives best with energy advantage and in Charged Move-oriented matchups where it can command the pace.</p>
			<p>Greninja stands out most in Ultra League where it has more bulk to work with and common targets like Charizard, Giratina, Jellicent, and Cresselia. It's susceptible to being walled by several Pokemon, including Water/Fairies like Azumarill or Tapu Fini, Fighting types like Poliwrath or Virizion, and Dark/Dragons like Zweilous or Guzzlord in themed cups that include Dark types.</p>
		</div>
	</div>

	<div class="faq-item">
		<h3 class="article-header"><strong>Is Water Shuriken an exclusive move?</strong></h3>
		<div class="faq-answer">
			<p><b>No, Water Shuriken will become a permanent addition to Greninja's movepool at the start of the event and won't require an Elite TM.</b></p>
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
			<input type="text" value="https://pvpoke.com/articles/community-day/23-08-froakie/" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<!-- Scripts -->
<Scripts>
	<script>
		var articleId = "23-08-froakie"; // This is used to fetch JSON data for this page's checklist
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
