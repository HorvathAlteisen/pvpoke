<script lang="ts">
	/**
	 * The inline globals script from header.php (`host`, `webRoot`, `siteVersion`,
	 * `settings`, `get`). Built as a string and emitted with {@html} because `{}` is not
	 * interpolated inside a nested <script> in Svelte markup. Formatting follows PHP exactly:
	 * booleans as true/false where PHP used the ternary, intval() for the numeric fields,
	 * htmlspecialchars() for the strings, json_encode() for `get`.
	 */
	import { page } from '$app/state';
	import { htmlspecialchars, phpIntval, phpJsonEncode, phpTruthy } from '$lib/php';

	const { host, webRoot, siteVersion, settings, get } = $derived(page.data);

	const settingsScript = $derived(
		settings.fromCookie
			? `		var settings = {
			defaultIVs: "${htmlspecialchars(settings.defaultIVs)}",
			animateTimeline: ${phpTruthy(settings.animateTimeline) ? 'true' : 'false'},
			matrixDirection: "row",
			gamemaster: "${htmlspecialchars(settings.gamemaster)}",
			pokeboxId: "${phpIntval(settings.pokeboxId)}",
			pokeboxLastDateTime: "${phpIntval(settings.pokeboxLastDateTime)}",
			xls: ${phpTruthy(settings.xls) ? 'true' : 'false'},
			rankingDetails: "${htmlspecialchars(settings.rankingDetails)}",
			hardMovesetLinks: ${phpIntval(settings.hardMovesetLinks)},
			colorblindMode: ${phpIntval(settings.colorblindMode)},
			performanceMode: ${phpIntval(settings.performanceMode)},
			theme: "${htmlspecialchars(settings.theme)}"
		};
	`
			: `
		var settings = {
			defaultIVs: "gamemaster",
			animateTimeline: 1,
			matrixDirection: "row",
			gamemaster: "gamemaster",
			pokeboxId: 0,
			pokeboxLastDateTime: 0,
			xls: true,
			rankingDetails: "one-page",
			hardMovesetLinks: 0,
			colorblindMode: 0,
			performanceMode: 0,
			theme: "default"
		};

	`
	);

	const getScript = $derived(get ? 'var get = ' + phpJsonEncode(get) + ';' : 'var get = false;');

	const script = $derived(`<script>
	// Host for link reference

	var host = "${host}";
	var webRoot = "${webRoot}";
	var siteVersion = "${siteVersion}";

	${settingsScript}
	// If $_GET request exists, output as JSON into Javascript

	${getScript}
<\/script>`);
</script>

{@html script}
