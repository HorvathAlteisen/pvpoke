import { writable, type Writable } from 'svelte/store';

type Settings = {
    defaultIVs: string;
    animateTimeline: number;
    theme: 'default' | 'night';
    gamemaster: 'gamemaster' | 'gamemaster-mega' | 'gamemaster-paldea';
    pokeboxId: number | null;
    ads: number;
    xls: number;
    rankingDetails: string;
    hardMovesetLinks: number;
    colorblindMode: number;
};

export const settings: Writable<Settings> = writable({
    defaultIVs: 'gamemaster',
    animateTimeline: 1,
    theme: 'default',
    gamemaster: 'gamemaster',
    pokeboxId: 0,
    ads: 1,
    xls: 1,
    rankingDetails: 'one-page',
    hardMovesetLinks: 0,
    colorblindMode: 0
});

export const performGroupMigration = writable(false);

// Check for the 'migrate' cookie and set it if not present
export function checkGroupMigration(): void {
    if (typeof document !== 'undefined') {
        // Check if the 'migrate' cookie exists
        const cookies = document.cookie.split('; ').find((row) => row.startsWith('migrate='));

        if (!cookies) {
            // Cookie does not exist, set performGroupMigration to true and create the cookie
            performGroupMigration.set(true);

            // Set 'migrate' cookie with a 5-year expiration time
            const expireDate = new Date();
            expireDate.setTime(expireDate.getTime() + 5 * 365 * 24 * 60 * 60 * 1000); // 5 years
            document.cookie = `migrate=true; expires=${expireDate.toUTCString()}; path=/`;
        }
    }
}
