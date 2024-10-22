<script>
	import { GLTF, useGltf, useProgress, Billboard, Text3DGeometry } from '@threlte/extras';
	import { forwardEventHandlers, useTask } from '@threlte/core';
	import { T, useThrelte } from '@threlte/core';
	import LightSpeed from './screenui/LightSpeed.svelte';
	import { onMount } from 'svelte';
	export let modelUrl;
	export let modelScale;
	export let modelRotation;
	export let modelPosition;
	let progressLog;

	const { progress } = useProgress();

	let gltfComponent;

	onMount(async () => {
		await modelUrl;
	});

	$: progressLog = `Loading model: ${($progress * 100).toFixed(2)}%`;
</script>

{#if modelUrl}
	<T.Group position={modelPosition} rotation={modelRotation} scale={modelScale}>
		<GLTF url={modelUrl} bind:this={gltfComponent}></GLTF>
	</T.Group>
{/if}
{#if $progress < 1}
	<LightSpeed />
	<Billboard>
		<Text3DGeometry text={progressLog} />
	</Billboard>
{/if}
