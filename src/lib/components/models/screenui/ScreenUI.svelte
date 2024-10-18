<script>
	import { useTask, useThrelte, forwardEventHandlers, T, useCache, watch } from '@threlte/core';
	import { fade } from 'svelte/transition';
	import { interactivity, transitions, Text3DGeometry } from '@threlte/extras';
	import * as THREE from 'three';
	import { Box } from '@threlte/flex';
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
		modelsStore,
		modelLoading
	} from '../../utils/stores';
	const uiComponent = forwardEventHandlers();
	const leverComponent = forwardEventHandlers();
	export let windowWidth = 800;
	export let windowHeight = 800;
	let rows;
	let columns;
	let modelUI = false;
	export const uiRef = new THREE.Group();
	export const leverRef = new THREE.Group();
	interactivity();
	transitions();

	const { renderStage, autoRender, renderer, scene, camera, invalidate } = useThrelte();
	async function setModel(uid) {
		modelsStore.subscribe((models) => {
			if (!models || models.length === 0) return;

			const foundModel = models.find((model) => model.uid === uid);

			if (foundModel) {
				model.set(foundModel);
			} else if (uid === null) {
				model.set(null);
			}
		});
	}
	async function handleModel(event) {
		const id = event.detail.value;

		setScreen(id);
		await setModel(id);
		modelUI = true;
	}

	function handleMenuChoice(event) {
		const choice = event.detail.value;
		setScreen(choice);

		console.log('choice', choice);
	}
	const renderUI = () => {
		const cameraDirection = camera.current.getWorldDirection(new THREE.Vector3());
		const distanceFromCamera = 35;

		uiRef.position
			.copy(camera.current.position)
			.add(cameraDirection.multiplyScalar(distanceFromCamera));

		uiRef.lookAt(camera.current.position.x, camera.current.position.y, camera.current.position.z);
		// ref.rotation.z = -0.251;
	};
	const renderLever = () => {
		const distanceFromScreen = 10;

		const rightDirection = new THREE.Vector3().crossVectors(
			camera.current.up,
			camera.current.getWorldDirection(new THREE.Vector3())
		);

		leverRef.position.copy(uiRef.position).add(rightDirection.multiplyScalar(distanceFromScreen));

		leverRef.lookAt(
			camera.current.position.x,
			camera.current.position.y,
			camera.current.position.z
		);
	};
	function handleLoadTransition() {
		modelLoading.set(true);
		setTimeout(() => {
			modelLoading.set(false);
			toggleScreen(false);
			setScreen(null);
		}, 10000);
	}
	const unsubLoading = modelLoading.subscribe(($modelLoading) => {
		$modelLoading;
	});

	const unsubScreen = screenValue.subscribe(($screenValue) => {
		$screenValue.currentPage;
	});

	onMount(() => {
		renderUI();
		renderLever();
	});
	onDestroy(() => {
		unsubScreen();
		setModelStore([]);
		setModel(null);
		unsubLoading();
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
<T
	is={leverRef}
	bind:this={$leverComponent}
	on:click={() => {
		handleLoadTransition();
	}}
>
	<Lever />
</T>
{#key $modelLoading}
	{#if $modelLoading}
		<LightSpeed />
	{/if}
{/key}
