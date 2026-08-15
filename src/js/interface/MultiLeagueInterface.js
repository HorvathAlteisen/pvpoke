// JavaScript Document

// Multi-League IV Checker
//
// The rest of the site answers "how good is this Pokemon?" one league at a time:
// pick a league, find the Pokemon, read the stats, change league, repeat. This
// page inverts that — one Pokemon and one IV spread, every league at once, which
// is the order the question actually arrives in after you catch something.
//
// None of the maths here is new. The per-league IV evaluation is the same
// routine behind PokeSelect's "PvP IV Rankings" modal (autoLevel down to the CP
// cap, then getIVRank), and the species ratings come from the same overall
// ranking files the rankings page reads.

let InterfaceMaster = (function () {
	let instance;

	function createInstance() {

		let object = new interfaceObject();

		function interfaceObject(){

			let self = this;
			let gm = GameMaster.getInstance();

			// 51 is the highest cap PokeSelect considers. Any result needing a
			// level above 40 is flagged as XL in the table, since that's the
			// practical difference between "I have this" and "I need candy".
			const LEVEL_CAP = 51;

			const leagues = [
				{ cp: 500, name: "Little Cup" },
				{ cp: 1500, name: "Great League" },
				{ cp: 2500, name: "Ultra League" },
				{ cp: 10000, name: "Master League" }
			];

			let rankings = {};        // league CP -> ranking array, already sorted by score
			let pendingLeague = null; // loadRankingData's callback doesn't say which league it answered

			this.context = "multileague";

			this.init = function(){
				let $select = $(".multi-league-input .poke-select");

				$.each(gm.pokeSelectList, function(n, poke){
					if(poke.tags && poke.tags.indexOf("duplicate") > -1){
						return;
					}

					$select.append($("<option />").val(poke.speciesId).text(poke.speciesName));
				});

				$(".multi-league-input").on("change", ".poke-select, .iv", self.updateResults);

				loadNextRankings();
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
				gm.loadRankingData(self, "overall", next.cp, "all");
			}

			this.displayRankingData = function(data){
				rankings[pendingLeague] = data;
				loadNextRankings();
			}

			// Evaluate one IV spread in one league. autoLevel walks the level
			// down from the cap until the Pokemon fits under the league's CP
			// limit, which is what makes low IVs competitive in capped leagues.

			function evaluate(speciesId, ivs, league){
				let battle = new Battle();
				battle.setCP(league.cp);

				let pokemon = new Pokemon(speciesId, 0, battle);
				pokemon.initialize(true);
				pokemon.levelCap = LEVEL_CAP;
				pokemon.autoLevel = true;
				pokemon.setIV("atk", ivs.atk);
				pokemon.setIV("def", ivs.def);
				pokemon.setIV("hp", ivs.hp);

				let ivRank = pokemon.getIVRank("overall");
				let ranking = rankings[league.cp] ?? [];
				let index = ranking.findIndex(entry => entry.speciesId == speciesId);
				let entry = index > -1 ? ranking[index] : null;

				return {
					league: league,
					cp: pokemon.cp,
					level: pokemon.level,
					ivRank: ivRank.rank,
					ivCount: ivRank.count,

					// Whether the CP cap actually bound this Pokemon. If it
					// reached the level cap untouched, the league's limit never
					// came into play and IV rank degenerates into "higher stats
					// are better" — true of Master League always, and of Ultra
					// for something like Azumarill that tops out around 1800.
					capped: pokemon.level < LEVEL_CAP,
					speciesRank: entry ? index + 1 : null,
					score: entry ? entry.score : null,
					moveset: entry ? entry.moveset : null
				};
			}

			// Render one row per league.

			this.updateResults = function(){
				let speciesId = $(".multi-league-input .poke-select").val();

				if(! speciesId){
					return;
				}

				let ivs = {
					atk: readIV("atk"),
					def: readIV("def"),
					hp: readIV("hp")
				};

				let results = leagues.map(league => evaluate(speciesId, ivs, league));

				// "Best fit" needs both halves to hold. The league's CP cap has to
				// have actually bound this Pokemon, or IV rank collapses to
				// "higher stats are better" and #1 says nothing; and the species
				// has to be ranked there at all, or we'd star Azumarill's Little
				// Cup row for a league it can't even enter.
				let candidates = results.filter(result => result.capped && result.speciesRank);
				let best = candidates.length ? candidates.reduce((a, b) => (a.ivRank <= b.ivRank ? a : b)) : null;

				let $tbody = $(".multi-league-results tbody");
				$tbody.html("");

				results.forEach(function(result){
					let $row = $(".multi-league-results tr.template").first().clone().removeClass("template hide");

					$row.find(".league").text(result.league.name);
					$row.find(".cp").text(result.cp);
					$row.find(".level").text(result.level + (result.level > 40 ? " (XL)" : ""));

					if(result.capped){
						$row.find(".iv-rank-cell").text("#" + result.ivRank + " of " + result.ivCount);
					} else{
						// Ranking 4096 combinations by stat product says nothing
						// useful when nothing is capping them.
						$row.find(".iv-rank-cell").text("— not CP capped");
					}

					if(result.speciesRank){
						$row.find(".species-rank").text("#" + result.speciesRank);
						$row.find(".score").text(result.score);
					} else{
						$row.find(".species-rank").text("unranked");
						$row.find(".score").text("—");
					}

					$row.find(".moveset").text(formatMoveset(result.moveset));

					if(result === best){
						$row.addClass("best-fit");
						$row.find(".league").append(" <b>&#9733; best IV fit</b>");
					}

					$tbody.append($row);
				});

				$(".multi-league-results-container").removeClass("hide");
			}

			// IV inputs are free text; clamp rather than trusting them.

			function readIV(stat){
				let value = parseInt($(".multi-league-input .iv[iv='" + stat + "']").val());

				if(isNaN(value)){
					value = 0;
				}

				return Math.max(0, Math.min(15, value));
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
