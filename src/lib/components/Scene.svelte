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
		desktop,
		sceneTransform,
		cameraControls
	} from './utils/stores.js';
	import AppleDesktop from './models/AppleDesktop.svelte';
	import Model from './models/Model.svelte';
	import Room from './models/Room.svelte';
	import ScreenUi from './models/screenui/ScreenUI.svelte';
	import Keyboard from './models/Keyboard.svelte';
	import Wunderkammer from './models/Wunderkammer.svelte';
	import CameraControls from './Camera-Controls.svelte';
	const { hovering, onPointerEnter, onPointerLeave } = useCursor();
	let modelUrl = '';

	let macbookScale = spring(1);
	let rotation;
	let showModel;
	let showUi = false;
	let currentScreen;

	let model = null;
	let isModelLoading = false;

	let pCamera;

	interactivity();
	extend({
		OrbitControls
	});

	const { renderStage, autoRender, renderer, scene, camera, invalidate } = useThrelte();

	const unsubScreen = screenState.subscribe(($screenState) => {
		showUi = $screenState.isOpen;
		currentScreen = $screenState.currentScreen;
		showModel = $screenState.isModelLoaded;
		if (!$screenState.isModelLoaded) {
			cleanupModel();
		}
	});

	function cleanupModel() {
		if (model && model.scene) {
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

	useTask(
		async () => {
			await tick();
			renderer.render(scene, camera.current);
		},
		{ stage: renderStage }
	);

	onDestroy(() => {
		unsubScreen();
	});
</script>

{#if showUi}
	<ScreenUi
		on:create={({ ref, cleanup }) => {
			cleanup(() => {
				console.log('screen cleanup');
			});
		}}
	/>
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

		<Keyboard on:pointerenter={onPointerEnter} on:pointerleave={onPointerLeave} />
		<AppleDesktop
			position={[0.3, 0.75, 3]}
			rotation={[Math.PI / 2, 0, Math.PI / 2]}
			scale={$macbookScale}
			on:create={(ref) => {
				$desktop = ref;
				$cameraControls.setLookAt(-30, 20, 10, 0, 1, 0, true);
			}}
			on:click={() => {
				if ($desktop) {
					$cameraControls.fitToBox($desktop, true).then(() => {
						handleOpenUi();
					});
				}
			}}
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

		<Wunderkammer on:pointerenter={onPointerEnter} on:pointerleave={onPointerLeave} />
	</T.Group>

	{#if $sceneTransform.url}
		<Model
			on:create={({ ref, cleanup }) => {
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
		>
			<svelte:fragment let:model let:lodGroup>
				<!-- Use model or lodGroup as needed -->
			</svelte:fragment>
		</Model>
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
	<CameraControls
		on:create={({ ref }) => {
			$cameraControls = ref;
		}}
	/>
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
