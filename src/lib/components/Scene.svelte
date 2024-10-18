<script>
	import { Pane, Slider, Folder } from 'svelte-tweakpane-ui';
	import { getModels } from './utils/api.js';
	import { onMount, onDestroy, tick } from 'svelte';
	import { spring, tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import * as THREE from 'three';
	import { T, useThrelte, extend, useTask } from '@threlte/core';
	import { scale, fly } from './utils/responsivityUtils.js';
	import {
		Grid,
		Sky,
		Stars,
		interactivity,
		OrbitControls,
		createTransition,
		useCursor
	} from '@threlte/extras';
	import { DEG2RAD } from 'three/src/math/MathUtils.js';
	import {
		modelValues,
		cameraValues,
		macbookValues,
		screenValue,
		toggleScreen,
		setScreen,
		
	} from './utils/stores.js';
	import AppleDesktop from './models/AppleDesktop.svelte';
	import Model from './models/Model.svelte';
	import Room from './models/Room.svelte';
	import ScreenUi from './models/screenui/ScreenUI.svelte';
	import Keyboard from './models/Keyboard.svelte';
	import LightSpeed from './models/screenui/LightSpeed.svelte';

	export let selectedModelId = null;
	const { hovering, onPointerEnter, onPointerLeave } = useCursor();
	let modelUrl = '';
	let modelScale;
	let modelPosition;
	let modelRotation;
	let cameraPosition;
	let cameraRotation;
	let cameraFov;
	let macbookPosition;
	let macbookRotation;
	let macbookScale = spring(0.015);
	let rotation;
	let showWinamp = false;
	let showUi = false;
	let currentScreen;
	interactivity();
	extend({
		OrbitControls
	});

	const unsubMod = modelValues.subscribe(($modelValues) => {
		modelScale = $modelValues.scale;
		modelPosition = $modelValues.position;
		modelRotation = $modelValues.rotation;
	});
	const unsubCam = cameraValues.subscribe(($cameraValues) => {
		cameraPosition = $cameraValues.position;
		cameraRotation = $cameraValues.rotation;
		cameraFov = $cameraValues.fov;
	});
	const unsubMac = macbookValues.subscribe(($macbookValues) => {
		macbookPosition = $macbookValues.position;
		macbookRotation = $macbookValues.rotation;
	});
	const unsubScreen = screenValue.subscribe(($screenValue) => {
		showUi = $screenValue.screenOpen;
		// currentScreen = $screenValue.currentScreen;
	});

	$: {
		modelValues.set({
			modelScale,
			modelPosition,
			modelRotation
		});
	}

	async function handleOpenUi() {
		await tick();
		if (!showUi) {
			toggleScreen(true);
			setScreen('menu')
		}
	}

	// watch(winamp, (winampOpen) => {
	// 	if (winampOpen === true) {
	// 		showWinamp = true;
	// 		console.log('winamp open', winampOpen);
	// 	} else if (winampOpen === false) {
	// 		showWinamp = false;
	// 		console.log('winamp closed', winampOpen);
	// 	}
	// });
	useTask((delta) => {
		rotation += delta;
	});
	onMount(async () => {
		if (selectedModelId) {
			modelUrl = await getModels(selectedModelId);
		}
	});
	onDestroy(() => {
		unsubCam();
		unsubMac();
		unsubMod();
		unsubScreen();
	});
</script>

<!-- {#if modelUrl}
	<Pane title="Model Controls" position="fixed">
		<Slider bind:value={modelScale} min={0.001} max={1} step={0.001} label="Scale" />
		<Folder title="Model Position">
			<Slider bind:value={modelPosition[0]} min={-10} max={10} step={0.1} label="X" />
			<Slider bind:value={modelPosition[1]} min={-10} max={10} step={0.1} label="Y" />
			<Slider bind:value={modelPosition[2]} min={-10} max={10} step={0.1} label="Z" />
		</Folder>
		<Folder title="Model Rotation">
			<Slider bind:value={modelRotation[0]} min={-Math.PI} max={Math.PI} step={0.1} label="X" />
			<Slider bind:value={modelRotation[1]} min={-Math.PI} max={Math.PI} step={0.1} label="Y" />
			<Slider bind:value={modelRotation[2]} min={-Math.PI} max={Math.PI} step={0.1} label="Z" />
		</Folder>
	</Pane>
{/if} -->
<!-- <PerfMonitor anchorX={'left'} logsPerSecond={30} /> -->

{#if showUi}
	<!-- <LightSpeed /> -->

	<ScreenUi
		scale={0.02}
		windowWidth={500}
		windowHeight={400}
		on:create={({ cleanup }) => {
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

		<Room scale={0.5} rotation.y={-2} transition={scale}></Room>

		<Keyboard />
		<AppleDesktop
			position={[1.5, 0.33, 1.5]}
			rotation={macbookRotation}
			scale={$macbookScale}
			on:click={handleOpenUi}
			on:pointerenter={() => {
				onPointerEnter();
				macbookScale.set(0.017);
			}}
			on:pointerleave={() => {
				onPointerLeave();
				macbookScale.set(0.015);
			}}
		/>

		{#if modelUrl}
			<Model
				scale={$modelValues.scale}
				position={$modelValues.position}
				rotation={$modelValues.rotation}
				{modelUrl}
			/>
		{/if}
		<T.Mesh position={[1.5, 2, -5]} rotation.y={rotation} castShadow receiveShadow>
			<T.BoxGeometry args={[1, 2, 1]} />
			<T.MeshNormalMaterial color="hotpink" />
		</T.Mesh>
	</T.Group>
{/if}
<T.PerspectiveCamera makeDefault position={[-20, 10, 10]} fov={15}>
	<OrbitControls enableZoom={false} enableDamping autoRotateSpeed={0.5} target.y={1.5} />
</T.PerspectiveCamera>
<Stars speed={3} />
<Sky
	setEnvironment
	turbidity={3}
	rayleigh={1.5}
	azimuth={68}
	elevation={0.25}
	mieCoefficient={0.1}
/>


<!-- <T.Mesh position.y={3}>
	<T.PlaneGeometry />
	<ImageMaterial
	  transparent
	  url={webUrl}
	  radius={0.1}
	  zoom={1.1}
	/>
</T.Mesh> -->
