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
	import { fetchModels, getModelData } from '../../utils/api';
	import { onMount, onDestroy, tick, createEventDispatcher } from 'svelte';
	import Models from './Models.svelte';
	import Window from './Window.svelte';
	import Menu from './Menu.svelte';
	import ModelPage from './ModelPage.svelte';
	import Lever from './Lever.svelte';
	import Search from './Search.svelte';
	import { get } from 'svelte/store';

	import {
		modelListActions,
		screenActions,
		screenState,
		activeScene,
		selectedModel,
		cameraControls
	} from '../../utils/stores';
	import { calculateResponsiveDimensions } from '../../utils/responsivityUtils';

	const component = forwardEventHandlers();
	const leverComponent = forwardEventHandlers();

	let lever = false;
	let modelUI = false;
	let mounted = false;
	export let ref = new THREE.Group();
	export const leverRef = new THREE.Group();
	export let innerWidth;

	export let innerHeight;

	$: windowWidth = Math.min(Math.max(innerWidth, 400), 800);
	$: windowHeight = Math.min(Math.max(innerHeight, 400), 800);

	interactivity();
	transitions();

	const { renderStage, autoRender, renderer, scene, camera, invalidate } = useThrelte();
	autoRender.set(false);
	const renderUI = () => {
		const cameraDirection = camera.current.getWorldDirection(new THREE.Vector3());
		const distanceFromCamera = 1000;
		ref.position
			.copy(camera.current.position)
			.add(cameraDirection.multiplyScalar(distanceFromCamera));
		ref.lookAt(camera.current.position.x, camera.current.position.y, camera.current.position.z);
		ref.lookAt(camera.current.position.x, camera.current.position.y, camera.current.position.z);
	};

	async function handleModel(event) {
		const uid = event.detail.value;
		await modelListActions.setSelectedModel(uid);
		const data = await getModelData(uid);
		console.log(data);
		screenActions.setPage('model-page');
		modelUI = true;
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
			console.log(url);
			return url;
		} catch (error) {
			console.error('Failed to load model:', error);
			return null;
		}
	}

	async function handleLoadTransition() {
		
		modelListActions.setModelUrl(null);
		screenActions.setModelLoadState(false);

		
		const url = await getModel();
		if (url) {
			screenActions.toggleScreen(false);
		
			await tick();
			modelListActions.setModelUrl(url);
			screenActions.setModelLoadState(true);
		}
	}

	async function handleModelSelect() {
		lever = true;
		renderLever();
	}

	const renderLever = () => {
		const cameraDirection = camera.current.getWorldDirection(new THREE.Vector3());
		const cameraRight = new THREE.Vector3();
		cameraRight.crossVectors(cameraDirection, camera.current.up).normalize();

		const distanceFromCamera = 50;
		const leftOffset = -2000;

		leverRef.position
			.copy(camera.current.position)
			.add(cameraDirection.multiplyScalar(distanceFromCamera));

		leverRef.position.add(cameraRight.multiplyScalar(leftOffset));
	};

	function handleBack() {
		screenActions.setPage('models');
		modelListActions.setSelectedModel(null);
		lever = false;
	}

	function handleKeydown(event) {
		if (event.key === 'Escape' && $screenState.isOpen) {
			screenActions.toggleScreen(false);
		}
	}
	const dispatch = createEventDispatcher();
	onMount(() => {
		renderUI();
		mounted = true;
	});

	onDestroy(() => {
		modelListActions.setModelList([]);
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
	<T is={ref} {...$$restProps} bind:this={$component}>
		<Window title="wunderkammer" width={windowWidth} height={windowHeight} >
			{#key $screenState.currentPage}
				{#if $screenState.currentPage === 'models'}
					<Models on:select={handleModel} />
				{/if}

				{#if $screenState.currentPage === 'menu'}
					<Menu on:select={handleMenuChoice} />
				{/if}

				{#if $screenState.currentPage === 'model-page' && $selectedModel}
					<ModelPage
						on:back={handleBack}
						on:model={handleModelSelect}
					/>
				{/if}
				{#if $screenState.currentPage === 'search'}
						<Search />
				{/if}
			{/key}

			{#if lever}
				<T is={leverRef} bind:this={$leverComponent} on:click={handleLoadTransition}>
					<Lever />
				</T>
			{/if}
		</Window>
	</T>
{/if}
