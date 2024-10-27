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
		PortalTarget
	} from '@threlte/extras';
	import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
	import {
		screenActions,
		modelActions,
		screenState,
		desktop,
		wunderkammerRef,
		sceneTransform,
		cameraControls,
		activeScene,
		propsState,
		propsActions,
		room
	} from './utils/stores.js';
	import Desktop from './models/Desktop.svelte';
	import Model from './models/Model.svelte';
	import Keyboard from './models/Keyboard.svelte';
	import Room from './models/Room.svelte';
	import ScreenUi from './models/screenui/ScreenUI.svelte';
	import Upright from './models/Upright.svelte';
	import Wunderkammer from './models/Wunderkammer.svelte';
	import CameraControls from './Camera-Controls.svelte';

	const { hovering, onPointerEnter, onPointerLeave } = useCursor();
	let modelUrl = '';

	let macbookScale = spring(1);
	let rotation;
	let showModel;
	let showUi = false;
	let currentScreen;
	let doorsOpen;
	let model = null;
	let isModelLoading = false;
	let uiRef;
	let starCount;
	let boundingBox;
	let center;
	export let innerWidth;
	export let innerHeight;
	interactivity();
	extend({
		OrbitControls
	});

	const { renderStage, autoRender, renderer, scene, camera, invalidate } = useThrelte();

	const unsubScreen = screenState.subscribe(($screenState) => {
		showUi = $screenState.isOpen;
		currentScreen = $screenState.currentScreen;
		showModel = $screenState.isModelLoaded;
		doorsOpen = $screenState.doorsOpen;
		if (!$screenState.isModelLoaded) {
			cleanupModel();
		}
		if (!showUi && $cameraControls) {
			$cameraControls.setLookAt(-100, 40, 30, 0, 1, 0, true);
		}
	});

	const unsubProps = propsState.subscribe(($propsState) => {
		doorsOpen = $propsState.doorsOpen;
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
	const corkscrew = createTransition((ref) => {
		const startY = 100;
		const endY = 15;
		return {
			tick(t) {
				t = 1 - t;
				ref.position.y = startY + (endY - startY) * (1 - t);

				ref.position.z = t;
			},
			easing: cubicOut,
			duration: 10000
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
		unsubProps();
	});
</script>

{#if showUi}
	<ScreenUi
		position={[0, 0, 0]}
		on:create={({ ref, cleanup }) => {
			cleanup(() => {
				console.log('screen cleanup');
			});
		}}
		{innerWidth}
		{innerHeight}
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
		position.y={-10}
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

		<Upright />
		<Desktop
			on:create={(ref) => {
				$desktop = ref;
				if ($cameraControls) {
					$cameraControls.setLookAt(-100, 40, 30, 0, 1, 0, true);
				}
			}}
			on:click={() => {
				handleOpenUi();
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
		></Desktop>
		{#if $sceneTransform.url}
			<Align precise="true" position={[-12, 15, -30]}>
				<Wunderkammer
					in={corkscrew}
					on:click={() => {
						if ($wunderkammerRef) {
							if (!doorsOpen) {
								$cameraControls.setLookAt(-100, 40, 30, 0, 1, 0, true).then(() => {
									$cameraControls.rotate(10 * DEG2RAD, 0, true).then(() => {
										$cameraControls.fitToBox($wunderkammerRef, true);
										propsActions.setDoors(true);
									});
								});
							} else if (doorsOpen) {
								$cameraControls.setLookAt(-100, 40, 30, 0, 1, 0, true).then(() => {
									propsActions.setDoors(false);
								});
							}
						}
					}}
					on:pointerenter={onPointerEnter}
					on:pointerleave={onPointerLeave}
				/>

				<Model
					on:create={({ ref, cleanup }) => {
						cleanup(() => {
							console.log('Model cleanup initiated');
						});
					}}
					on:load={({ detail }) => {
						isModelLoading = false;
						model = detail.model;
						console.log('Model loaded successfully');
						invalidate();
					}}
					on:error={(e) => {
						console.error('Model loading error:', e);
						isModelLoading = false;
						modelActions.setModelUrl(null);
					}}
				/>
			</Align>
		{/if}
	</T.Group>
	<Stars speed={3} count={starCount} />
{/if}

<T.OrthographicCamera
	ref={$cameraControls}
	makeDefault
	zoom={innerWidth / 300}
	position={[-100, 40, 30]}
	on:create={({ pCamera, cleanup }) => {
		cleanup(() => {
			console.log('Cleaning up Orthographic Camera');
		});
	}}
>
	<CameraControls
		on:create={({ ref }) => {
			$cameraControls = ref;
		}}
	/>
</T.OrthographicCamera>

<Sky
	setEnvironment
	turbidity={3}
	rayleigh={1.5}
	azimuth={68}
	elevation={0.25}
	mieCoefficient={0.1}
/>
