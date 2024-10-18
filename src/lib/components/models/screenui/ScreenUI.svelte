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
	import { model, screenValue, setScreen } from '../../utils/stores';
	const component = forwardEventHandlers();
	export let windowWidth = 800;
	export let windowHeight = 800;
	let rows;
	let columns;

	export const ref = new THREE.Group();

	interactivity();
	transitions();

	const { renderStage, autoRender, renderer, scene, camera, invalidate } = useThrelte();

	function handleModel(event) {
		const id = event.detail.value;

		setScreen(id);
		console.log(id);
	}

	function handleMenuChoice(event) {
		const choice = event.detail.value;
		setScreen(choice);

		console.log('choice', choice);
	}
	const renderUI = () => {
		const cameraDirection = camera.current.getWorldDirection(new THREE.Vector3());
		const distanceFromCamera = 35;

		ref.position
			.copy(camera.current.position)
			.add(cameraDirection.multiplyScalar(distanceFromCamera));

		ref.lookAt(camera.current.position.x, camera.current.position.y, camera.current.position.z);
		// ref.rotation.z = -0.251;
	};

	const unsubScreen = screenValue.subscribe(($screenValue) => {
		$screenValue.currentPage;
	});

	onMount(() => {
		renderUI();
	});
	onDestroy(() => {
		unsubScreen();
	});

	useTask(
		async () => {
			await tick();
			renderer.render(scene, camera.current);
		},
		{ stage: renderStage }
	);
</script>

<T is={ref} {...$$restProps} bind:this={$component}>
	<Window title="wunderkammer" width={windowWidth} height={windowHeight}>
		{#key $screenValue.currentPage}
			{#if $screenValue.currentPage === 'models'}
				<Models on:select={handleModel} />
			{/if}

			{#if $screenValue.currentPage === 'menu'}
				<Menu on:select={handleMenuChoice} />
			{/if}
			{#if $screenValue.currentPage.length > 10}
				<ModelPage modelUid={$screenValue.currentPage} />
			{/if}
		{/key}
	</Window>
</T>
