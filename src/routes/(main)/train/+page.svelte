<script lang="ts">
	/** train/index.php */
	import { page } from '$app/state';
	import AdSlot from '$lib/components/ads/AdSlot.svelte';
	import Scripts from '$lib/components/layout/Scripts.svelte';
	import BattleScripts from '$lib/components/scripts/BattleScripts.svelte';
	import TrainScripts from '$lib/components/scripts/TrainScripts.svelte';
	import PokeSelect from '$lib/components/modules/PokeSelect.svelte';
	import PokeMultiSelect from '$lib/components/modules/PokeMultiSelect.svelte';
	import Top from '$lib/components/train/Top.svelte';
	import Scene from '$lib/components/train/Scene.svelte';
	import Controls from '$lib/components/train/Controls.svelte';
	import EndScreen from '$lib/components/train/EndScreen.svelte';

	const { webRoot, siteVersion } = $derived(page.data);
</script>

<h1>Training Battle</h1>
<div class="section white">
	<div class="ranking-categories mode-select">
		<a class="selected" href="{webRoot}train/">Train</a>
		<a href="{webRoot}train/analysis/">Top Performers</a>
	</div>
	<div class="clear"></div>
	<p class="description">Select your team and options below to battle in a real-time simulation against a CPU opponent.</p>
	<p>This tool is a training and learning resource intended to supplement your in-game battles. Experiment with new lineups or practice in a pressure free environment against a difficulty of your choice!</p>
</div>

<div class="hide">
	<PokeSelect />
</div>

<div class="section poke-select-container train">
	<div class="poke">
		<h3>Your Team</h3>
		<PokeMultiSelect />
		<a class="random" href="#">Random</a>
	</div>

	<div class="poke ai-options">
		<h3>Settings</h3>
		<div class="poke-stats">
			<select class="mode-select">
				<option value="single">Single (3v3)</option>
				<option value="tournament">Tournament (6v6)</option>
			</select>
			<h3 class="section-title">League &amp; Cup</h3>
			<select class="league-cup-select">
				<option value="" selected disabled>Select a league</option>
				<option value="1500 gobattleleague">GO Battle League (Great)</option>
				<option value="2500 gobattleleague">GO Battle League (Ultra)</option>
				<option value="10000 gobattleleague">GO Battle League (Master)</option>
				<option value="1500 all">Great League</option>
				<option value="2500 all">Ultra League</option>
				<option value="10000 all">Master League</option>
			</select>
			<h3 class="section-title">Difficulty</h3>
			<select class="difficulty-select">
				<option value="0">Novice</option>
				<option value="1">Rival</option>
				<option value="2">Elite</option>
				<option value="3" selected>Champion</option>
			</select>
			<div class="check autotap-toggle"><span></span>Autotap</div>
			<h3 class="section-title">Team Selection</h3>
			<select class="team-method-select">
				<option value="random">Random</option>
				<option value="manual">Manual</option>
				<option value="custom">Import</option>
			</select>
			<PokeMultiSelect cupSelect={false} />
			<div class="custom-team-section">
				<h3 class="section-title">Import Teams</h3>
				<p>Select a custom team pool built in the <a href="{webRoot}train/editor/" class="inline-link" target="_blank">Training Team Editor</a>, or paste a code from the editor or <a href="https://gobattlelog.com" class="inline-link" target="_blank">GoBattleLog.com</a>.</p>
				<select class="team-fill-select">
					<option disabled selected value="">Select a team pool</option>
				</select>
				<textarea class="team-import" placeholder="Paste team pool code"></textarea>
				<div class="custom-team-validation true">Looks good! Teams successfully imported.</div>
				<div class="custom-team-validation false">The code you entered may not be correct. Double check the source.</div>
			</div>
			<div class="featured-team-section">
				<h3 class="section-title">Featured Teams</h3>
				<p>Play against teams from your favorite content creators and top players.</p>
				<select class="featured-team-select">
					<option disabled selected value="">Select a team</option>
				</select>
				<div class="featured-team-description">
					<a target="_blank" href="#">
						<img>
						<h3></h3>
					</a>
					<p></p>
					<h5>Team Preview</h5>
					<div class="featured-team-preview">
					</div>
				</div>
			</div>
			<a href="{webRoot}train/editor/" class="inline-link train-editor-link" target="_blank">Training Team Editor</a>
		</div>
	</div>
</div>

<div class="section">
	<button class="battle-btn button">
		<span class="btn-content-wrap">
			<span class="btn-icon btn-icon-train"></span>
			<span class="btn-label">Train</span>
		</span>
	</button>
</div>

<div class="section team-select">
	<a class="return-to-setup" href="#">&larr; Team Select &amp; Setup</a>
	<div class="opponent">
		<h3 class="center">Opponent's Roster</h3>
		<div class="featured-team-description">
			<a target="_blank" href="#">
				<img>
				<h3></h3>
			</a>
		</div>
		<div class="roster pokemon-container"></div>
	</div>
	<h3 class="center">vs.</h3>
	<div class="self">
		<h3 class="center">Your Roster</h3>
		<div class="roster pokemon-container"></div>
		<p class="center">Select and order your team of 3 for battle!</p>
		<h4 class="center">Current Round: <span class="round-record"></span></h4>
	</div>
	<button class="lets-go-btn button">Let's Go!</button>
</div>

<div class="section battle">
	<div class="battle-window">
		<img class="img-block" src="{webRoot}img/train/battle-window-block.png" />
		<Top />
		<Scene />
		<Controls />

		<div class="countdown">
			<div class="text"></div>
		</div>

		<div class="animate-message">
			<div class="text"></div>
		</div>

		<EndScreen />
	</div>
</div>

<AdSlot name="body-728" />

<BattleScripts />
<TrainScripts />

<Scripts>
<script src="{webRoot}js/GameMaster.js?v={siteVersion}"></script>
<script src="{webRoot}js/pokemon/Pokemon.js?v={siteVersion}"></script>
<script src="{webRoot}js/pokemon/Player.js?v={siteVersion}"></script>

<script src="{webRoot}js/interface/PokeSearch.js?v={siteVersion}"></script>
<script src="{webRoot}js/interface/PokeSelect.js?v={siteVersion}"></script>
<script src="{webRoot}js/interface/PokeMultiSelect.js?={siteVersion}"></script>
<script src="{webRoot}js/interface/Pokebox.js?={siteVersion}"></script>
<script src="{webRoot}js/interface/ModalWindow.js?v={siteVersion}"></script>
<script src="{webRoot}js/battle/rankers/TeamRanker.js?v={siteVersion}"></script>
<script src="{webRoot}js/training/MatchHandler.js?v={siteVersion}"></script>
</Scripts>
