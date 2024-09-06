<script lang="ts">
    export let rank: number;
    export let pokemon: any;
</script>

<div class="rank steel">
    <div class="expand-label"></div>
    <div class="name-container">
        <span class="number">#{rank}</span>
        <span class="name">{pokemon.displayName}</span>
        <div class="moves">
            <span>
                Test
            </span>
            <span>
                Test
            </span>
        </div>
    </div>
    <div class="rating-container">
        <div class="rating score-rating"></div>
        <div class="clear"></div>
    </div>
    <!--<div class="details"></div>-->
</div>