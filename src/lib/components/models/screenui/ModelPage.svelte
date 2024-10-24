<script>

	import { Box } from '@threlte/flex';
	import { ImageMaterial, createTransition, useCursor } from '@threlte/extras';
	import Label from './Label.svelte';
	import { T, forwardEventHandlers } from '@threlte/core';
	import { selectedModel } from '../../utils/stores';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { spring } from 'svelte/motion';
	import { Group } from 'three';
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
		<Box class="h-full w-full flex-col items-stretch gap-10 p-10"  bind:this={$component}>
			<Box class="h-auto w-full flex-1 items-center justify-evenly gap-10">
				<Box class="h-full w-full flex-1">
					<Box class="h-full w-full flex-1" let:width let:height>
						<T.Group
							in={scaleTransition}
							out={scaleTransition}
							on:create={({ cleanup }) => {
								cleanup(() => {
									console.log('Model cleanup');
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
								<ImageMaterial 
									url={$selectedModel.image} 
									radius={0.1} 
									zoom={0.7} 
									saturation={saturation} 
									class="relative" 
								/>
							</T.Mesh>
	
							<Box class="h-auto w-auto flex-0 items-center justify-center mt-4">
								<Label
									text={$selectedModel.title}
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
	{/if}
