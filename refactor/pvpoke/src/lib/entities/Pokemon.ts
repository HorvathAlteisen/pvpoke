type Matchup = {
    opponent: string;
    rating: number;
};

type Counter = {
    opponent: string;
    rating: number;
};

type FastMove = {
    moveId: string;
    uses: number | null;
};

type ChargedMove = {
    moveId: string;
    uses: number | null;
};

type Moves = {
    fastMoves: FastMove[];
    chargedMoves: ChargedMove[];
};

type Stats = {
    product: number;
    atk: number;
    def: number;
    hp: number;
};

type Contestant = {
    speciesId: string;
    speciesName: string;
    rating: number;
    matchups: Matchup[];
    counters: Counter[];
    moves: Moves;
    moveset: string[];
    score: number;
    scores: number[];
    stats: Stats;
};

export class Pokemon {
    data: Contestant;
    id: string;
    speciesId: string;
    aliasId: string;
    canonicalId: string;
    speciesName: string;
    dex: number;
    baseStats: { atk: number; def: number; hp: number };
    stats: { atk: number; def: number; hp: number };
    statBuffs: number[];
    startStatBuffs: number[];
    buffChanceModifier: number;
    ivs: { atk: number; def: number; hp: number };
    types: string[];
    cp: number;
    hp: number;
    startHp: number;
    startEnergy: number;
    startCooldown: number;
    level: number;
    levelCap: number;
    baseLevelCap: number;
    baseLevelFloor: number;
    cpm: number;
    priority: number;
    fastMovePool: any[];
    chargedMovePool: any[];
    legacyMoves: string[];
    eliteMoves: string[];
    shadowEligible: boolean;
    shadowType: string;
    shadowAtkMult: number;
    shadowDefMult: number;
    released: boolean;
    buddyDistance: number;
    thirdMoveCost: number;
    family?: any;
    typeEffectiveness: any;
    fastMove: any;
    chargedMoves: any[];
    isCustom: boolean;
    autoLevel: boolean;
    index: number;
    dps: number;
    energy: number;
    cooldown: number;
    damageWindow: number;
    shields: number;
    startingShields: number;
    hasActed: boolean;
    baitShields: number;
    farmEnergy: boolean;
    chargedMovesOnly: boolean;
    optimizeMoveTiming: boolean;
    turnsToKO: number;
    battleStats: any;
    roundStats: any;
    rankingWeight: number;
    tags: string[];
    nicknames: string[];
    battle: any;
    cpms: number[];
    fastestChargedMove: any;
    activeChargedMoves: any[];
    bestChargedMove: any;
    overall: number;
    scores: number[];

    constructor(data: Contestant) {
        this.data = data;
        this.id = '';
        this.speciesId = '';
        this.aliasId = '';
        this.canonicalId = '';
        this.speciesName = '';
        this.dex = 0;
        this.baseStats = { atk: 0, def: 0, hp: 0 };
        this.stats = { atk: 0, def: 0, hp: 0 };
        this.statBuffs = [0, 0];
        this.startStatBuffs = [0, 0];
        this.buffChanceModifier = 0;
        this.ivs = { atk: 0, def: 0, hp: 0 };
        this.types = ['', ''];
        this.cp = 0;
        this.hp = 0;
        this.startHp = 0;
        this.startEnergy = 0;
        this.startCooldown = 0;
        this.level = 50;
        this.levelCap = 50;
        this.baseLevelCap = 50;
        this.baseLevelFloor = 1;
        this.cpm = 0;
        this.priority = 0;
        this.fastMovePool = [];
        this.chargedMovePool = [];
        this.legacyMoves = [];
        this.eliteMoves = [];
        this.shadowEligible = false;
        this.shadowType = 'normal';
        this.shadowAtkMult = 1;
        this.shadowDefMult = 1;
        this.released = false;
        this.buddyDistance = 0;
        this.thirdMoveCost = 0;
        this.family = null;
        this.typeEffectiveness = {};
        this.fastMove = null;
        this.chargedMoves = [];
        this.isCustom = false;
        this.autoLevel = false;
        this.index = 0;
        this.dps = 0;
        this.energy = 0;
        this.cooldown = 0;
        this.damageWindow = 0;
        this.shields = 0;
        this.startingShields = 0;
        this.hasActed = false;
        this.baitShields = 1;
        this.farmEnergy = false;
        this.chargedMovesOnly = false;
        this.optimizeMoveTiming = true;
        this.turnsToKO = -1;
        this.battleStats = {};
        this.roundStats = {};
        this.rankingWeight = 1;
        this.tags = [];
        this.nicknames = [];
        this.battle = null;
        this.cpms = [];
        this.fastestChargedMove = null;
        this.activeChargedMoves = [];
        this.bestChargedMove = null;
        this.overall = 0;
        this.scores = [];
    }
}
