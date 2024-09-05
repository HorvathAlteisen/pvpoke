import { error } from '@sveltejs/kit';

// Allowed values for cup and cp
const allowedCups = ['premier', 'classic', 'retro', 'fossil', 'zodiac', 'sovereign', 'little'];
const allowedCps = ['500', '1500', '2500', '10000'];

const capitalizeFirstLetter = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const load = async ({ params }) => {
    const { cup, cp } = params;

    // Validate the cup and cp parameters
    if (!allowedCups.includes(cup)) {
        throw error(404, 'Invalid cup');
    }

    if (!allowedCps.includes(cp)) {
        throw error(404, 'Invalid cp');
    }

    let league = '';

    // Determine the league based on cp
    switch (cp) {
        case '500':
            league = 'Little Cup';
            break;
        case '1500':
            league = 'Great League';
            break;
        case '2500':
            league = 'Ultra League';
            break;
        case '10000':
            league = 'Master League';
            break;
        case '10000-40':
            league = 'Master League Classic';
            break;
        default:
            league = 'Great League';
    }

    // Add cup-related modifiers to the league
    switch (cup) {
        case 'premier':
            league = league + ' Premier';
            break;

        case 'premierclassic':
            league = 'Premier Classic';
            break;

        case 'classic':
            league = 'Master League Classic';
            break;

        case 'mega':
            league = 'Mega Master League';
            break;

        case 'retro':
            league = 'Retro Cup';
            break;

        case 'fossil':
            league = 'Fossil Cup';
            break;

        case 'summer':
            league = 'Summer Cup';
            break;

        case 'zodiac':
            league = 'Devon Zodiac Cup';
            break;

        case 'sovereign':
            league = 'Devon Sovereign Cup';
            break;

        case 'devonchampionship':
            league = 'devonchampionship';
            break;

        case 'tundra':
            league = 'Devon Tundra Cup';
            break;

        case 'ufc-untapped-master':
            league = 'UFC Untapped (Master)';
            break;

        case 'catch':
            league = 'Catch Cup';
            break;

        case 'little':
            league = 'Little Cup';
            break;

        case 'polaris':
            league = 'Battle Frontier (Polaris)';
            break;

        case 'wasteland':
            league = 'Battle Frontier (Wasteland)';
            break;

        case 'battlefrontiergreat':
            league = 'Battle Frontier (Master)';
            break;

        case 'battlefrontierultra':
            league = 'Battle Frontier (Master)';
            break;

        case 'battlefrontiermaster':
            league = 'Battle Frontier (Master)';
            break;

        case 'littlecatch':
            league = 'Little Catch Cup';
            break;

        case 'evolution':
            league = 'Evolution Cup';
            break;

        case 'fantasy':
            league = 'Fantasy Cup';
            break;

        case 'remix':
            league = league + ' Remix';
            break;
    }

    const CANONICAL = `/rankings/${cup}/${cp}/overall/`;
    /*const name = capitalizeFirstLetter(url.searchParams.get('p')?.replace(/_/g, ' ') || '');*/
    const name = 'TODO_NAME';
    const META_TITLE = `${name} ${league} PvP Rankings`;
    const META_DESCRIPTION = `Explore key matchups, moves, and counters for ${name} in ${league}.`;

    return {
        league,
        CANONICAL,
        META_TITLE,
        META_DESCRIPTION
    };
};
