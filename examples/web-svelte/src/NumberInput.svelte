<script>
import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher();

export let key;
export let value;

</script>

<input type="number" index={key} bind:value={value} on:change={() => dispatch('updateValue', { 'index': key, 'value': value })} />
 