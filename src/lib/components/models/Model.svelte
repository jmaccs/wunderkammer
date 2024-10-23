<script>
	import { useGltf, useProgress, Billboard, Text, TransformControls, GLTF } from '@threlte/extras';
	import { T, useTask } from '@threlte/core';
	import LightSpeed from './screenui/LightSpeed.svelte';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
	import { sceneTransform, screenActions } from '../utils/stores';

	let progressLog;
	let model;
	let isLoading = true;
	let modelScene;
	const { progress } = useProgress();
	const dispatch = createEventDispatcher();
	const ktx = new KTX2Loader();

	const unsubTransform = sceneTransform.subscribe((transform) => {
		if (transform && transform.url) {
			isLoading = true;
		}
	});

	function handleError(event) {
		console.error('Error loading model:', event.detail);
		dispatch('error', event.detail);
		screenActions.setModelLoadState(false);
	}
	function handleLoad() {
		isLoading = false;
		dispatch('load');
		screenActions.setModelLoadState(true);
	}
	$: console.log(progress);
	$: progressLog = (progress * 100).toFixed(2);
	$: if (progress < 1) {
		isLoading = true;
	}
	onDestroy(() => {
		unsubTransform();
	});
</script>

<T.Group>
	{#if $sceneTransform.url}
		<GLTF
			url={$sceneTransform.url}
			bind:model
			on:load={handleLoad}
			on:error={handleError}
		
			scale={$sceneTransform.scale}
			rotation={$sceneTransform.rotation}
			{ktx}
		/>

		{#if progress < 1}
			<LightSpeed />
			<Billboard lockX position.x={-10} position.y={2}>
				<Text
					text={`Loading model: ${progressLog}%`}
					fontSize={1}
					font={'/fonts/Catrinity.otf'}
					color="#ffffff"
				/>
			</Billboard>
		{/if}
	{/if}
</T.Group>
{#if model}
	<slot {model} />
{/if}
