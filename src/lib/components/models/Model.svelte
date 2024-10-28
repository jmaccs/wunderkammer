<script>
	import { T } from '@threlte/core';
	import { GLTF, useProgress } from '@threlte/extras';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import * as THREE from 'three';
	import { modelTransform, screenActions, logStore } from '../utils/stores';

	const dispatch = createEventDispatcher();
	const { progress } = useProgress();
	let modelRef = new THREE.Group();

	$: if ($progress) {
		handleProgress($progress);
	}

	function handleProgress(value) {
		const progressPercent = Math.round(value * 100);
		logStore.addLog(`Loading model: ${progressPercent}%`);
	}

	function handleError(e) {
		logStore.addError(`Failed to load model: ${e.message}`);
		screenActions.setModelLoadState(false);
		dispatch('error', e);
	}

	function handleLoaded(e) {
		logStore.addLog('Model loaded successfully');
		screenActions.setModelLoadState(true);
		dispatch('load', {
			model: e.detail,
			scene: e.detail.scene
		});
	}

	function cleanupModel() {
		if (modelRef) {
			modelRef.traverse((child) => {
				if (child.geometry) {
					child.geometry.dispose();
				}
				if (child.material) {
					if (Array.isArray(child.material)) {
						child.material.forEach((material) => material.dispose());
					} else {
						child.material.dispose();
					}
				}
			});
		}
		logStore.addLog('Model resources cleaned up');
	}

	onDestroy(cleanupModel);
</script>

<T.Group 
	bind:ref={modelRef} 
	dispose={false} 
	{...$$restProps}
	on:create
>
	{#if $modelTransform.url}
		<GLTF 
			url={$modelTransform.url}
			on:error={handleError}
			on:loaded={handleLoaded}
		/>
	{/if}
</T.Group>
