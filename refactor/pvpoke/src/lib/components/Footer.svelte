<script lang="ts">
	import { WEB_ROOT /*, SETTINGS, PERFORM_GROUP_MIGRATION, CUSTOM_GROUPS*/ } from '$lib/config';
	/*import NitroSidebarLeft from './modules/ads/nitro-sidebar-left.svelte';
	import NitroSidebarLeft300 from './modules/ads/nitro-sidebar-left-300.svelte';
	import NitroSidebarRight from './modules/ads/nitro-sidebar-right.svelte';
	import NitroSidebarRight300 from './modules/ads/nitro-sidebar-right-300.svelte';
	import Mobile320 from './modules/ads/mobile-320.svelte';
	import DeveloperPanel from './modules/developer-panel.svelte';*/

	import { onMount } from 'svelte';

	let { version } = $props();

	let showDeveloperPanel = WEB_ROOT.includes('src');

	onMount(() => {
		// The following code is directly copied from the original script.
		// It uses jQuery and DOM operations which may require that jQuery is globally available.
		// In a SvelteKit environment, you might consider rewriting these interactions using Svelte or pure JS.

		// If using jQuery, ensure it's loaded before this script runs.

		//let menuSlideProtection = false;

		/*if (typeof window !== 'undefined' && window.$) {
			const $ = window.$;



			$('.menu .parent-menu').on('mouseenter click', function (e) {
				if (screen.width >= 721) {
					$('.submenu').removeClass('active');
					$(this).find('.submenu').addClass('active');
				}
			});

			$('.menu .parent-menu > a').on('click', function (e) {
				if ($(e.target).is('span') && screen.width < 721) {
					e.preventDefault();
					$(this).next('.submenu').toggleClass('active');
				}
			});

			$('body').on('mousemove click', function (e) {
				if ($('.submenu:hover, .parent-menu:hover').length == 0) {
					$('.submenu').removeClass('active');
				}

				if (screen.width <= 720 && !menuSlideProtection) {
					if (
						$('header .menu:hover, .hamburger.mobile:hover').length == 0 &&
						$('header .menu').css('display') == 'block'
					) {
						$('header .menu').slideToggle(125);

						menuSlideProtection = true;
						setTimeout(function () {
							menuSlideProtection = false;
						}, 125);
					}
				}
			});

			$('header .latest-section a').click(function (e) {
				$('header .menu').slideToggle(125);
			});

			$('.share-link input').click(function (e) {
				this.setSelectionRange(0, this.value.length);
			});

			$('body').on('click', '.share-link .copy', function (e) {
				var el = $(e.target).prev()[0];
				el.focus();
				el.setSelectionRange(0, el.value.length);
				document.execCommand('copy');
			});

			$('body').on('click', '.toggle', function (e) {
				e.preventDefault();
				$(e.target).closest('.toggle').toggleClass('active');
			});

			/**
			 * TODO: Deal with that later
			if ('serviceWorker' in navigator) {
				console.log("Attempting to register service worker");
				navigator.serviceWorker.register('service-worker.js')
				.then(function(reg){
					console.log("Service worker registered.");
				}).catch(function(err) {
					console.log("Service worker failed to register:", err)
				});
			}

			// Migration logic
			if (PERFORM_GROUP_MIGRATION && CUSTOM_GROUPS && CUSTOM_GROUPS.length > 0) {
				var jsonToMigrate = [];

				// Push all custom groups into jsonToMigrate
				for(let i = 0; i < CUSTOM_GROUPS.length; i++){
					jsonToMigrate.push(CUSTOM_GROUPS[i]);
				}

				// Migrate custom groups to local storage
				for(var i = 0; i < jsonToMigrate.length; i++){
					window.localStorage.setItem(jsonToMigrate[i].name, jsonToMigrate[i].data);
				}
			}
			
		}*/
	});
</script>

<!--<NitroSidebarLeft />
<NitroSidebarLeft300 />
<NitroSidebarRight />
<NitroSidebarRight300 />
<Mobile320 />-->

<!--{#if showDeveloperPanel}
	<DeveloperPanel />
{/if}-->

<footer>
	<p class="copyright">
		Version <a href="https://github.com/pvpoke/pvpoke/releases">{version}</a> &copy; 2023 PvPoke
		LLC, released under the
		<a href="https://opensource.org/licenses/MIT" target="_blank">MIT license</a>
		| <a href={WEB_ROOT + 'privacy/'}>Privacy Policy</a>
	</p>
	<p>
		Logo and brand colors by <a class="domz-link" href="https://pogodomz.bio.link/" target="_blank"
			>pogoDomz</a
		>
	</p>
	<p>
		Pokémon and Pokémon GO are copyright of The Pokémon Company, Niantic, Inc., and Nintendo. All
		trademarked images and names are property of their respective owners, and any such material is
		used on this site for educational purposes only. PvPoke LLC has no affiliation with The Pokémon
		Company, Niantic, Inc., or Nintendo.
	</p>
</footer>
