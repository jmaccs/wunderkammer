<script>
	import { T, forwardEventHandlers } from '@threlte/core';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { modelTransform, screenActions } from '../utils/stores';
	import { modelProcessor } from '../utils/modelUtils';

	import * as THREE from 'three';

	let model = null;
	let isLoading = true;
	let currentLoadingUrl = null;
	let mounted = false;
	let modelReady = false;
	const dispatch = createEventDispatcher();
	const component = forwardEventHandlers();
	function cleanup() {
		console.log('Model: Cleaning up resources');
		try {
			if (model) {
				if (model.scene) {
					model.scene.traverse((child) => {
						if (child.geometry) {
							child.geometry.dispose();
						}
						if (child.material) {
							child.material.dispose();
						}
					});
				}
				model = null;
			}
			isLoading = true;
			modelReady = false;
		} catch (error) {
			console.error('Model: Error during cleanup:', error);
		}
	}

	onMount(() => {
		console.log('Model: Component mounted');
		mounted = true;
	});

	const unsubTransform = modelTransform.subscribe((transform) => {
		if (!mounted) return;

		console.log('Model: Scene transform updated', transform);
		try {
			if (transform && transform.url) {
				if (currentLoadingUrl !== transform.url) {
					cleanup();
					currentLoadingUrl = transform.url;
					isLoading = true;
					loadModel(transform.url);
				}
			} else {
				cleanup();
				currentLoadingUrl = null;
			}
		} catch (error) {
			console.error('Model: Error handling transform update:', error);
			handleError(error);
		}
	});

	async function loadModel(url) {
		console.log('Model: Starting model load:', url);
		try {
			const processedModel = await modelProcessor.processModel(url, {
				targetSize: 10,
				center: true
			});

			if (!mounted) {
				console.log('Model: Component unmounted during load, aborting');
				return;
			}

			if (!processedModel || !processedModel.scene) {
				throw new Error('Invalid processed model data');
			}

			model = processedModel;

			// if ($modelTransform.scale) {
			// 	model.scene.scale.set($modelTransform.scale, $modelTransform.scale, $modelTransform.scale);
			// }

			isLoading = false;
			modelReady = true;
			console.log('Model: load completed successfully');

			dispatch('load', {
				model,
				scene: model.scene
			});
			screenActions.setModelLoadState(true);
		} catch (error) {
			console.error('Model: Error loading model:', error);
			handleError(error);
		}
	}

	function handleError(error) {
		console.error('Model: Error occurred:', error);
		cleanup();
		currentLoadingUrl = null;
		dispatch('error', error);
		screenActions.setModelLoadState(false);
	}

	onDestroy(() => {
		console.log('Model: Component destroying');
		mounted = false;
		cleanup();
		if (unsubTransform) {
			unsubTransform();
		}
	});

	$: if (model && model.scene) {
		model.scene.updateMatrixWorld(true);
		console.log(model.scene.position);
	}
</script>

{#if model && !isLoading && mounted && modelReady}
	
		<T.Mesh is={model.scene} bind:this={$component} {...$$restProps} />

{/if}
