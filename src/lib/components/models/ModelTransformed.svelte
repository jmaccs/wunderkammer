<script>
	import { T, forwardEventHandlers } from '@threlte/core';
	import { gltfTransformer } from '../utils/gltfTransform';
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { GLTF } from '@threlte/extras';
	import { modelTransform, screenActions, wunderkammerRef } from '../utils/stores';
	import * as THREE from 'three';
	import { logStore } from '../utils/stores';

	const dispatch = createEventDispatcher();
	let model = null;
	let isLoading = true;
	let currentLoadingUrl = null;
	let mounted = false;
	let modelReady = false;
	export let url;
	const component = forwardEventHandlers();

	async function loadModel(modelUrl) {
		if (!modelUrl) {
			logStore.addError('ModelTransformed: No URL provided');
			return;
		}

		console.log('ModelTransformed: Starting model load:', modelUrl);
		logStore.addLog(`ModelTransformed: Starting model load: ${modelUrl}`);
		isLoading = true;
		currentLoadingUrl = modelUrl;

		try {
			const blobUrl = await gltfTransformer.transformGltf(modelUrl);

			if (!mounted) {
				console.log('ModelTransformed: Component unmounted during load, aborting');
				logStore.addLog('ModelTransformed: Component unmounted during load, aborting');
				return;
			}

			if (currentLoadingUrl !== modelUrl) {
				console.log('ModelTransformed: URL changed during load, aborting');
				logStore.addLog('ModelTransformed: URL changed during load, aborting');
				return;
			}

			model = blobUrl;
			isLoading = false;
			modelReady = true;
			console.log('ModelTransformed: Load completed successfully');
			logStore.addLog('ModelTransformed: Load completed successfully');

			dispatch('load', { url: blobUrl });
			screenActions.setModelLoadState(true);
		} catch (error) {
			console.error('ModelTransformed: Error loading model:', error);
			logStore.addError(`ModelTransformed: Error loading model: ${error.message}`);
			isLoading = false;
			modelReady = false;
			screenActions.setModelLoadState(false);
		}
	}

	const unsubWunderkammer = wunderkammerRef.subscribe((ref) => {
		if (!ref) return;
		
	});

	function cleanup() {
		if (model) {
			
			URL.revokeObjectURL(model);
			model = null;
		}
		isLoading = true;
		modelReady = false;
		currentLoadingUrl = null;
	}

	onMount(async () => {
		mounted = true;
		if (url) {
			await loadModel(url);
		}
	});

	onDestroy(() => {
		console.log('ModelTransformed: Component destroying');
		logStore.addLog('ModelTransformed: Component destroying');
		mounted = false;
		cleanup();

		if (unsubWunderkammer) {
			unsubWunderkammer();
		}
	});

	$: if (url && mounted && url !== currentLoadingUrl) {
		loadModel(url);
	}
</script>

{#if model && !isLoading && mounted && modelReady}
	<T.Group bind:this={$component} {...$$restProps}>
		<GLTF url={model} />
	</T.Group>
{/if}
