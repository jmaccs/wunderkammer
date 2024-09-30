<script>
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { useGltf, GLTF } from '@threlte/extras';

	import { T, useThrelte } from '@threlte/core';
	import Loading from '../utils/Loading.svelte';
	export let modelUrl;
	export let position = [0, 0, 0];
	export let scale = [1, 1, 1];
	export let rotation = [0, 0, 0];

	// async function loadModel() {
	// 	if (modelUrl) {
	// 		const model = useGltf(modelUrl);
	// 		return model;
	// 	}
	// }
	
</script>

{#await modelUrl}
	<p>Loading...</p>
{:then}
	
		<GLTF {position} {scale} url={modelUrl} />
	
{/await}
