// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Settings } from '$lib/settings';
import type { PageMeta, PvpokeLayoutData } from '$lib/site';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** header.php `$_SETTINGS`, parsed once per request in hooks.server.ts */
			settings: Settings;
			/** header.php `$performGroupMigration` (true when the `migrate` cookie was absent) */
			performGroupMigration: boolean;
		}
		/**
		 * `page.data` everywhere: the root layout data plus the optional `meta` a page's
		 * `+page.server.ts` returns (header.php's $META_TITLE / $META_DESCRIPTION / $CANONICAL / $OG_IMAGE).
		 */
		interface PageData extends PvpokeLayoutData {
			meta?: PageMeta;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

// Legacy presentational attributes the PHP markup uses (kept verbatim for fidelity) that
// svelte-check does not know about.
declare module 'svelte/elements' {
	interface HTMLAttributes<T> {
		valign?: string | undefined | null;
		align?: string | undefined | null;
		/** `<a name="news">` anchors */
		name?: string | undefined | null;
		/** `<div class="mega-item" mega="venusaur">` on community-day articles */
		mega?: string | undefined | null;
		/** `<option direction="1">` sort-order hints in checklist-template.php */
		direction?: string | undefined | null;
		/** `<option cp="1500">` league CP values in checklist-template.php */
		cp?: string | undefined | null;
		/** `<ul type="disc">` legacy list-style hints in several articles */
		type?: string | undefined | null;
	}
}

// Custom attributes the legacy markup uses as JS hooks (read by the untouched jQuery code).
// Typing only — they are rendered verbatim.
declare module 'svelte/elements' {
	interface HTMLAttributes<T> {
		/** `<a data="single">` mode/category switches (battle.php, rankingdetails.php) */
		data?: string | undefined | null;
		/** `<a shields="0,0">` in the battle matchup grid */
		shields?: string | undefined | null;
		/** `<a tab="moves">` / `<div tab="moves">` in rankingdetails.php */
		tab?: string | undefined | null;
		/** `<input context="ranking-search">` / `<a context="pokeselect">` search scopes */
		context?: string | undefined | null;
		/** `<input iv="atk">` IV and stat-modifier fields */
		iv?: string | undefined | null;
		/** `<div class="check" value="overall">` / `<div class="option" value="1">` toggles */
		value?: any;
	}
	interface HTMLOptionAttributes {
		/** league/format metadata on the cup, format and league selects */
		cup?: string | undefined | null;
		'level-cap'?: string | undefined | null;
		'meta-group'?: string | undefined | null;
		'meta-group500'?: string | undefined | null;
		'meta-group1500'?: string | undefined | null;
		'meta-group2500'?: string | undefined | null;
		'meta-group10000'?: string | undefined | null;
		/** `<option type="great">` in the quick-fill select */
		type?: string | undefined | null;
	}
	interface HTMLTextareaAttributes {
		/** legacy `<textarea type="text">` in pokemultiselect.php */
		type?: string | undefined | null;
	}
}

// Custom attributes used by the rankings / team-builder / custom-rankings / CMP-chart pages.
declare module 'svelte/elements' {
	interface HTMLAttributes<T> {
		/** `<div class="notes"><div grade="A">` in team-builder.php's overview sections */
		grade?: string | undefined | null;
		/** `<div class="filters" list-index="0">` / `<button class="add-filter" list-index="0">` (custom-rankings.php) */
		'list-index'?: string | undefined | null;
		/** `<select class="subject-shield-select" index="0">` / `<input class="subject-turns" index="0">` (custom-rankings.php) */
		index?: string | undefined | null;
	}
	interface HTMLInputAttributes {
		/** `<input class="poke-search" target="cmp-chart">` (attack-cmp-chart.php, train/analysis.php, gm-editor/edit.php) */
		target?: string | undefined | null;
	}
	interface HTMLOptionAttributes {
		/** `<option value="overall" scenario="leads" sort="score">` in rankings.php's category select */
		scenario?: string | undefined | null;
		sort?: string | undefined | null;
	}
}

// Custom attributes used by the gm-editor pages and the developer tools.
declare module 'svelte/elements' {
	interface HTMLAttributes<T> {
		/**
		 * `<a id="save-btn" … disabled>` / `<div id="save-changes-btn" class="button" disabled>` —
		 * the gm-editor markup puts the presentational `disabled` attribute on anchors and divs.
		 */
		disabled?: boolean | undefined | null;
	}
}

// Custom attributes used by the training pages (train/analysis.php, train/editor.php).
declare module 'svelte/elements' {
	interface HTMLAttributes<T> {
		/** `<div class="multi-selector" mode="new">` in train/editor.php */
		mode?: string | undefined | null;
	}
	interface HTMLCanvasAttributes {
		/** `<canvas canvas-id="0" class="usage-chart">` in the usage modal of train/analysis.php */
		'canvas-id'?: string | undefined | null;
	}
}
