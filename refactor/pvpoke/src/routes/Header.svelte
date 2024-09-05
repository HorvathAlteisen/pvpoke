<script lang="ts">
    import { settings, performGroupMigration } from '$lib/stores/settings';
    import { page } from '$app/stores';

    import * as config from '$lib/config';

    export let siteVersion: string = '1.31.11.13';
    //let webRoot = '/'; // Adjust according to your app
    let metaTitle =
        'PvPoke | Open-Source Battle Simulator, Rankings & Team Building for Pokemon GO PvP';
    let metaDescription =
        'Looking for an edge in Pokemon GO Trainer Battles? Become a master with our open-source Pokemon battle simulator, explore the top Pokemon rankings, and get your team rated for PvP battles.';
    let ogImage = 'https://pvpoke.com/img/og.jpg';
    let canonical = null;

    let pathname = '';
    let getFavicon = (): string => '';

    $: {
        pathname = $page.route.id!;

        if (pathname) {
            const isTeamBuilder = pathname.includes('team-builder');
            const isRankings = pathname.includes('rankings');
            const isBattle = pathname.includes('battle');
            const isTrain = pathname.includes('train');

            getFavicon = (): string => {
                if (isTeamBuilder) return `/img/themes/sunflower/favicon_team_builder.png`;
                if (isRankings) return `/img/themes/sunflower/favicon_rankings.png`;
                if (isBattle) return `/img/themes/sunflower/favicon_battle.png`;
                if (isTrain) return `/img/themes/sunflower/favicon_train.png`;
                return `/img/themes/sunflower/favicon.png`;
            };
        }
    }
</script>

<svelte:head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{metaTitle}</title>
    <meta name="description" content={metaDescription} />
    <meta property="og:title" content={metaTitle} />
    <meta property="og:description" content={metaDescription} />
    <meta property="og:image" content={ogImage} />

    {#if canonical}
        <link rel="canonical" href={canonical} />
    {/if}

    <link rel="icon" href={getFavicon()} />
    <link rel="stylesheet" href={`/css/style.css`} />

    {#if metaTitle.includes('Train')}
        <link rel="stylesheet" href={`/css/train.css`} />
    {/if}

    {#if pathname.includes('articles')}
        <link rel="stylesheet" href={`/css/article-extras.css`} />
    {/if}

    {#if $settings.theme !== 'default'}
        <link rel="stylesheet" href={`/css/themes/${$settings.theme}.css`} />
    {/if}

    <script src={`/js/interface/RSSReader.js?v=${siteVersion}`}></script>
</svelte:head>

<svelte:body class={$settings.colorblindMode ? 'colorblind' : ''} />
<header>
    <div class="header-wrap">
        {#if $settings.theme === 'night'}
            <a href={'/'}><img src={`/img/themes/sunflower/header-white.png`} alt="PvPoke.com" /></a
            >
        {:else}
            <a href={'/'}><img src={`/img/themes/sunflower/header.png`} alt="PvPoke.com" /></a>
        {/if}

        <div class="hamburger mobile">
            <!--Because I'm too lazy to make a graphic-->
            <div class="meat"></div>
            <div class="meat"></div>
            <div class="meat"></div>
        </div>
        <div class="menu">
            <div class="parent-menu">
                <a
                    class={'icon-battle'}
                    class:selected={pathname.includes('/battle/')}
                    href="pabattle/"
                >
                    Battle<span></span>
                </a>
                <div class="submenu">
                    <div class="submenu-wrap">
                        <a class="nav-great" href={`${config.WEB_ROOT}battle/`}>Single Battle</a>
                        <a class="nav-ultra" href={`${config.WEB_ROOT}battle/multi/`}
                            >Multi Battle</a
                        >
                        <a class="nav-master" href={`${config.WEB_ROOT}battle/matrix/`}
                            >Matrix Battle</a
                        >
                    </div>
                </div>
            </div>
            <div class="parent-menu">
                <a
                    class="icon-rankings"
                    class:selected={pathname === '/rankings/'}
                    href={config.WEB_ROOT + 'rankings/'}
                >
                    Rankings <span></span>
                </a>
                <div class="submenu">
                    <div class="submenu-wrap">
                        <a class="nav-great" href={`${config.WEB_ROOT}rankings/all/1500/overall/`}
                            >Great League</a
                        >
                        <a class="nav-ultra" href={`${config.WEB_ROOT}rankings/all/2500/overall/`}
                            >Ultra League</a
                        >
                        <a class="nav-master" href={`${config.WEB_ROOT}rankings/all/10000/overall/`}
                            >Master League</a
                        >
                        <a href={`${config.WEB_ROOT}custom-rankings/`}>Custom Rankings</a>
                    </div>
                </div>
            </div>
            <a
                class="icon-team"
                class:selected={pathname.includes('/team-builder/')}
                href={`${config.WEB_ROOT}/team-builder/`}>Team Builder</a
            >
            <div class="parent-menu">
                <a
                    class="icon-train"
                    class:selected={pathname.includes('/train/')}
                    href={`${config.WEB_ROOT}train/`}
                >
                    Train <span></span>
                </a>
                <div class="submenu">
                    <div class="submenu-wrap">
                        <a href={`${config.WEB_ROOT}train/analysis/`}>Top Performers</a>
                    </div>
                </div>
            </div>
            <div class="parent-menu more-parent-menu">
                <a class="more desktop" href="#">
                    <div class="hamburger desktop">
                        <!--Because I'm too lazy to make a graphic-->
                        <div class="meat"></div>
                        <div class="meat"></div>
                        <div class="meat"></div>
                    </div>
                </a>
                <div class="submenu">
                    <div class="submenu-wrap">
                        <a href={`${config.WEB_ROOT}moves/`}>Moves</a>
                        <a href={`${config.WEB_ROOT}articles/`}>Articles</a>
                        <a class="icon-heart" href={`${config.WEB_ROOT}contribute/`}>Contribute</a>
                        <a href={`${config.WEB_ROOT}settings/`}>Settings</a>
                        <a class="twitter" href="https://twitter.com/pvpoke" target="_blank"
                            >Twitter</a
                        >
                        <a class="tera" href={`${config.WEB_ROOT}tera/`}>Tera Raid Counters</a>
                        <div class="latest-section mobile">
                            <h4>
                                Latest <a href={`${config.WEB_ROOT}#news`}></a>
                            </h4>
                            <a class="latest-link" href="#"></a>
                            <div class="date"></div>
                        </div>
                    </div>
                </div>
                <div class="safe-mouse-space"></div>
            </div>
        </div>
    </div>
</header>
