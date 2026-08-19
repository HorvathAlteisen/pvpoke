<script lang="ts">
	/** gm-editor/edit.php */
	import { page } from '$app/state';
	import Scripts from '$lib/components/layout/Scripts.svelte';
	import BattleScripts from '$lib/components/scripts/BattleScripts.svelte';
	import SearchStringHelp from '$lib/components/modules/SearchStringHelp.svelte';
	import SearchStringHelpMoves from '$lib/components/modules/SearchStringHelpMoves.svelte';

	let { data } = $props();

	const { webRoot, siteVersion } = $derived(page.data);
	const { hasCategory, category, body, placeholder, exportTitle, newButtonText } = $derived(data);
	// $NEW_BUTTON_LINK is only assigned for the two known categories (undefined → '' in PHP).
	const newButtonLink = $derived(category ? `${webRoot}gm-editor/${category}/new/` : '');
</script>

<h1>Gamemaster Editor [Beta]</h1>

<div class="section white" id="gm-editor-pokemon">
    <div class="flex space-between align-items-start">
        <a class="gm-title" href="{webRoot}gm-editor"></a>
        <div class="ranking-categories mode-select">
            <a class={category == 'pokemon' ? 'selected' : undefined} href="{webRoot}gm-editor/pokemon/">Pokemon</a>
            <a class={category == 'moves' ? 'selected' : undefined} href="{webRoot}gm-editor/moves/">Moves</a>
        </div>
    </div>

    {#if hasCategory}
        <!--All Pokemon table-->
        <p class="mt-1">{body}</p>

        <div class="poke-search-container">
            <input class="poke-search" target="train-table" type="text" placeholder={placeholder} />
            <a href="#" class="search-info">i</a>

            <!--<div class="form-group" data="search-mode">
                <div class="option on" value="filter">Filter</div>
                <div class="option" value="find">Find</div>
            </div>-->

            <a class="link-btn" href={newButtonLink}>{newButtonText}</a>
        </div>

        <div class="table-container">
            <table class="train-table" cellspacing="0">

                {#if category == 'pokemon'}
                    <thead>
                        <tr>
                            <th><a class="selected" href="#" data="dex">Dex</a></th>
                            <th><a href="#" data="name">Pokemon</a></th>
                            <th style="min-width: 100px;"></th>
                            <th>Fast Moves</th>
                            <th>Charged Moves</th>
                            <th>Tags</th>
                            <th><a href="#" data="priority">Search<br>Priority</a></th>
                            <th><a href="#" data="released">Released</a></th>
                        </tr>
                        <!--Row html to clone-->
                        <tr class="hide">
                            <td data="dex"></td>
                            <td data="name"></td>
                            <td class="controls">
                                <a class="poke-edit" href="#">Edit</a>
                                <a class="poke-copy" href="#">Copy</a>
                                <a class="poke-delete" href="#">Delete</a>
                            </td>
                            <td data="fast"></td>
                            <td data="charged"></td>
                            <td data="tags"></td>
                            <td data="priority"></td>
                            <td data="released"></td>
                        </tr>
                    </thead>
                {:else if category == 'moves'}
                    <thead>
                        <tr>
                            <th><a class="selected" href="#" data="name">Move</a></th>
                            <th style="min-width: 100px;"></th>
                            <th><a href="#" data="type">Type</a></th>
                            <th><a href="#" data="power">Power</a></th>
                            <th><a href="#" data="energy">Energy</a></th>
                            <th><a href="#" data="turns">Turns</a></th>
                            <th>Effect</th>
                        </tr>
                        <!--Row html to clone-->
                        <tr class="hide">
                            <td data="name"></td>
                            <td class="controls">
                                <a class="poke-edit" href="#" target="_blank">Edit</a>
                                <a class="poke-copy" href="#">Copy</a>
                                <a class="poke-delete" href="#">Delete</a>
                            </td>
                            <td data="type"></td>
                            <td data="power"></td>
                            <td data="energy"></td>
                            <td data="turns"></td>
                            <td data="effect"></td>
                        </tr>
                    </thead>
                {/if}
                <tbody>
                </tbody>
            </table>
        </div>

        <div class="flex">
            <div id="save-changes-btn" class="button" style="margin-top:25px;" disabled>Save Changes</div>
        </div>
    {/if}
</div>

<div class="section white custom-rankings-import">
	<h3>{exportTitle}</h3>

	<p>Copy the text below to export all entries from your custom gamemaster or paste to overwrite them. Only copy and paste code from a trusted source.</p>

	<textarea class="import"></textarea>
	<div class="copy">Copy</div>
</div>

<div class="delete-poke-confirm hide">
	<p>Delete the entry for <b><span class="name"></span></b>? It will no longer be available for simulations with this custom gamemaster.</p>

	<div class="center flex">
		<div class="button yes">Yes</div>
		<div class="button no">No</div>
	</div>
</div>

<div class="import-error hide">
	<p>There was an error importing the custom data. Ensure that the data is not malformed and contains valid Pokemon or move data.</p>
</div>

<div class="save-data hide">
	<p>Data saved successfully.</p>
</div>

<div class="save-data-error hide">
	<p>There was an error saving the data. Ensure that all entries are valid.</p>
</div>

<div class="refresh-prompt hide">
	<p>Data was changed in a different window. <a href="#"><b>Refresh the page</b></a> to prevent your data from being overwritten.</p>
</div>

{#if category == 'pokemon'}
	<SearchStringHelp />
{:else if category == 'moves'}
	<SearchStringHelpMoves />
{/if}


<BattleScripts />

<Scripts>

<script src="{webRoot}js/GameMaster.js?v={siteVersion}"></script>
<script src="{webRoot}js/pokemon/Pokemon.js?v={siteVersion}"></script>
<script src="{webRoot}js/interface/PokeSearch.js?v={siteVersion}"></script>
<script src="{webRoot}js/interface/ModalWindow.js?v={siteVersion}"></script>
<script src="{webRoot}js/devtools/gm-editor/GMEditorUtils.js?v={siteVersion}"></script>
<script src="{webRoot}js/devtools/gm-editor/GMEditorTableInterface.js?v={siteVersion}"></script>
<script src="{webRoot}js/Main.js?v={siteVersion}"></script>
</Scripts>
