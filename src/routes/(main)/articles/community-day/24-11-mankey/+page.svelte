<script lang="ts">
	/** articles/community-day/24-11-mankey.php */
	import { page } from '$app/state';
	import Scripts from '$lib/components/layout/Scripts.svelte';
	import ChecklistTemplate from '$lib/components/articles/ChecklistTemplate.svelte';

	const { webRoot, siteVersion } = $derived(page.data);
</script>

<div class="section article white mankey">
	<h1>Mankey Community Day Guide for PvP</h1>
	<div class="date">Last updated November 8th, 2024</div>
	<img src="{webRoot}articles/article-assets/community-day/24-11-mankey/banner.jpg" />
	<p>The Mankey family is getting a big Community Day with Primeape and Annihilape both learning Rage Fist! Annihilape once dominated the PvP meta, so time will tell if Rage Fist helps it step back into the ring after the Counter nerf. Meanwhile, Primeape looks better than ever with high energy gain from Karate Chop. Let's dive into the details below! You can find more info on Mankey Community Day at the <a href="https://pokemongolive.com/post/communityday-november-2024-mankey?hl=en" target="_blank">Pokemon GO blog</a>. </p>

	<a name="overview"></a>
	<h3 class="article-header"><strong>Overview</strong></h3>

	<div class="cd-features">
		<div class="feature">
			<h4>Date &amp; Time</h4>
			<div class="value">Sunday, November 10th<br></div>
			<div class="detail">2pm - 5pm local time</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">3x Catch XP</div>
		</div>
		<div class="feature">
			<h4>Exclusive Charged Attack</h4>
			<div class="value">Rage Fist</div>
			<div class="detail">50 power, increases Attack by one stage<br>Learned by both Annihilape and Primeape</div>
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
			<div class="mega-item" mega="blaziken">
				<div class="mega-image"></div>
				<div class="mega-label">Blaziken</div>
			</div>
			<div class="mega-item" mega="medicham">
				<div class="mega-image"></div>
				<div class="mega-label">Medicham</div>
			</div>
			<div class="mega-item" mega="lopunny">
				<div class="mega-image"></div>
				<div class="mega-label">Lopunny</div>
			</div>
			<div class="mega-item" mega="lucario">
				<div class="mega-image"></div>
				<div class="mega-label">Lucario</div>
			</div>
		</div>
	</div>

	<a name="faq"></a>
	<div class="faq-item">
		<h3 class="article-header"><strong>How good is Annihilape with Rage Fist?</strong></h3>
		<div class="faq-answer">
			<p><b>Annihilape should return to the meta with Rage Fist and could be top meta again in future seasons.</b> Annihilape immediately became a top meta Pokemon after its debut, but took a hard hit from the Counter nerf this season. With Rage Fist, Annihilape should see play again in all three leagues, although it probably won't return to its previous apex without further move updates. Rage Fist Annihilape is coming at a time when the Fighting-type field is notably thin, so its resurgence could help fill a gap that's been open since the latest meta shift.</p>
			<p>Annihilape previously ran Night Slash and Shadow Ball as its preferred Charged Attacks. Since Rage Fist is a Ghost-type attack with a guaranteed Attack boost, it may discard both of these moves for the STAB combo of Rage Fist + Close Combat. Ice Punch still exists as a coverage move depending on the meta, but it's a less likely option.</p>
		</div>
	</div>

	<div class="faq-item">
		<h3 class="article-header"><strong>How good is Primeape with Rage Fist? Is it better or worse than Annihilape?</strong></h3>
		<div class="faq-answer">
			<p><b>Rage Fist Primeape looks better than Annihilape in the short term, but has fewer prospects long term.</b> With its legacy attack Karate Chop, Primeape significantly outspeeds Annihilape and can quickly stack Rage Fist buffs. That said, pure Fighting types like Primeape rarely find a foothold in the metagame. Even its closest comparisons, Machamp and Pangoro, don't see widespread play. Ultimately, Primeape could be better than Annihilape for now, but Annihilape's stats and dual typing give it more potential for the future.</p>
			<p>Like Annihilape, Primeape has a wide movepool and is most likely to settle on Rage Fist + Close Combat as its preferred moveset. Karate Chop has less Fast Attack pressure than Counter and Primeape's Rage Fist lacks STAB, so it's more reliant on Close Combat than Annihilape is to secure its matchups.</p>
		</div>
	</div>

	<div class="faq-item">
		<h3 class="article-header"><strong>How do I evolve Primeape into Annihilape?</strong></h3>
		<div class="faq-answer">
			<p>Primeape has an evolution task which can only be completed while Primeape is your buddy. During event hours and until 10pm local time, <b>Primeape's evolution task is to catch 20 Fighting-type Pokemon while Primeape is your buddy.</b> Outside of this time, Primeape's evolution task is to defeat 30 Psychic or Ghost-type Pokemon while Primeape is your buddy. These Pokemon can be defeated in gym battles, raid battles, Rocket battles, or trainer battles. You also aren't required to defeat them with Primeape - you can defeat them with any Pokemon.</p>
		</div>
	</div>

	<div class="faq-item">
		<h3 class="article-header"><strong>My Shadow Mankey still has Frustration. Can it learn a Community Day move if I evolve it during the event?</strong></h3>
		<div class="faq-answer">
			<p><b>No, Shadow Pokemon with Frustration cannot learn an exclusive Charged Attack when it evolves, </b> even if it has a 2nd Charged Attack unlocked. You must have removed Frustration during a previous Team Rocket event.</p>
		</div>
	</div>

	<div class="faq-item">
		<h3 class="article-header"><strong>What will happen if I evolve a Purified Mankey during Community Day? Is there a way to obtain both Rage Fist and Return?</strong></h3>
		<div class="faq-answer">
			<p><b>An exclusive Charged Attack will replace Return if you evolve a Purified Pokemon during its Community Day event.</b> To obtain both Rage Fist and Return, you must evolve your Pokemon after the event's evolution window (10pm local time), unlock a 2nd Charged Attack, and use an Elite TM to obtain Rage Fist.</p>
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
			<input type="text" value="https://pvpoke.com/articles/community-day/23-11-mankey/" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<!-- Scripts -->
<Scripts>
	<script>
		var articleId = "24-11-mankey"; // This is used to fetch JSON data for this page's checklist
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
