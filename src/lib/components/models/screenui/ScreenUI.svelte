<script>
	import {
		useTask,
		useThrelte,
		forwardEventHandlers,
		T,
		useThrelteUserContext
	} from '@threlte/core';
	import { interactivity, transitions } from '@threlte/extras';
	import * as THREE from 'three';
	import { fetchModels } from '../../utils/api';
	import { onMount, onDestroy, tick } from 'svelte';
	import Models from './Models.svelte';
	import Window from './Window.svelte';
	import Menu from './Menu.svelte';
	import ModelPage from './ModelPage.svelte';
	import Lever from './Lever.svelte';
	import { get } from 'svelte/store';
	import {
		modelActions,
		screenActions,
		screenState,
		activeScene,
		selectedModel
	} from '../../utils/stores';

	const uiComponent = forwardEventHandlers();
	const leverComponent = forwardEventHandlers();

	let lever = false;
	let modelUI = false;
	let mounted = false;
	export const uiRef = new THREE.Group();
	export const leverRef = new THREE.Group();
	$: innerWidth = $screenState.screenSize.innerWidth;
	$: innerHeight = $screenState.screenSize.innerHeight;
	interactivity();
	transitions();

	const userCtx = useThrelteUserContext();
	const { renderStage, autoRender, renderer, scene, camera, invalidate } = useThrelte();

	const renderUI = () => {
		const cameraDirection = camera.current.getWorldDirection(new THREE.Vector3());
		const distanceFromCamera = 1200;
		uiRef.position
			.copy(camera.current.position)
			.add(cameraDirection.multiplyScalar(distanceFromCamera));
		uiRef.lookAt(camera.current.position.x, camera.current.position.y, camera.current.position.z);
	};

	async function handleModel(event) {
		const uid = event.detail.value;
		await modelActions.setSelectedModel(uid);
		screenActions.setPage('model-page');
		modelUI = true;
		lever = true;
	}

	function handleMenuChoice(event) {
		const choice = event.detail.value;
		screenActions.setPage(choice);
	}

	async function getModel() {
		try {
			const currentModel = get(selectedModel);
			if (!currentModel) return null;

			const url = await fetchModels(currentModel.uid);
			return url;
		} catch (error) {
			console.error('Failed to load model:', error);
			return null;
		}
	}

	async function handleLoadTransition() {
		const url = await getModel();
		if (url) {
			modelActions.setModelUrl(url);

			screenActions.toggleScreen(false);

			screenActions.setModelLoadState(true);
		}
	}
	function handleKeydown(event) {
		if (event.key === 'Escape' && $screenState.isOpen) {
			screenActions.toggleScreen(false);
		}
	}
	onMount(() => {
		renderUI();
		mounted = true;
	});

	onDestroy(() => {
		modelActions.setModelList([]);
		screenActions.reset();
	});

	useTask(
		async () => {
			await tick();
			renderer.render(scene, camera.current);
		},
		{ stage: renderStage }
	);
</script>

{#if mounted && $screenState.isOpen}
	<T is={uiRef} {...$$restProps} bind:this={$uiComponent}>
		<Window title="wunderkammer" width={innerWidth/4} height={innerHeight/4}>
			{#key $screenState.currentPage}
				{#if $screenState.currentPage === 'models'}
					<Models on:select={handleModel} />
				{/if}

				{#if $screenState.currentPage === 'menu'}
					<Menu on:select={handleMenuChoice} />
				{/if}

				{#if $screenState.currentPage === 'model-page' && $selectedModel}
					<ModelPage />
				{/if}
			{/key}
		</Window>
	</T>

	{#if lever}
		<T is={leverRef} bind:this={$leverComponent} on:click={handleLoadTransition} position.z={-12}>
			<Lever />
		</T>
	{/if}
{/if}
