<script lang="ts">
	/** articles/community-day/25-09-flabebe.php */
	import { page } from '$app/state';
	import Scripts from '$lib/components/layout/Scripts.svelte';
	import ChecklistTemplate from '$lib/components/articles/ChecklistTemplate.svelte';

	const { webRoot, siteVersion } = $derived(page.data);
</script>

<div class="section article white flabebe">
	<h1>Flabébé Community Day Guide for PvP</h1>
	<div class="date">Last updated September 12th, 2025</div>
	<img src="{webRoot}articles/article-assets/community-day/25-09-flabebe/banner.jpg" />
	<p>Florges is already a strong Fairy option, and will improve further with the addition of a new attack, Chilling Water. How much will this lift its play? Below is a deep dive into Florges's meta relevancy and IV considerations. You can find more info on Flabébé Community Day at the <a href="https://pokemongo.com/en/post/communityday-september-2025-flabebe" target="_blank">Pokemon GO blog</a>. </p>

	<a name="overview"></a>
	<h3 class="article-header"><strong>Overview</strong></h3>

	<div class="cd-features">
		<div class="feature">
			<h4>Date &amp; Time</h4>
			<div class="value">Sunday, September 14th<br></div>
			<div class="detail">2pm - 5pm local time</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">1/4 Egg Hatch Distance</div>
		</div>
		<div class="feature">
			<h4>Exclusive Charged Attack</h4>
			<div class="value">Chilling Water</div>
			<div class="detail">60 power, lowers the opposing Pokemon's Attack by one stage.</div>
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
			<div class="mega-item" mega="gardevoir">
				<div class="mega-image"></div>
				<div class="mega-label">Gardevoir</div>
			</div>
			<div class="mega-item" mega="mawile">
				<div class="mega-image"></div>
				<div class="mega-label">Mawile</div>
			</div>
			<div class="mega-item" mega="altaria">
				<div class="mega-image"></div>
				<div class="mega-label">Altaria</div>
			</div>
			<div class="mega-item" mega="audino">
				<div class="mega-image"></div>
				<div class="mega-label">Audino</div>
			</div>
			<div class="mega-item" mega="diancie">
				<div class="mega-image"></div>
				<div class="mega-label">Diancie</div>
			</div>
		</div>
	</div>

	<a name="faq"></a>
	<div class="faq-item">
		<h3 class="article-header"><strong>How good is Florges with Chilling Water?</strong></h3>
		<div class="faq-answer">
			<p><b>Florges with Chilling Water is a strong contender in all three leagues, and stands out most in Ultra and Master League.</b> Florges has average stat product, but its excellent pacing with Fairy Wind and strong Charged Attack options give it considerable play. Not only that, it's one of the most accessible Pokemon for Ultra and Master League, which are typically cost prohibitive.</p>
			<p>Chilling Water improves Florges's coverage, able to hit Fire types which resist Moonblast or Trailblaze. By switching from Trailblaze, it trades an Attack boost for an Attack drop, artificially boosting its stat product to compete with meta heavyweights. In Great League, Florges will likely take a backseat to top Fairy picks like Dedenne, Azumarill, or Togekiss, but Water + Fairy coverage make it an ample substitute.</p>
		</div>
	</div>

	<a name="faq"></a>
	<div class="faq-item">
		<h3 class="article-header"><strong>Does Florges's color matter in PvP?</strong></h3>
		<div class="faq-answer">
			<p><b>No, Florges has the same stats and attacks regardless of its color.</b></p>
		</div>
	</div>

	<a name="further-resources"></a>
	<h3 class="article-header"><strong>Additional Resources</strong></h3>

	<div class="flex further-resource-links">
		<a href="https://pvpivs.com/" target="_blank">pvpivs.com</a>
	</div>

	<div class="share-link-container">
		<p>Share this article:</p>
		<div class="share-link">
			<input type="text" value="https://pvpoke.com/articles/community-day/25-09-flabebe/" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<!-- Scripts -->
<Scripts>
	<script>
		var articleId = "25-09-flabebe"; // This is used to fetch JSON data for this page's checklist
	</script>

	<script src="{webRoot}js/GameMaster.js?v={siteVersion}"></script>
	<script src="{webRoot}js/pokemon/Pokemon.js?v={siteVersion}"></script>
	<script src="{webRoot}js/interface/ModalWindow.js?v={siteVersion}"></script>
	<script src="{webRoot}js/interface/ArticleChecklist.js?v={siteVersion}"></script>
	<script src="{webRoot}js/battle/timeline/TimelineEvent.js?v={siteVersion}"></script>
	<script src="{webRoot}js/battle/DamageCalculator.js?v={siteVersion}"></script>
	<script src="{webRoot}js/battle/Battle.js?v={siteVersion}"></script>
	<script src="{webRoot}js/battle/Battle.js?v={siteVersion}"></script>
	<script src="{webRoot}js/Main.js?v={siteVersion}"></script>
</Scripts>
