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
	import LightSpeed from './LightSpeed.svelte';
	let triggerAnimation;
	import {
		model,
		screenValue,
		setScreen,
		toggleScreen,
		setModelStore,
		setModelUrl,
		setModel,
		setShowModel
	} from '../../utils/stores';
	const uiComponent = forwardEventHandlers();
	const leverComponent = forwardEventHandlers();
	export let windowWidth = 400;
	export let windowHeight = 400;
	let rows;
	let columns;
	let lever = false
	let modelUI = false;
	let selectedModelId;
	let modelUrl = '';
	export const uiRef = new THREE.Group();
	export const leverRef = new THREE.Group();
	interactivity();
	transitions();
	const userCtx = useThrelteUserContext();
	const { renderStage, autoRender, renderer, scene, camera, invalidate } = useThrelte();

	async function handleModel(event) {
		const id = event.detail.value;

		setScreen(id);
		await setModel(id);
		modelUI = true;
		lever = true
		
	}

	function handleMenuChoice(event) {
		const choice = event.detail.value;
		setScreen(choice);

		console.log('choice', choice);
	}


	const renderUI = () => {
		const cameraDirection = camera.current.getWorldDirection(new THREE.Vector3());
		const distanceFromCamera = 1500;

		uiRef.position
			.copy(camera.current.position)
			.add(cameraDirection.multiplyScalar(distanceFromCamera));

		uiRef.lookAt(camera.current.position.x, camera.current.position.y, camera.current.position.z);
		// ref.rotation.z = -0.251;
	};

	// const renderLever = () => {
	// 	const distanceFromScreen = 350;

	// 	const rightDirection = new THREE.Vector3().crossVectors(
	// 		camera.current.up,
	// 		camera.current.getWorldDirection(new THREE.Vector3())
	// 	);

	// 	leverRef.position.copy(uiRef.position).add(rightDirection.multiplyScalar(distanceFromScreen));

	// 	leverRef.lookAt(
	// 		camera.current.position.x,
	// 		camera.current.position.y,
	// 		camera.current.position.z
	// 	);
	// };
	async function getModel() {
		try {
			selectedModelId = $model.uid;
			console.log('selectedModelId:', selectedModelId);
			modelUrl = await fetchModels(selectedModelId);
			return modelUrl;
		} catch (error) {
			console.error('Failed to load model:', error);
		}
	}
	async function handleLoadTransition() {
		const url = await getModel();
		setShowModel(true);
		if (url) {
			setModelUrl(url);
			setTimeout(() => {
				toggleScreen(false);
			}, 500);
		}
	}

	const unsubScreen = screenValue.subscribe(($screenValue) => {
		$screenValue.currentPage;
	});

	onMount(() => {
		renderUI();
	
	});
	onDestroy(() => {
		unsubScreen();
		setModelStore([]);
		setModel(null);
	});

	useTask(
		async () => {
			await tick();
			renderer.render(scene, camera.current);
		},
		{ stage: renderStage }
	);
</script>

<T is={uiRef} {...$$restProps} bind:this={$uiComponent}>
	<Window title="wunderkammer" width={windowWidth} height={windowHeight}>
		{#key $screenValue.currentPage}
			{#if $screenValue.currentPage === 'models'}
				<Models on:select={handleModel} />
			{/if}

			{#if $screenValue.currentPage === 'menu'}
				<Menu on:select={handleMenuChoice} />
			{/if}
			{#if modelUI}
				<ModelPage modelUid={$screenValue.currentPage} />
			{/if}
		{/key}
	</Window>
</T>
{#if lever}
<T
	is={leverRef}
	bind:this={$leverComponent}
	on:click={() => {
		handleLoadTransition();
	}}
	position.z={-20}


>
	<Lever />
</T>
{/if}
