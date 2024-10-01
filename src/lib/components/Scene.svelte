<script>
	import { Pane, Slider, Folder } from 'svelte-tweakpane-ui';
	import { getModels } from './utils/api.js';
	import { onMount, onDestroy } from 'svelte';
	import { spring, tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { useThrelteUserContext, T } from '@threlte/core';
	import {
		ContactShadows,
		Float,
		Grid,
		Sky,
		Stars,
		interactivity,
		OrbitControls,
		PerfMonitor
	} from '@threlte/extras';
	import { modelValues, cameraValues, macbookValues } from './utils/stores.js';

	import Macbook from './models/Macbook.svelte';
	import Model from './models/Model.svelte';
	import Room from './models/Room.svelte';
	export let selectedModelId = null;

	let cameraRef;
	let modelUrl = '';
	let modelScale;
	let modelPosition;
	let modelRotation;
	let cameraPosition;
	let cameraRotation;
	let cameraFov;
	let macbookPosition;
	let macbookRotation;
	interactivity();

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
	$: {
		modelValues.set({
			modelScale,
			modelPosition,
			modelRotation
		});
	}

	onMount(async () => {
		if (selectedModelId) {
			modelUrl = await getModels(selectedModelId);
		}
	});
	onDestroy(() => {
		unsubCam();
		unsubMac();
		unsubMod();
	});
</script>

{#if modelUrl}
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
{/if}
<!-- <PerfMonitor anchorX={'left'} logsPerSecond={30} /> -->
<T.PerspectiveCamera
	on:create={({ ref }) => {
		ref.lookAt(0, 1, 0);
	}}
	makeDefault
	position={cameraPosition}
	fov={cameraFov}
>
	<OrbitControls rotateSpeed={0.3} enableZoom={false} enableDamping target.y={1.5} />
</T.PerspectiveCamera>

<Stars />
<Sky
	setEnvironment
	turbidity={10}
	rayleigh={3}
	azimuth={120}
	elevation={0.25}
	mieCoefficient={0.005}
/>

<Grid
	position.y={-0.5}
	cellColor="#ffffff"
	sectionColor="#ffffff"
	sectionThickness={0}
	fadeDistance={25}
	cellSize={2}
/>

<ContactShadows scale={10} blur={2} far={2.5} opacity={0.5} />

<Room scale={0.5} rotation.y={-Math.PI / 2} />

<Macbook position={[1.4, 1.22, 0.5]} scale={0.015} rotation={macbookRotation} />

<Float floatIntensity={0.1} floatingRange={[0, 0.3]}>
	{#if modelUrl}
		<Model
			scale={$modelValues.scale}
			position={$modelValues.position}
			rotation={$modelValues.rotation}
			{modelUrl}
		/>
	{/if}
</Float>

<style>
</style>
