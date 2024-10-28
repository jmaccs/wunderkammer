<script>
	import { T } from '@threlte/core';
	import { GLTF } from '@threlte/extras';
	import { createEventDispatcher } from 'svelte';
	import { modelTransform, screenActions, logStore } from '../utils/stores';
	import * as THREE from 'three';
import { useProgress } from '@threlte/extras';
const { progress } = useProgress();
	export const ref = new THREE.Group();
	const dispatch = createEventDispatcher();

	function handleLoading(e) {
		const progress = Math.round(progress * 100);
		logStore.addLog(`Loading model: ${progress}%`);
	}

	function handleError(e) {
		logStore.addError(`Failed to load model: ${message}`);
		screenActions.setModelLoadState(false);
		dispatch('error', e);
	}

	function handleLoad(e) {
		logStore.addLog('Model loaded successfully');
		screenActions.setModelLoadState(true);
		dispatch('load', e);
	}
</script>

<T.Group is={ref} dispose={false} {...$$restProps}>
	{#if $modelTransform.url}
		<GLTF
			url={$modelTransform.url}
			on:loading={handleLoading}
			on:error={handleError}
			on:loaded={handleLoad}
		/>
	{/if}
</T.Group>
