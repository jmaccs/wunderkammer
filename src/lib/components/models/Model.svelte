<script>
	import { GLTF } from '@threlte/extras';

	import { T, useThrelte } from '@threlte/core';
	import Loading from '../utils/Loading.svelte';
	export let modelUrl;
	export let position;
	export let scale;
	export let rotation;
</script>

{#await modelUrl}
	<p>Loading...</p>
{:then}
	<GLTF castShadow receiveShadow {position} {scale} {rotation} url={modelUrl} />
{/await}
