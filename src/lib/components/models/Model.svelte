<script>
	import { GLTF, useProgress, Billboard, Text } from '@threlte/extras';
	import { T, useTask } from '@threlte/core';
	import LightSpeed from './screenui/LightSpeed.svelte';
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';

	export let url;
	export let position;
	export let scale;
	export let rotation;
	let progressLog;
	let model;
	let isLoading = true;
	const { progress } = useProgress();
	const dispatch = createEventDispatcher();
	function handleError(event) {
		console.error('Error loading model:', event.detail);
		dispatch('error', event.detail);
	}

	$: if (url) {
		isLoading = true;
	}

	$: progressLog = ($progress * 100).toFixed(2);

	if (!isLoading) {
		console.log(model);
	}
</script>

{#if url}
	{#if (progress = 1)}
		<GLTF
			{url}
			{position}
			{scale}
			{rotation}
			bind:model
			on:load={({ detail }) => {
				isLoading = false;
				model = detail;  // Get the model directly from the event
				console.log('Model loaded:', detail);
				dispatch('load', { model });
			}}
			on:error={handleError}
		/>
	{/if}
	{#if $progress < 1}
		<LightSpeed />
		<Billboard lockZ position.x={-10}>
			<Text text={`Loading model: ${progressLog}%`} fontSize={2} font={'/fonts/Catrinity.otf'} />
		</Billboard>
	{/if}
{/if}
