<script>
	import { T, forwardEventHandlers } from '@threlte/core';
	import { RoundedBoxGeometry, Align } from '@threlte/extras';
	import { Box, Flex, tailwindParser } from '@threlte/flex';

	import Circle from './Circle.svelte';
	import Label from './Label.svelte';
	import { fade } from '../../utils/responsivityUtils';
	import { spring } from 'svelte/motion';
	export let title;
	export let width = 800;
	export let height = 800;
</script>

<Flex classParser={tailwindParser} {width} {height} class="flex-col gap-1 p-1" let:reflow >
	<T.Mesh>
		<RoundedBoxGeometry args={[width, height, 20]} radius={6} />
		<T.MeshBasicMaterial color="#0A0F19" transparent opacity={0.5} transition={fade} />
	</T.Mesh>
	<Box class="h-26 pr-53 w-full items-center justify-start gap-5 pl-8" let:height let:width>
		<T.Mesh position.z={10}>
			<RoundedBoxGeometry args={[width, height, 10]} radius={5} />
			<T.MeshBasicMaterial color="#ddd" />
		</T.Mesh>

		<Box class="h-10 w-10">
			<Circle radius={5} color="#FF6057" z={20} />
		</Box>

		<Box class="h-10 w-10">
			<Circle radius={5} color="#FDBD2E" z={20} />
		</Box>
		<Box class="h-10 w-10">
			<Circle radius={5} color="#27C840" z={20} />
		</Box>
		<Box class="h-full w-auto flex-1 items-center justify-center">
			<Label text={title} z={25} fontStyle="semi-bold" fontSize="l" color="#454649" />
		</Box>
	</Box>
	<Box class="h-auto w-auto flex-1" let:width let:height >
		
	
		<slot {width} {height} />
		
	</Box>
</Flex>
