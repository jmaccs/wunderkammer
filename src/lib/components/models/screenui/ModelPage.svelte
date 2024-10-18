<script>
	import { onDestroy, onMount } from 'svelte';
	import { Box } from '@threlte/flex';
	import {
		Text3DGeometry,
		RoundedBoxGeometry,
		ImageMaterial,
		createTransition,
		useCursor,
		HTML
	} from '@threlte/extras';
	import Label from './Label.svelte';
	import { T } from '@threlte/core';
	import { model, modelsStore } from '../../utils/stores';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { spring } from 'svelte/motion';
	import Results from './Results.svelte';
	import Loading from '../../utils/Loading.svelte';
	import * as THREE from 'three';
	import { useLoader } from '@threlte/core';

	const loadCubeTexture = () => {
		return new Promise((resolve, reject) => {
			const loader = new THREE.CubeTextureLoader();
			loader.setPath('/img/button/');

			loader.load(
				['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'],
				(loadedTexture) => {
					resolve(loadedTexture);
				},
				undefined,
				(error) => {
					console.error('Error loading cube texture:', error);
					reject(error);
				}
			);
		});
	};

	export let modelUid;
	let font;
	let rows = 1;
	let columns = 1;
	let itemPerPage = 1;
	let saturation = 0;
	const { onPointerEnter, onPointerLeave, hovering } = useCursor();
	const scale = spring(0.9);
	$: scale.set($hovering ? 1 : 0.9);
	$: saturation = $hovering ? 1 : 0;

	$: modelData = $model;
	let isLoading = true;
	const animDelay = 10;

	const unsubModel = model.subscribe(($model) => {
		modelData = $model;
	});

	const scaleTransition = createTransition((ref, { direction }) => {
		return {
			tick(t) {
				ref.scale.setScalar(t);
			},
			delay: animDelay + (direction === 'in' ? 200 : 0),
			duration: 200,
			easing: direction === 'in' ? cubicOut : cubicIn
		};
	});

	onMount(async () => {
		try {
			isLoading = true;
			await modelData;

			console.log(modelData);
		} catch (error) {
			console.error('Failed to load model data:', error);
		} finally {
			isLoading = false;
		}
	});
	onDestroy(() => {
		unsubModel();
	});
</script>

{#key $model}
	{#await modelData}
		<Loading />
	{:then modelData}
		<Box class="h-full w-full flex-col items-stretch gap-10 p-10">
			<Box class="h-auto w-full flex-1 items-center justify-evenly gap-10">
				<Box class="h-full w-full flex-1">
					{@const index = 1}

					{@const url = modelData.image || null}
					{@const title = modelData.title}
					{@const owner = modelData.owner || null}
					{@const id = modelData.uid}
					{@const thumbZoom = 0.7}

					<Box class="h-full w-full flex-1" let:width let:height>
						<T.Group
							in={scaleTransition}
							out={scaleTransition}
							on:create={({ cleanup }) => {
								cleanup(() => {
									console.log('result cleanup');
								});
							}}
						>
							<T.Mesh
								scale.x={(width / 100) * $scale}
								scale.y={(height / 100) * $scale}
								scale.z={$scale}
								position.z={20}
								on:pointerenter={onPointerEnter}
								on:pointerleave={onPointerLeave}
							>
								<T.PlaneGeometry args={[100, 100, 2]} />

								<ImageMaterial {url} radius={0.1} zoom={thumbZoom} {saturation} class="relative" />
							</T.Mesh>

							<Box class="h-auto w-auto flex-0 items-center justify-center mt-4">
								<Label
									text={title}
									z={25}
									fontStyle="semi-bold"
									fontSize={'l'}
									font="/fonts/Quivira.otf"
									color="#FFFFFF"
								/>
							</Box>
						</T.Group>
					</Box>
				</Box>
			</Box>
		</Box>
	{/await}
	<!-- {#await loadCubeTexture() then map}
		<T.Mesh scale.x={$scale} scale.y={$scale} position={[500, 0, 35]}>
			<T.BoxGeometry args={[100, 100, 2]} />
			<T.MeshBasicMaterial color="white" {map} />
		</T.Mesh>
	{/await} -->
{/key}
