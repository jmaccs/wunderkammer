<script>
	import { onDestroy, onMount } from 'svelte';
	import { Box } from '@threlte/flex';
	import {
		Text,
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
	import Loading from '../../utils/Loading.svelte';

	export let modelUid;
	let modelData = null;

	const { onPointerEnter, onPointerLeave, hovering } = useCursor();
	const scale = spring(0.9);
	$: scale.set($hovering ? 1 : 0.9);
	$: saturation = $hovering ? 1 : 0;
	let isLoading = true;
	const animDelay = 10;

    function setModel(uid) {

    modelsStore.subscribe((models) => {
        if (!models || models.length === 0) return;

      
        const foundModel = models.find((model) => model.uid === uid);

        
        if (foundModel) {
            model.set(foundModel);
        }
    });
}
	const unsubModel = model.subscribe(($model) => {
		modelData = $model;
        console.log(modelData)
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

			setModel(modelUid);
            
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

<Box class="h-full w-full flex-1" let:height let:width>
	{#await modelData}
		<T.Group
			in={scaleTransition}
			out={scaleTransition}
			on:create={({ cleanup }) => {
				cleanup(() => {
					console.log('result cleanup');
				});
			}}
		>
			<!-- {@const user = modelData.user?.displayName} -->
			{@const url = modelData.thumbnail}
			{@const title = modelData.title}
			{@const description = modelData.description || null}

			{#if url}
				<T.Mesh position.z={30}>
					<RoundedBoxGeometry args={[200, 200, 2]} />
					<ImageMaterial {url} zoom={0.5} radius={0.1} class="relative" />
				</T.Mesh>
				<Text text={title} anchorX="center" />
			{/if}
			{#if description}
            <HTML in={scaleTransition} out={scaleTransition}>
				<div
					class="absolute h-auto w-auto max-w-screen rounded-sm opacity-80 text-wrap bg-gray-600 sepia"
				>
					<div
						class="bg-gray-50 p-10 border-black border-2 !aspect-video max-w-full max-h-full divide-y divide-current"
					>
						<div>
							<h1 class="text-gray-800 font-serif text-center text-xl mb-2">{title}</h1>
						</div>
						<div class="p-4">
							<p>{description}</p>
						</div>
					</div>
				</div>
			</HTML>
			{/if}
		</T.Group>
	{:catch error}
		<p>Error loading model data: {error.message}</p>
	{/await}
</Box>
