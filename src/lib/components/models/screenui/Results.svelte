<script>
	import { T, forwardEventHandlers } from '@threlte/core';
	import { createTransition, useCursor, HTML, ImageMaterial } from '@threlte/extras';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { spring } from 'svelte/motion';
	import { onDestroy, createEventDispatcher, onMount } from 'svelte';
	import { useReflow, Box } from '@threlte/flex';
	import { modelActions } from '../../utils/stores';
	import Label from './Label.svelte';

	const component = forwardEventHandlers();
	export let title;
	export let url;
	export let description;
	export let id;
	export let index;
	export let thumbZoom = 0.7;
	export let width;
	export let height;
	export let categories;

	$: boxSize = {
		width: Math.round(width / 20),
		height: Math.round(((width / 20) * 3) / 4)
	};

	let saturation = 0;
	const { onPointerEnter, onPointerLeave, hovering } = useCursor();
	const scale = spring(0.9);
	$: scale.set($hovering ? 1 : 0.9);
	$: saturation = $hovering ? 1 : 0;

	const animDelay = index * 10;

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

	const dispatch = createEventDispatcher();
	
	function handleClick(id) {
		dispatch('select', { value: id });
	}

	const reflow = useReflow();
	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	onDestroy(() => {
		mounted = false;
		scale.set(0.9);
	});
</script>

{#if mounted}
	<T.Group
		in={scaleTransition}
		out={scaleTransition}
		on:create={({ cleanup }) => {
			cleanup(() => {
				scale.set(0.9);
			});
		}}
	>
		<T.Mesh
			scale.x={boxSize.width * $scale}
			scale.y={boxSize.height * $scale}
			scale.z={$scale}
			position.z={10}
			on:pointerenter={onPointerEnter}
			on:pointerleave={onPointerLeave}
			on:click={() => {
				handleClick(id);
			}}
		>
			<T.PlaneGeometry args={[20, 20, 2]} />
			<ImageMaterial {url} radius={0.2} zoom={thumbZoom} {saturation} class="relative" />
		</T.Mesh>

		{#if $hovering && description}
			<HTML in={scaleTransition} out={scaleTransition}>
				<div class="absolute h-auto w-auto max-w-screen opacity-80 text-wrap ">
					<div
						class="bg-gray-50 p-10 border-black border-2 rounded-md !aspect-video max-w-full max-h-full divide-y divide-current"
					>
						<div>
							<h1 class="text-gray-800  text-center text-sm mb-2">{description}</h1>
						</div>
						<div class="p-4">
							<p>{title}</p>
						</div>
					</div>
				</div>
			</HTML>
		{/if}

		<Box class="h-auto w-auto flex-0 items-center justify-center mt-8">
			<Label text={title} z={10} fontSize={'l'} color="#FFFFFF" />
		</Box>
	</T.Group>
{/if}
