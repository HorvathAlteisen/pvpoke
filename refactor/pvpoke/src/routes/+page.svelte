<script lang="ts">
    import * as config from '$lib/config';
    import { dev } from '$app/environment';
    export let SITE_VERSION: string;
</script>

<p class="small">
    Welcome to PvPoke.com, an open-source tool for Pokemon GO PvP and GO Battle League!
</p>

<a href={`${config.WEB_ROOT}battle/`} class="button">
    <span class="btn-content-wrap">
        <span class="btn-icon btn-icon-battle"></span>
        <span class="btn-label">
            <h2>Battle</h2>
            <p>Simulate battles between two or more Pokemon.</p>
        </span>
    </span>
</a>

<a href={`${config.WEB_ROOT}rankings/`} class="button">
    <span class="btn-content-wrap">
        <span class="btn-icon btn-icon-rankings"></span>
        <span class="btn-label">
            <h2>Rankings</h2>
            <p>Explore the rankings, movesets, and counters for the top Pokemon in each league.</p>
        </span>
    </span>
</a>

<a href={`${config.WEB_ROOT}team-builder/`} class="button">
    <span class="btn-content-wrap">
        <span class="btn-icon btn-icon-team"></span>
        <span class="btn-label">
            <h2>Team Builder</h2>
            <p>Build your own team and see potential threats and suggestions.</p>
        </span>
    </span>
</a>

<a href={`${config.WEB_ROOT}train/`} class="button">
    <span class="btn-content-wrap">
        <span class="btn-icon btn-icon-train"></span>
        <span class="btn-label">
            <h2>Train</h2>
            <p>Play real-time battle simulations against a CPU opponent.</p>
        </span>
    </span>
</a>

<a href={`${config.WEB_ROOT}contribute/`} class="button">
    <span class="btn-content-wrap">
        <span class="btn-icon btn-icon-heart"></span>
        <span class="btn-label">
            <h2>Contribute</h2>
            <p>Check out the source code on Github or lend your support through Patreon.</p>
        </span>
    </span>
</a>

<h3>Pokemon Scarlet &amp; Violet</h3>

<a name="news"></a>

<a href={`${config.WEB_ROOT}tera/`} class="button tera-button">
    <span class="btn-content-wrap">
        <span class="btn-icon btn-icon-tera"></span>
        <span class="btn-label">
            <h2>Tera Raid Counter Calculator</h2>
            <p>
                Take on Tera Raid bosses with this tool to look up Pokemon with the best type
                matchups.
            </p>
        </span>
    </span>
</a>

<!--<?php require 'modules/ads/body-728.php'; ?>-->

<!--Update section for updates-->
<div class="flex new-header">
    <h3>What's New</h3>
    <a href={`${config.WEB_ROOT}rss/`} target="_blank" class="feed-subscribe">RSS Feed</a>
</div>

<div class="feed-container expanded">
    <div class="feed"></div>

    <div class="news-item template hide">
        <h4></h4>
        <div class="news-content"></div>
        <div class="news-info">
            <div class="news-date"></div>
            <a href="#"
                ><div class="link-text">pvpoke.com</div>
                <div>&rarr;</div></a
            >
        </div>
    </div>

    <button class="feed-expand"></button>
</div>

<!--<?php if($_SETTINGS->ads == 1) : ?>
  <span data-ccpa-link="1"></span>
<?php endif; ?>-->

<!-- Localhost developer panel-->
{#if dev}
    <script src={`${config.WEB_ROOT}js/GameMaster.js?v=${SITE_VERSION}`}></script>
    <script src={`${config.WEB_ROOT}js/pokemon/Pokemon.js?v=${SITE_VERSION}`}></script>
    <script src={`${config.WEB_ROOT}js/interface/HomeInterface.js?v=${SITE_VERSION}`}></script>
    <script src={`${config.WEB_ROOT}js/interface/ModalWindow.js?v=${SITE_VERSION}`}></script>
    <script src={`${config.WEB_ROOT}js/interface/PokeSearch.js?v=${SITE_VERSION}`}></script>
    <script src={`${config.WEB_ROOT}js/battle/TimelineEvent.js?v=${SITE_VERSION}`}></script>
    <script src={`${config.WEB_ROOT}js/battle/TimelineAction.js?v=${SITE_VERSION}`}></script>
    <script src={`${config.WEB_ROOT}js/battle/Battle.js?v=${SITE_VERSION}`}></script>
    <script src={`${config.WEB_ROOT}js/battle/TeamRanker.js?v=${SITE_VERSION}`}></script>
    <script src={`${config.WEB_ROOT}js/Main.js?v=${SITE_VERSION}`}></script>
{:else}
    <script src={`${config.WEB_ROOT}js/GameMaster.js?v=${SITE_VERSION}`}></script>
    <script src={`${config.WEB_ROOT}js/pokemon/Pokemon.js?v=${SITE_VERSION}`}></script>
    <script src={`${config.WEB_ROOT}js/interface/HomeInterface.js?v=${SITE_VERSION}`}></script>
    <script src={`${config.WEB_ROOT}js/Main.js?v=${SITE_VERSION}`}></script>
{/if}
