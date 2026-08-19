<script lang="ts">
	/**
	 * footer.php: ad placeholders, developer panel (dev only), <footer>, and the global
	 * inline script (menu, share-link, toggles, service worker, number-input wheel) followed
	 * by the one-time custom-group cookie → localStorage migration. The closing of
	 * `#main` / `.main-wrap` lives in routes/(main)/+layout.svelte.
	 *
	 * The global script is emitted with {@html} because the migration part interpolates the
	 * raw `custom_group_*` cookie values (`jsonToMigrate.push(<cookie json>);`) exactly as
	 * PHP did.
	 */
	import { page } from '$app/state';
	import AdSlot from '$lib/components/ads/AdSlot.svelte';
	import DeveloperPanel from './DeveloperPanel.svelte';

	const { webRoot, siteVersion, dev, performGroupMigration, cookieGroupsToMigrate } = $derived(
		page.data
	);

	const migrationScript = $derived(
		performGroupMigration
			? `
			// One-time custom group migration from cookies to localstorage

			var jsonToMigrate = [];

			${cookieGroupsToMigrate.map((value) => `jsonToMigrate.push(${value});`).join('')}

			// Migrate custom groups to local storage

			for(var i = 0; i < jsonToMigrate.length; i++){
				window.localStorage.setItem(jsonToMigrate[i].name, jsonToMigrate[i].data);
			}

		`
			: ''
	);

	const globalScript = $derived(`<!--Global script-->
	<script>
		var menuSlideProtection = false;

		$(".hamburger.mobile").click(function(e){
			$("header .menu").slideToggle(125);

			menuSlideProtection = true;
			setTimeout(function(){
				menuSlideProtection = false;
			}, 125);
		});

		// Submenu interaction on desktop and mobile
		$(".menu .parent-menu").on("mouseenter click", function(e){

			if(screen.width >= 721){
				$(".submenu").removeClass("active");
				$(this).find(".submenu").addClass("active");

				/*// Open the submenu on a slight delay so menus don't pop open on collateral mouseovers
				var $targetParentMenu = $(this).get(0);''

				setTimeout(function(){
					if($(".parent-menu:hover").get(0) == $targetParentMenu){
						$(".submenu").removeClass("active");
						$(".parent-menu:hover").find(".submenu").addClass("active");
					}
				}, 125);*/
			}
		});

		$(".menu .parent-menu > a").on("click", function(e){
			if($(e.target).is("span") && screen.width < 721){
				e.preventDefault();
				$(this).toggleClass("active");
				$(this).next(".submenu").toggleClass("active");
			}
		});

		$("body").on("mousemove click", function(e){
			if($(".submenu:hover, .parent-menu:hover").length == 0){
				$(".submenu").removeClass("active");
			}

			if(screen.width <= 720 && ! menuSlideProtection){
				if($("header .menu:hover, .hamburger.mobile:hover").length == 0 && $("header .menu").css("display") == "block"){
					$("header .menu").slideToggle(125);

					menuSlideProtection = true;
					setTimeout(function(){
						menuSlideProtection = false;
					}, 125);
				}
			}
		});

		$("header .latest-section a").click(function(e){
			$("header .menu").slideToggle(125);
		});

		// Auto select link

		$(".share-link input").click(function(e){
			this.setSelectionRange(0, this.value.length);
		});

		// Link share copying

		$("body").on("click", ".share-link .copy", function(e){
			var el = $(e.target).prev()[0];
			el.focus();
			el.setSelectionRange(0, el.value.length);
			document.execCommand("copy");
		});

		// Toggleable sections

		$("body").on("click", ".toggle", function(e){
			e.preventDefault();

			$(e.target).closest(".toggle").toggleClass("active");
		});

		// Service worker handler
		if ('serviceWorker' in navigator) {
			console.log("Attempting to register service worker");
			navigator.serviceWorker.register('service-worker.js')
			  .then(function(reg){
				console.log("Service worker registered.");
			  }).catch(function(err) {
				console.log("Service worker failed to register:", err)
			  });
		}

		// disable mousewheel on a input number field when in focus
		// (to prevent Chromium browsers change the value when scrolling)
		$('body').on('focus', 'input[type=number]', function (e) {
		$(this).on('wheel.disableScroll', function (e) {
			e.preventDefault()
		})
		})
		$('body').on('blur', 'input[type=number]', function (e) {
		$(this).off('wheel.disableScroll')
		})
${migrationScript}
	<\/script>`);
</script>

	<AdSlot name="nitro-sidebar-left" />
	<AdSlot name="nitro-sidebar-left-300" />
	<AdSlot name="nitro-sidebar-right" />
	<AdSlot name="nitro-sidebar-right-300" />
	<AdSlot name="nitro-desktop-anchor" />
	<AdSlot name="mobile-320" />

	{#if dev}
		<DeveloperPanel />
	{/if}

	<footer>
		<p class="copyright">Version <a href="https://github.com/pvpoke/pvpoke/releases">{siteVersion}</a> &copy; 2025 PvPoke LLC, released under the <a href="https://opensource.org/licenses/MIT" target="_blank">MIT license</a> | <a href="{webRoot}privacy/">Privacy Policy</a></p>
		<p>Logo and brand colors by <a class="domz-link" href="https://pogodomz.bio.link/" target="_blank">pogoDomz</a></p>
		<p>Pokémon and Pokémon GO are copyright of The Pokémon Company, Niantic, Inc., and Nintendo. All trademarked images and names are property of their respective owners, and any such material is used on this site for educational purposes only. PvPoke LLC has no affiliation with The Pokémon Company, Niantic, Inc., or Nintendo.</p>
	</footer>

	{@html globalScript}
