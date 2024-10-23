<script>
	import { onDestroy, onMount, tick } from 'svelte';
	import { spring } from 'svelte/motion';
	import { cubicIn } from 'svelte/easing';
	import { T, extend, useTask, useThrelte } from '@threlte/core';
	import { Pane, Folder, Slider } from 'svelte-tweakpane-ui';
	import * as THREE from 'three';
	import {
		Grid,
		Sky,
		Stars,
		interactivity,
		OrbitControls,
		createTransition,
		useCursor,
		Align
	} from '@threlte/extras';
	import {
		sceneActions,
		screenActions,
		modelActions,
		screenState,
		cameraValues,
		macbookValues,
		sceneTransform
	} from './utils/stores.js';
	import AppleDesktop from './models/AppleDesktop.svelte';
	import Model from './models/Model.svelte';
	import Room from './models/Room.svelte';
	import ScreenUi from './models/screenui/ScreenUI.svelte';
	import Keyboard from './models/Keyboard.svelte';
	import Wunderkammer from './models/Wunderkammer.svelte';
	const { hovering, onPointerEnter, onPointerLeave } = useCursor();
	let modelUrl = '';
	let cameraPosition;
	let cameraRotation;
	let cameraFov;
	let macbookScale = spring(1);
	let rotation;
	let showModel;
	let showUi = false;
	let currentScreen;

	let model = null;
	let isModelLoading = false;
	export let innerWidth = 600;
	export let innerHeight = 400;
	let pCamera;

	interactivity();
	extend({
		OrbitControls
	});

	const { renderStage, autoRender, renderer, scene, camera, invalidate } = useThrelte();

	const unsubCam = cameraValues.subscribe(($cameraValues) => {
		cameraPosition = $cameraValues.position;
		cameraRotation = $cameraValues.rotation;
		cameraFov = $cameraValues.fov;
	});

	const unsubScreen = screenState.subscribe(($screenState) => {
		showUi = $screenState.isOpen;
		currentScreen = $screenState.currentScreen;
		showModel = $screenState.isModelLoaded;
		if (!$screenState.isModelLoaded) {
			cleanupModel();
		}
	});
	function cleanupModel() {
		if (model) {
			model.traverse((child) => {
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
			model = null;
		}
	}

	const fade = createTransition((ref) => {
		if (!ref.transparent) ref.transparent = true;
		return {
			tick(t) {
				ref.opacity = t;
			},
			easing: cubicIn,
			duration: 1200
		};
	});

	async function handleOpenUi() {
		await tick();
		if (!showUi) {
			screenActions.toggleScreen(true);
			screenActions.setPage('menu');
			modelActions.setSelectedModel(null);
			screenActions.setModelLoadState(false);
		}
	}

	$: {
		console.log('showmodel:', showModel, 'model url:', modelUrl);
	}
	useTask(
		async () => {
			await tick();
			renderer.render(scene, camera.current);
		},
		{ stage: renderStage }
	);
	onDestroy(() => {
		unsubCam();

		unsubScreen();
	});
</script>

{#if showUi}
	<!-- <LightSpeed /> -->

	<ScreenUi
		windowWidth={innerWidth / 4}
		windowHeight={innerHeight / 2}
		on:create={({ ref, cleanup }) => {
			cleanup(() => {
				console.log('screen cleanup');
			});
		}}
	/>

	<!-- </Float> -->
{:else if !showUi}
	<T.Group
		on:create={({ ref, cleanup }) => {
			cleanup(() => {
				console.log('room cleanup');
			});
		}}
		castShadow
		receiveShadow
	>
		<Grid
			position.y={-0.5}
			cellColor="#ffffff"
			sectionColor="#ffffff"
			sectionThickness={0}
			fadeDistance={25}
			cellSize={2}
		/>

		<Room rotation.y={-2} in={fade} out={fade}></Room>

		<Keyboard />
		<AppleDesktop
			position={[0.3, 0.75, 3]}
			rotation={[Math.PI / 2, 0, Math.PI / 2]}
			scale={$macbookScale}
			on:click={handleOpenUi}
			on:pointerenter={() => macbookScale.set(1.1)}
			on:pointerleave={() => macbookScale.set(1)}
			in={fade}
			out={fade}
		/>

		<Wunderkammer />
	</T.Group>

	{#if $screenState.isModelLoaded && $sceneTransform.url}
		<!-- <Pane title="Model Controls" position="fixed">
		<Slider bind:value={sceneTransform.scale} min={0.001} max={1} step={0.001} label="Scale" />
		<Folder title="Model Position">
			<Slider bind:value={sceneTransform.position[0]} min={-10} max={10} step={0.1} label="X" />
			<Slider bind:value={sceneTransform.position[1]} min={-10} max={10} step={0.1} label="Y" />
			<Slider bind:value={sceneTransform.position[2]} min={-10} max={10} step={0.1} label="Z" />
		</Folder>
		<Folder title="Model Rotation">
			<Slider bind:value={sceneTransform.rotation[0]} min={-Math.PI} max={Math.PI} step={0.1} label="X" />
			<Slider bind:value={sceneTransform.rotation[1]} min={-Math.PI} max={Math.PI} step={0.1} label="Y" />
			<Slider bind:value={sceneTransform.rotation[2]} min={-Math.PI} max={Math.PI} step={0.1} label="Z" />
		</Folder>
	</Pane> -->
		<Model
			url={$sceneTransform.url}
			position={$sceneTransform.position}
			rotation={$sceneTransform.rotation}
			scale={$sceneTransform.scale}
			on:create={({ ref, cleanup }) => {
				model = ref;
				cleanup(() => {
					console.log('Model cleanup initiated');
				});
			}}
			on:load={() => {
				isModelLoading = false;
				console.log('Model loaded successfully');
			}}
			on:error={(e) => {
				console.error('Model loading error:', e);
				isModelLoading = false;
				modelActions.setModelUrl(null);
			}}
		/>
	{/if}
{/if}
<T.PerspectiveCamera
	ref={pCamera}
	makeDefault
	position={[-30, 20, 10]}
	fov={30}
	on:create={({ ref, cleanup }) => {
		cleanup(() => {
			console.log('Cleaning up Perspective Camera');
		});
	}}
>
	<OrbitControls enableZoom={false} enableDamping autoRotateSpeed={0.5} target.y={1.5} />
</T.PerspectiveCamera>

<Sky
	setEnvironment
	turbidity={3}
	rayleigh={1.5}
	azimuth={68}
	elevation={0.25}
	mieCoefficient={0.1}
/>
<Stars speed={3} />
