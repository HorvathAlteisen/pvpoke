<script lang="ts">
	/**
	 * articles/strategy/ultimate-guide-to-team-building.php
	 *
	 * The PHP source has two stray closing `</i>` tags with no matching opener
	 * (`<h3>3. Repeat</i></h3>`, `<h3>4. Big Picture</i></h3>`) — browsers ignore the dangling
	 * tag, but Svelte's compiler rejects mismatched markup, so they're dropped here (invisible
	 * difference per the porting convention on unclosed/mis-nested tags).
	 */
	import { page } from '$app/state';

	const { webRoot } = $derived(page.data);
</script>

<div class="section article white">
	<h1>Ultimate Guide to Team Building</h1>
	<div class="date">By <a href="https://twitter.com/PolymersUp">PolymersUp</a></div>
	<div class="date">Last updated August 11, 2020</div>
	<img src="{webRoot}articles/article-assets/ultimate-guide-to-team-building/banner.jpg" />
	<p>The <a href="{webRoot}team-builder/">Team Builder</a> feature was previously an underutilized tool, but now is integral to team building for any meta. As battlers have come to discover its extensive utility, that has also brought about questions of how much stock to put into achieving the lowest Threat Score and alternatives on how to approach team building. In addition to the Meta Scorecard, Threats section and Alternatives section, PvPoke recently added a Graded Overview as well to provide a multi-faceted evaluation of teams. In this article, we hopefully can shed some light on how to help you get the most out of Team Builder.</p>
	<p>Jump to a section:
		<ol>
			<li><a href="#grades">Graded Overview Explained</a></li>
			<li><a href="#cores">Introduction to Cores</a></li>
			<li><a href="#engineering-cores">Reverse Engineering a Core</a></li>
			<li><a href="#considerations">Key Team Building Considerations</a></li>
			<li><a href="#archetypes">Line Archetypes (Teams of 3)</a></li>
			<li><a href="#nonsequential">Nonsequential Team Building (Teams of 6)</a></li>
			<li><a href="#final">Final Thoughts</a></li>
		</ol>

	<img src="{webRoot}articles/article-assets/ultimate-guide-to-team-building/team-building-infographic.jpg" />

	<a name="grades"></a>
	<h3 class="article-header">Graded Overview Explained</h3>
	<div class="article-section">
		<h3>Coverage</h3>
		<p>&ldquo;Coverage&rdquo; is based on the Threat Score displayed in the Threats section. A score near 600 is the baseline for an &ldquo;A&rdquo;. It evaluates how well your team covers certain threats.</p>
		<h3>Bulk</h3>
		<p>"Bulk" is the average HP x Defense of the team. The baseline is the top bulky meta Pok&eacute;mon of the league like Azumarill in Great League or Giratina Altered in Ultra League.</p>
		<h3>Safety</h3>
		<p>"Safety" is the Pok&eacute;mon's Switch Score from the Rankings, which evaluates how hard or soft its losses are against key meta targets. There are some pitfalls to be aware of here because this method doesn't take different movesets into account (e.g. Poison Jab Alolan Muk is less safe than Snarl Alolan Muk).</p>
		<h3>Consistency</h3>
		<p>"Consistency" is the Pok&eacute;mon's Consistency Score from the Rankings which evaluates how dependent it is on landing baits. This is calculated with the results, so it is updated to the Pok&eacute;mon's current moveset in Team Builder.</p>
		<p>Expanding on the Threat Score, the summary provided in the Graded Overview helps to identify the strengths and weaknesses of your team with regard to shield dependency, Pivot (i.e. safe switch) versatility, and bait dependency, allowing you to further tailor it to your playstyle. For example, Consistency and Safety are both valuable traits in any format, but a team with overall low Bulk might be overly reliant on shields at times depending on the meta.</p>
	</div>

	<a name="cores"></a>
	<h3 class="article-header">Introduction to Cores</h3>
	<div class="article-section">
		<p>Duo and Trio Cores are a principal component of well-balanced rosters and integral to the team building process. From a Roster perspective, incorporating these highly complementary pairs can optimize your matchup coverage to afford you flexibility with the 6th roster spot to tilt your coverage in unique ways rather than being forced to patch a glaring hole. From a Battle Team perspective, Duo and Trio Cores can serve as stalwart lineups when you&rsquo;re in a pinch or simply provide that Meta Line bench pressure to keep your opponents honest.</p>
		<p>Trio Cores encompass multiple strong Duo Cores. For example, the Azumarill-Registeel-Altaria (ARA) Trio Core performs exceptionally well in open Great League not only because very few Pok&eacute;mon counter or check all 3, but also because 3 highly complimentary Duo Cores exist within the Trio Core (i.e. Azumarill-Altaria, Altaria-Registeel, Azumarill-Registeel). This affords more flexibility in the Lead choice, reduces the number of Pok&eacute;mon to which you are vulnerable in the back following a Pivot, and allows you to pair any of those Duo Cores with a different 3rd Pok&eacute;mon based on your opponent or the anticipated daily meta in GO Battle League.</p>
	</div>

	<a name="engineering-cores"></a>
	<h3 class="article-header">Reverse Engineering a Core</h3>
	<div class="article-section">
		<p>Conventionally, we often enter our primary Pok&eacute;mon into Team Builder, identify a strong core partner, and then continue to build sequentially adding Pok&eacute;mon that compensate for coverage gaps. During that initial step to build a core, Team Builder, however, can occasionally miss strong core partners in the suggestions by over-emphasizing one role to cover its hardest counters (e.g. Anti-Charm for a Sableye partner) or due to several obscure off-meta core breakers. An alternative approach is to select up to 6 Pok&eacute;mon that are representative of key meta Pok&eacute;mon or roles that pose a threat to your primary Pok&eacute;mon and then use Team Builder to identify Pok&eacute;mon that counter those meta-centric threats. Make note of those suggestions as potential core partners for your primary Pok&eacute;mon. This approach can potentially pinpoint less conventional core partners that PvPoke&rsquo;s algorithm might initially miss, leading you to potentially discover a hidden-gem core.</p>
	</div>

	<a name="considerations"></a>
	<h3 class="article-header">Key Team Building Considerations</h3>
	<div class="article-section">
		<h3>3 vs 6</h3>
		<p>A Threat Score approaching 500 is outstanding, but you ultimately have to battle with Teams of 3 and not Teams of 6. A Balanced Roster (Team of 6) does not always equate to balanced Lines (Teams of 3). Consider what Lines you will run throughout the team building process and be mindful to avoid Sequential Team Building which can potentially lead to Rock-Paper-Scissors (RPS)-heavy teams or an underutilized stopgap 6th pick.</p>

		<h3>Energy Swings</h3>
		<p>Team Builder simulations primarily consider zero-energy scenarios with an emphasis on the zero-shield and one-shield scenarios and display bait-dependent wins by default and don&rsquo;t account for sandbox wins (i.e. default simulation losses which are, in fact, wins with manual adjustment in Sandbox Mode such as <a href="https://pvpoke.com/battle/sandbox/1500/lapras-21.5-7-5-12-4-4-1/azumarill/22/1-5-6/0-3-1/19.110100-23.100110-33.110000-43.100010-50.110000-63.101000/">Lapras versus Azumarill</a> on the Scorecard (note: you can toggle shield baiting in the Advanced menu at the top of the page). Keep in mind throughout the team building process how your team will respond to certain Core Checks if at an energy deficit. For example, you might be overly weak to a meta-centric Pok&eacute;mon if it is used as a Pivot. Additionally, the Safety and Consistency grades also are potential indicators of how well your team handles energy differentials.</p>

		<h3>Balance Not Required</h3>
		<p>Trio Cores provide lead and pivot flexibility as they encompass multiple strong Duo Cores, but Lines do not have to be perfectly balanced to succeed. In fact, sometimes Unbalanced Lines confer an advantage. Consider the <a href="https://www.youtube.com/watch?v=z1oX3DOgE00">Skarmory-Shiftry-Meganium</a> Line in GO Battle League popularized by <a href="https://twitter.com/CalebPeng">Caleb Peng</a>. These strategies are much more nuanced, but&mdash;to simplify it&mdash;against a standard RPS Line sometimes baiting out the Scissors can allow the second Paper to sweep in the back.</p>

		<h3>Embrace the Iteration</h3>
		<p>Team Building is an iterative process that requires practice and refinement. In scrimmage matches, you learn how your team navigates a surplus or deficit in energy or shields or if it relies more so on RPS. Building on this knowledge, you can address any coverage gaps and craft a competitive team that suits your playstyle.</p>
	</div>

	<a name="archetypes"></a>
	<h3 class="article-header">Line Archetypes (Teams of 3) </h3>
	<div class="article-section">
		<p>More relevant to GO Battle League but also applicable to Declare-6 formats, there are a few generalized approaches to building a Line: Trio Core, Duo Core+Pivot, or an Unbalanced. <b>Trio Core Lines</b> (e.g. ARA) are highly versatile as we&rsquo;ve already covered because they include multiple Duo Cores. Following a safe switch, your Duo Core in the back is balanced independent of your Lead choice. You can even rotate out the 3rd Pok&eacute;mon to support the next Line Archetype. **Duo Core+Pivot Lines** (e.g. Skarmory-Whiscash-Vigoroth popularized by <a href="https://twitter.com/gingerlykimber1">4TheBattles</a>) are another staple designed to leverage a meta Pivot and strong Duo Core to consistently overcome bad Leads. These Lines, however, can be less flexible with regard to the Lead and Pivot roles.</p>
		<p>These Lines, however, can be less flexible with regard to the Lead and Pivot roles. For example, Skarmory nicely covers Psychic/Fighter/Fairy leads&mdash;unlike a Whiscash lead would&mdash;to set up the Vigoroth Pivot while Vigoroth handles Grass and Fliers adequately for Whiscash in the back should Skarmory stay in the Lead matchup.</p>
		<p>Lastly, <b>Unbalanced Lines</b> (e.g. <a href="https://www.youtube.com/watch?v=z1oX3DOgE00">Skarmory-Shiftry-Meganium</a> popularized by <a href="https://twitter.com/CalebPeng">Caleb Peng</a> are also quite common as we&rsquo;ve highlighted above and appear in Declare-6 formats as well&mdash;recall Double Flier+Mud from Tempest Cup. These strategies require a thorough understanding of the metagame to develop and are often layered with nuance&mdash;contingent on the opposing Lead and Counter Switch to avoid being swept by a single threat if the Anchor (in this case Skarmory) is misaligned.</p>
	</div>

	<a name="nonsequential"></a>
	<h3 class="article-header">Nonsequential Team Building (Teams of 6)</h3>
	<div class="article-section">
		<h3>1. Build A Core</h3>
		<p>Start with a Pok&eacute;mon around which you would like to build a team. For Declare-6 formats, identify at least one, if not two, Pok&eacute;mon that provide complementary matchup coverage to your first selection. These Pok&eacute;mon can make up a Trio Core, but at the very least pick two Pok&eacute;mon that don&rsquo;t lose to the same meta threat. For example, when starting with Galarian Stunfisk I could add Tropius and Azumarill for a tight a Trio Core or instead choose Altaria and Cresselia, which both cover Ground and Fighting threats but Cresselia importantly has a solid Azumarill matchup. Ideally, you find Lines that are interchangeable as you build.</p>

		<h3>2. Build <i>de novo</i></h3>
		<p>Note what Pok&eacute;mon are suggested as good fits for the 3rd or 4th roster spot. However, instead of continuing to build sequentially from the original 2-3 Pok&eacute;mon, now start the process over. Pick one of the ideal 3rd or 4th Pok&eacute;mon and identify Pok&eacute;mon that provide complementary matchup coverage to form another strong Duo Core. This helps build in multiple strong Duo Cores, whereas Sequential Team Building might rely on the cumulative coverage of the initial 3-4 picks leaving the 4th or 5th pick without a suitable Core Partner. Ideally, you build in multiple Cores that don&rsquo;t share the same Core Breaker threats.</p>


		<h3>3. Repeat</h3>
		<p>Repeat Step 2 as needed, potentially multiple times by starting with the 2nd selection or the 5th or 6th recommendations.</p>

		<h3>4. Big Picture</h3>
		<p>Holistically evaluate your entire Team of 6 for any gaps in matchup or opposing Core coverage. Ensure you have at least 2 counters or checks to top meta threats and that they don&rsquo;t lose to many of the same roles (e.g. both of your Azumarill counters are walled by Fliers). This provides your opponent with more Core and Line options due to the poor synergy of your own team.</p>
	</div>

	<a name="final"></a>
	<h3 class="article-header">Final Thoughts</h3>
	<div class="article-section">
		<p>PvPoke's Team Builder is an exceptional tool for roster construction. Hopefully, we&rsquo;ve provided a better understanding of the benefits and pitfalls of the built-in metrics, in addition to some unique insights on how to utilize Team Builder to build balanced teams.</p>
	</div>

	<div class="share-link-container">
		<p>Share this article:</p>
		<div class="share-link">
			<input type="text" value="https://pvpoke.com/articles/strategy/ultimate-guide-to-team-building/" readonly />
			<div class="copy">Copy</div>
		</div>
	</div>
</div>
