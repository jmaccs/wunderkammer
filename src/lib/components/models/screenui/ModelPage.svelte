<script>
	import { Box } from '@threlte/flex';
	import { ImageMaterial, createTransition, useCursor } from '@threlte/extras';
	import Label from './Label.svelte';
	import { T, forwardEventHandlers } from '@threlte/core';
	import { selectedModel } from '../../utils/stores';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { spring } from 'svelte/motion';
	import { Group } from 'three';
	import Button from './Button.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	const { onPointerEnter, onPointerLeave, hovering } = useCursor();
	const scale = spring(0.9);
	$: scale.set($hovering ? 1 : 0.9);
	$: saturation = $hovering ? 1 : 0;
	export const ref = new Group();
	const animDelay = 10;

	const component = forwardEventHandlers();

	const scaleTransition = createTransition((ref, { direction }) => ({
		tick(t) {
			ref.scale.setScalar(t);
		},
		delay: animDelay + (direction === 'in' ? 200 : 0),
		duration: 200,
		easing: direction === 'in' ? cubicOut : cubicIn
	}));
</script>

{#if $selectedModel}
	<Box class="h-full w-full flex-col items-stretch gap-10 p-2">
		<Box class="h-full w-full flex-1" let:width let:height>
			<T.Group
				in={scaleTransition}
				out={scaleTransition}
				on:create={({ cleanup }) => {
					cleanup(() => {
						console.log('Model cleanup');
					});
				}}
				bind:this={$component}
				{...$$restProps}
			>
				<T.Mesh
					scale.x={(width / 100) * $scale}
					scale.y={(height / 100) * $scale}
					scale.z={$scale}
					position.z={20}
					on:pointerenter={onPointerEnter}
					on:pointerleave={onPointerLeave}
					on:click={() => dispatch('model')}
				>
					<T.PlaneGeometry args={[80, 80, 2]} />
					<ImageMaterial
						url={$selectedModel.image}
						radius={0.1}
						zoom={1}
						{saturation}
						class="relative"
					/>
				</T.Mesh>
			</T.Group>
		</Box>
				<Box order={999} class="h-30 w-auto items-end justify-center gap-10">
					<Button
						class="h-full w-auto flex-1 "
						z={20}
						text="← PREVIOUS PAGE"
						order={0}
						on:click={() => dispatch('back')}
					/>
		
					<Box class="h-full w-auto flex-1" order={1}>
						<Label z={20} text={$selectedModel.title} />
					</Box>
		
					<Button
						class="h-full w-auto flex-1 text-sm"
						z={20}
						text="LOAD MODEL"
						order={999}
						on:click={() => dispatch('model')}
					/>
				</Box>
					
				
		
	</Box>
{/if}
