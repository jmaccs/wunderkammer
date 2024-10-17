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

	import { model, screenValue, setCurrentPage } from '../../utils/stores';
	const component = forwardEventHandlers();
	export let windowWidth = 800;
	export let windowHeight = 800;
	let rows;
	let columns;

	export const ref = new THREE.Group();
	let currentPage;
	// $: currentPage = $screenValue.currentPage;
	watch(screenValue, ($screenValue) => {
		currentPage = $screenValue.currentPage;
		return () => {
			console.log('cleanup');
		};
	});
	interactivity();
	transitions();

	const { renderStage, autoRender, renderer, scene, camera, invalidate } = useThrelte();

	function handleMessage(event) {
		const id = event.detail.value;

		setCurrentPage(id);
	}
	function handleModel(id) {
		console.log('handleModel', id);
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
		currentPage = $screenValue.currentPage;
		
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
			// console.log(windowHeight +'ww' + windowWidth + 'wh')
		},
		{ stage: renderStage }
	);
</script>

<T is={ref} {...$$restProps} bind:this={$component}>
	<Window title="wunderkammer" width={windowWidth} height={windowHeight}>
		{#key currentPage}
			<Box class="h-full w-full flex-col  gap-10 p-10">
				{#if currentPage === 'models'}
					<Models on:select={handleMessage} />
				{:else if currentPage === 'menu'}
					<Menu on:select={handleMessage} />
				{:else}
					<p>Page not found</p>
				{/if}
			</Box>
		{/key}
	</Window>
</T>
