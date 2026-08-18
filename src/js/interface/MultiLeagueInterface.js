// JavaScript Document

// Multi-League IV Checker
//
// The rest of the site answers "how good is this Pokemon?" one league at a time:
// pick a league, find the Pokemon, read the stats, change league, repeat. This
// page inverts that — pick one Pokemon and see every league at once, together
// with the rest of its evolution family, because the answer to "which league is
// this for?" is often "a different stage of it".
//
// None of the maths here is new. The best IV spread per league is Pokemon.js's
// own maximizeStat("overall"), the same call behind the Maximize button in the
// battle simulator, and the ratings come from the same overall ranking files the
// rankings page reads.

let InterfaceMaster = (function () {
	let instance;

	function createInstance() {

		let object = new interfaceObject();

		function interfaceObject(){

			let self = this;
			let gm = GameMaster.getInstance();

			// 51 is the highest cap PokeSelect considers. Anything above 40 is
			// flagged as XL, which is the practical difference between "I can
			// build this today" and "this needs a lot of candy".
			const LEVEL_CAP = 51;

			// Little Cup's ratings live under its own cup rather than "all",
			// which holds only 168 entries at 500 CP and omits Little Cup
			// staples like Meditite entirely.
			const leagues = [
				{ cp: 500, name: "Little Cup", cup: "little" },
				{ cp: 1500, name: "Great League", cup: "all" },
				{ cp: 2500, name: "Ultra League", cup: "all" },
				{ cp: 10000, name: "Master League", cup: "all" }
			];

			let rankings = {};        // league CP -> ranking array, already sorted by score
			let pendingLeague = null; // loadRankingData's callback doesn't say which league it answered

			let searchArr = [];       // the same Pokemon as the dropdown, in search priority order
			let searchTimeout;

			this.context = "multileague";

			this.init = function(){
				let $select = $(".multi-league-input .poke-select");

				$.each(gm.pokeSelectList, function(n, poke){
					if(poke.tags && poke.tags.indexOf("duplicate") > -1){
						return;
					}

					searchArr.push(poke);

					$select.append($("<option />").val(poke.speciesId).text(poke.displayName));
				});

				// Search priority order, so that a prefix shared by several
				// Pokemon lands on the one people mean: "ho" is Ho-Oh, not
				// Honchkrow.
				searchArr.sort((a, b) => b.priority - a.priority);

				$(".multi-league-input").on("change", ".poke-select", self.updateResults);
				$(".multi-league-input").on("keyup", ".poke-search", self.searchPokemon);
				$(".multi-league-input").on("keydown", ".poke-search", self.searchKeyDown);
				$(".multi-league-input").on("focus", ".poke-search", self.searchFocus);

				loadNextRankings();
			}

			// Typing in the search box jumps the dropdown to the first match,
			// the same behaviour and the same matching rules (name, dex number
			// or nickname prefix) as the Pokemon search on every other page.

			this.searchPokemon = function(e){
				// Arrow keys move through the dropdown instead of searching.
				if(e.which == 38 || e.which == 40){
					return;
				}

				// Restarting the timer on every key keeps the search off the
				// critical path while typing, which matters most on mobile.
				window.clearTimeout(searchTimeout);
				searchTimeout = window.setTimeout(submitSearchQuery, $(window).width() >= 768 ? 25 : 250);
			}

			this.searchKeyDown = function(e){
				if(e.which != 38 && e.which != 40){
					return;
				}

				e.preventDefault();

				let $selected = $(".multi-league-input .poke-select option:selected");
				let $option = (e.which == 38) ? $selected.prev() : $selected.next();

				if($option.length && ! $option.prop("disabled")){
					$option.prop("selected", "selected");
					$(".multi-league-input .poke-select").trigger("change");
				}
			}

			this.searchFocus = function(e){
				$(this).val("");

				// On mobile the keyboard covers the box it was opened from.
				if($(window).width() <= 768){
					$("html, body").animate({ scrollTop: $(this).offset().top - 65 }, 500);
				}
			}

			function submitSearchQuery(){
				let searchStr = $(".multi-league-input .poke-search").val().toLowerCase().trim();

				if(searchStr == ''){
					return;
				}

				let match = searchArr.find(poke => poke.speciesName.startsWith(searchStr)
					|| poke.dex == searchStr
					|| (poke.nicknames && poke.nicknames.some(nickname => nickname.startsWith(searchStr))));

				let $select = $(".multi-league-input .poke-select");

				if(! match || $select.val() == match.speciesId){
					return;
				}

				$select.val(match.speciesId).trigger("change");
			}

			// GameMaster caches each ranking file, but its callback is a single
			// method with no league argument, so the leagues are loaded one at a
			// time and pendingLeague records which one is in flight.

			function loadNextRankings(){
				let next = leagues.find(league => ! rankings[league.cp]);

				if(! next){
					self.updateResults();
					return;
				}

				pendingLeague = next.cp;
				gm.loadRankingData(self, "overall", next.cp, next.cup);
			}

			this.displayRankingData = function(data){
				rankings[pendingLeague] = data;
				loadNextRankings();
			}

			// The whole evolution family, in evolution order. getPokemonByFamily
			// returns dex order, which is wrong for families like Marill, whose
			// baby form (Azurill, #298) was introduced two generations after the
			// other two.

			function getFamily(speciesId){
				let poke = gm.getPokemonById(speciesId);

				if(! poke || ! poke.family){
					return poke ? [poke] : [];
				}

				let family = gm.getPokemonByFamily(poke.family.id);

				return family.sort((a, b) => evolutionStage(a) - evolutionStage(b));
			}

			// How many evolutions deep this Pokemon is, counted by walking up
			// parent links. The guard is for malformed family data rather than
			// anything in the real gamemaster.

			function evolutionStage(poke){
				let stage = 0;
				let current = poke;

				while(current && current.family && current.family.parent && stage < 5){
					current = gm.getPokemonById(current.family.parent);
					stage++;
				}

				return stage;
			}

			// The best this Pokemon can be in one league: the IV spread with the
			// highest stat product that still fits under the CP cap.

			function evaluate(poke, league){
				let battle = new Battle();
				battle.setCP(league.cp);

				let pokemon = new Pokemon(poke.speciesId, 0, battle);
				pokemon.initialize(true);
				pokemon.levelCap = LEVEL_CAP;
				pokemon.maximizeStat("overall");

				let ranking = rankings[league.cp] ?? [];
				let index = ranking.findIndex(entry => entry.speciesId == poke.speciesId);
				let entry = index > -1 ? ranking[index] : null;

				return {
					speciesId: poke.speciesId,
					speciesName: poke.speciesName,
					ivs: pokemon.ivs,
					cp: pokemon.cp,
					level: pokemon.level,

					// Whether the CP cap actually bound this Pokemon. If it
					// reached the level cap untouched, the cap never came into
					// play and "best IVs" is trivially 15/15/15 — true of Master
					// League always, and of Ultra for anything that tops out
					// below 2500.
					capped: pokemon.level < LEVEL_CAP,

					rank: entry ? index + 1 : null,
					score: entry ? entry.score : null,
					moveset: entry ? entry.moveset : null
				};
			}

			// One block per league, one row per family member.

			this.updateResults = function(){
				let speciesId = $(".multi-league-input .poke-select").val();

				if(! speciesId){
					return;
				}

				let family = getFamily(speciesId);
				let $tbody = $(".multi-league-results tbody");
				$tbody.html("");

				leagues.forEach(function(league){
					let results = family.map(poke => evaluate(poke, league));

					// Which stage to actually use in this league. Ranked species
					// only — an unranked one has no meaningful position to beat.
					let ranked = results.filter(result => result.rank);
					let best = ranked.length ? ranked.reduce((a, b) => (a.rank <= b.rank ? a : b)) : null;

					$tbody.append(buildLeagueRow(league));

					results.forEach(function(result){
						$tbody.append(buildResultRow(result, result === best));
					});
				});

				$(".multi-league-results-container").removeClass("hide");
			}

			function buildLeagueRow(league){
				let $row = $(".multi-league-results tr.league-template").first().clone().removeClass("league-template hide");

				$row.find(".league b").text(league.name);

				return $row;
			}

			function buildResultRow(result, isBest){
				let $row = $(".multi-league-results tr.result-template").first().clone().removeClass("result-template hide");

				$row.find(".name").text(result.speciesName);
				$row.find(".ivs").text(result.ivs.atk + "/" + result.ivs.def + "/" + result.ivs.hp);
				$row.find(".level").text(result.level + (result.level > 40 ? " (XL)" : ""));
				$row.find(".cp").text(result.cp);

				if(! result.capped){
					// Explains why the spread is a flat 15/15/15 here.
					$row.find(".ivs").append(" <span class='legacy'>(under cap)</span>");
				}

				if(result.rank){
					$row.find(".rank").text("#" + result.rank);
					$row.find(".score").text(result.score);
				} else{
					$row.find(".rank").text("unranked");
					$row.find(".score").text("—");
				}

				$row.find(".moveset").text(formatMoveset(result.moveset));

				if(isBest){
					$row.find(".name").append(" <b>&#9733;</b>");
				}

				return $row;
			}

			function formatMoveset(moveset){
				if(! moveset){
					return "—";
				}

				return moveset.map(function(moveId){
					let move = gm.getMoveById(moveId);
					return move ? move.name : moveId;
				}).join(", ");
			}
		}

		return object;
	}

	return {
		getInstance: function () {
			if (!instance) {
				instance = createInstance();
			}
			return instance;
		}
	};
})();
