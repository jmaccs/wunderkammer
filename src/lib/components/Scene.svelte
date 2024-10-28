<script>
	import { onDestroy, onMount, tick } from 'svelte';
	import { spring } from 'svelte/motion';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { T, extend, useTask, useThrelte } from '@threlte/core';
	import { Pane, Folder, Slider } from 'svelte-tweakpane-ui';
	import * as THREE from 'three';
	import { DEG2RAD } from 'three/src/math/MathUtils.js';
	import {
		Grid,
		Sky,
		Stars,
		interactivity,
		OrbitControls,
		createTransition,
		useCursor,
		Align,
		Portal,
		TransformControls
	} from '@threlte/extras';
	import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
	import {
		screenActions,
		modelActions,
		screenState,
		desktop,
		wunderkammerRef,
		modelTransform,
		cameraControls,
		activeScene,
		room,
		logStore
	} from './utils/stores.js';
	import Desktop from './models/Desktop.svelte';
	import Model from './models/Model.svelte';
	import Burner from './models/Burner.svelte';
	import Room from './models/Room.svelte';
	import ScreenUi from './models/screenui/ScreenUI.svelte';
	import Upright from './models/Upright.svelte';
	import Wunderkammer from './models/Wunderkammer.svelte';
	import CameraControls from './Camera-Controls.svelte';

	const { hovering, onPointerEnter, onPointerLeave } = useCursor();
	let macbookScale = spring(1);
	let rotation;
	let showModel;
	let showUi = false;
	let currentScreen;
	let doorsOpen;
	let modelRef;
	let view;
	export let innerWidth;
	export let innerHeight;
	$: view = $screenState.isOpen ? 'ui' : 'scene';
	interactivity();
	extend({ OrbitControls });

	const { renderStage, autoRender, renderer, scene, camera, invalidate } = useThrelte();

	const unsubScreen = screenState.subscribe(($screenState) => {
		showUi = $screenState.isOpen;
		currentScreen = $screenState.currentPage;
		showModel = $screenState.isModelLoaded;
		doorsOpen = $screenState.doorsOpen;

		if ($cameraControls) {
			if (showUi) {
				$cameraControls.zoomTo(1, true);
			} else {
				$cameraControls.setLookAt(-100, 40, 30, 0, 1, 0, true);
				$cameraControls.zoomTo(10, true);
			}
		}
	});

	const unsubCamera = cameraControls.subscribe(() => {});

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

	useTask(
		async () => {
			await tick();
			renderer.render(scene, camera.current);
			rotation += tick;
		},
		{ stage: renderStage }
	);

	onDestroy(() => {
		unsubScreen();
		unsubCamera();
	});
</script>

{#if showUi}
	<ScreenUi
		position={[0, 0, 0]}
		on:create={({ ref, cleanup }) => {
			cleanup(() => {
				logStore.addLog('Screen cleanup');
			});
		}}
		{innerWidth}
		{innerHeight}
	/>
{:else if !showUi}
	<T.Group
		on:create={({ ref, cleanup }) => {
			cleanup(() => {
				logStore.addLog('Room cleanup');
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

		<Room rotation.y={-2} in={fade} out={fade} />
		<Upright />
		<Desktop
			on:create={(ref) => {
				$desktop = ref;
				if ($cameraControls) {
					$cameraControls.setLookAt(-100, 40, 30, 0, 1, 0, true);
					$cameraControls.zoomTo(0.7, true);
				}
			}}
			on:click={handleOpenUi}
			on:pointerenter={() => {
				onPointerEnter();
				macbookScale.set(1.1);
			}}
			on:pointerleave={() => {
				onPointerLeave();
				macbookScale.set(1);
			}}
			in={fade}
			out={fade}
		/>

		<Burner position={[15, 0, -20]} scale={4} rotation.y={-0.5} />
	</T.Group>

	<Wunderkammer
		position={[-15, 0, -35]}
		rotation.y={-0.4}
		on:click={() => {
			if ($wunderkammerRef) {
				if (!doorsOpen) {
					$cameraControls.rotateAzimuthTo(30 * THREE.MathUtils.DEG2RAD, true).then(() => {
						$cameraControls.fitToBox($wunderkammerRef, true);
					});
				} else if (doorsOpen) {
					$cameraControls.setLookAt(-100, 40, 30, 0, 1, 0, true).then(() => {
						$cameraControls.zoomTo(10, true);
					});
				}
			}
		}}
		on:pointerenter={onPointerEnter}
		on:pointerleave={onPointerLeave}
	/>
	{#if $modelTransform.url && $wunderkammerRef}
		<Model
			position.y={5}
			rotation.y={rotation}
			on:create
			on:load={({ detail }) => {
				logStore.addLog('Model loaded successfully');
				invalidate();
			}}
			on:error={(e) => {
				logStore.addError('Model loading error: ' + e.detail);
				modelActions.setModelUrl(null);
			}}
		/>
	{/if}

	<Stars speed={3} count={10000} />
{/if}

{#if innerHeight && innerWidth}
	<T.OrthographicCamera
		args={[innerWidth / -2, innerWidth / 2, innerHeight / 2, innerHeight / -2, 1, 4000]}
		makeDefault
	>
		<CameraControls
			on:create={({ ref }) => {
				$cameraControls = ref;
				if (showUi) {
					ref.zoomTo(1, true);
				} else {
					ref.setLookAt(-100, 40, 30, 0, 1, 0, true);
					ref.zoomTo(10, true);
				}
			}}
		/>
	</T.OrthographicCamera>
{/if}

<Sky
	setEnvironment
	turbidity={3}
	rayleigh={1.5}
	azimuth={68}
	elevation={0.25}
	mieCoefficient={0.1}
	scale={4000}
/>
