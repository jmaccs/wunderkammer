<script>
	import { T } from '@threlte/core';
	import { RoundedBoxGeometry } from '@threlte/extras';
	import { Box, Flex, tailwindParser } from '@threlte/flex';
	import Circle from './Circle.svelte';
	import Label from './Label.svelte';
	import { fade } from '../../utils/responsivityUtils';
	import Scene from '../../Scene.svelte';

	export let title;
	export let width;
	export let height;

	$: contentPadding = width * 0.2;

	
	$: contentClass = `h-auto w-auto flex-1 p-[${contentPadding}px]`;
</script>

<Flex classParser={tailwindParser} {width} {height} class="flex-col gap-1 p-6">
	<T.Mesh>
		<RoundedBoxGeometry args={[width, height, 10]} radius={8} />
		<T.MeshBasicMaterial color="#0A0F19" transparent opacity={0.3} transition={fade} />
	</T.Mesh>

	<Box class="h-20 pr-6 w-full items-center justify-start gap-5 pl-6" let:height let:width>
		<T.Mesh position.z={6}>
			<RoundedBoxGeometry args={[width, height, 10]} radius={2} />
			<T.MeshBasicMaterial color="#ddd" />
		</T.Mesh>

		<Box class="h-4 w-4">
			<Circle radius={4} color="#FF6057" z={20} />
		</Box>

		<Box class="h-4 w-4">
			<Circle radius={4} color="#FDBD2E" z={20} />
		</Box>

		<Box class="h-4 w-4">
			<Circle radius={4} color="#27C840" z={20} />
		</Box>

		<Box class="h-full w-auto flex-1 items-center justify-center">
			<Label text={title} z={20}  fontSize={'xl'} color="#454649" />
		</Box>
	</Box>

	<Box class={contentClass} let:width let:height>
		<slot {width} {height} />
	</Box>
</Flex>
