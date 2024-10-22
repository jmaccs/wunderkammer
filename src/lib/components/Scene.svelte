<script>
	
import { onDestroy, tick } from 'svelte';
	import { spring } from 'svelte/motion';
	import { cubicIn } from 'svelte/easing';
	import { T, extend, useTask } from '@threlte/core';

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
		modelValues,
		cameraValues,
		screenValue,
		toggleScreen,
		setScreen,
		model,
		setShowModel,
		setModelUrl
	} from './utils/stores.js';
	import AppleDesktop from './models/AppleDesktop.svelte';
	import Model from './models/Model.svelte';
	import Room from './models/Room.svelte';
	import ScreenUi from './models/screenui/ScreenUI.svelte';
	import Keyboard from './models/Keyboard.svelte';
	import Wunderkammer from './models/Wunderkammer.svelte';
	const { hovering, onPointerEnter, onPointerLeave } = useCursor();
	let modelUrl = '';
	let modelScale;
	let modelPosition;
	let modelRotation;
	let cameraPosition;
	let cameraRotation;
	let cameraFov;
	let macbookScale = spring(1);
	let rotation;
	let showModel;
	let showUi = false;
	let currentScreen;

	interactivity();
	extend({
		OrbitControls
	});

	const unsubModel = model.subscribe(($model) => {
		$model;
	});
	const unsubMod = modelValues.subscribe(($modelValues) => {
		modelScale = $modelValues.scale;
		modelPosition = $modelValues.position;
		modelRotation = $modelValues.rotation;
		modelUrl = $modelValues.url;
	});
	const unsubCam = cameraValues.subscribe(($cameraValues) => {
		cameraPosition = $cameraValues.position;
		cameraRotation = $cameraValues.rotation;
		cameraFov = $cameraValues.fov;
	});

	const unsubScreen = screenValue.subscribe(($screenValue) => {
		showUi = $screenValue.screenOpen;
		currentScreen = $screenValue.currentScreen;
		showModel = $screenValue.modelLoaded;
	});

	$: {
		modelValues.set({
			modelScale,
			modelPosition,
			modelRotation
		});
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
			toggleScreen(true);
			setScreen('menu');
			setModelUrl(null);
			setShowModel(false);
		}
	}

	$: {
		console.log('showmodel:', showModel, 'model url:', modelUrl);
	}
	useTask((delta) => {
		rotation += delta;
	});

	onDestroy(() => {
		unsubCam();

		unsubMod();
		unsubScreen();

		unsubModel();
	});
</script>

<!-- {#if showModel}
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
	{#key $screenValue.url}
		{#if showModel}
			<!-- <Warp /> -->

			<Align
				auto
				on:align={({ center }) => {
					console.log('The center of the bounding box is', center);
				}}
			>
				<Model
					{modelScale}
					{modelPosition}
					{modelRotation}
					{modelUrl}
					on:create={({ ref, cleanup }) => {
						cleanup(() => {
							console.log('room cleanup');
						});
					}}
				/>
			</Align>
		{/if}
	{/key}
{/if}
<T.PerspectiveCamera makeDefault position={[-30, 20, 10]} fov={30}>
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
