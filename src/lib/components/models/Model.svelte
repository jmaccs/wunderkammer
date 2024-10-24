<script>
	import { T } from '@threlte/core';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { sceneTransform, screenActions } from '../utils/stores';
	import { modelProcessor } from '../utils/modelUtils';
	import * as THREE from 'three';

	let model = null;
	let lodGroup = null;
	let isLoading = true;
	let currentLoadingUrl = null;
	let mounted = false;
	const dispatch = createEventDispatcher();

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
							if (Array.isArray(child.material)) {
								child.material.forEach((material) => material.dispose());
							} else {
								child.material.dispose();
							}
						}
					});
				}
				model = null;
			}
			if (lodGroup) {
				lodGroup.traverse((child) => {
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
				lodGroup = null;
			}
			isLoading = true;
		} catch (error) {
			console.error('Model: Error during cleanup:', error);
		}
	}

	onMount(() => {
		console.log('Model: Component mounted');
		mounted = true;
	});

	const unsubTransform = sceneTransform.subscribe((transform) => {
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
				center: true,
				createLODs: true
			});
			
			if (!mounted) {
				console.log('Model: Component unmounted during load, aborting');
				return;
			}

			if (!processedModel || !processedModel.scene) {
				throw new Error('Invalid processed model data');
			}
			
			model = processedModel;
			lodGroup = processedModel.userData.lod;
			
			// Apply scene transform settings if they exist
			if ($sceneTransform.scale) {
				const scale = new THREE.Vector3($sceneTransform.scale, $sceneTransform.scale, $sceneTransform.scale);
				model.scene.scale.copy(scale);
				if (lodGroup) {
					lodGroup.scale.copy(scale);
				}
			}
			
			if ($sceneTransform.rotation) {
				const rotation = new THREE.Euler().copy($sceneTransform.rotation);
				model.scene.rotation.copy(rotation);
				if (lodGroup) {
					lodGroup.rotation.copy(rotation);
				}
			}
			
			isLoading = false;
			console.log('Model: Load completed successfully');
			
			dispatch('load', { 
				model,
				scene: model.scene,
				animations: model.animations,
				lodGroup
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
</script>

{#if model && !isLoading && mounted}
	{#if lodGroup}
		<T is={lodGroup} />
	{:else if model.scene}
		<T is={model.scene} />
	{/if}
	<slot {model} {lodGroup} />
{/if}
