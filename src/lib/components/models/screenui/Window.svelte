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
	$: windowSize = {
    width: Math.min(Math.round(width / 1.5), 300),
    height: Math.round((width / 1.5) * 3 / 4)
  };
	$: contentPadding = width * 0.2;

  	$: console.log(windowSize)
	$: contentClass = `h-auto w-auto flex-1 p-[${contentPadding}px]`;
</script>

<Flex classParser={tailwindParser} width={windowSize.width} height={windowSize.height} class="flex-col gap-1 p-6">
	<T.Mesh>
		<RoundedBoxGeometry args={[windowSize.width, windowSize.height, 10]} radius={2} />
		<T.MeshBasicMaterial color="#0A0F19" transparent opacity={0.3} transition={fade} />
	</T.Mesh>

	<Box class="h-6 pr-2 w-full items-center justify-start gap-2 pl-2" let:height let:width>
		<T.Mesh position.z={6}>
			<RoundedBoxGeometry args={[windowSize.width, height, 2]} radius={2} />
			<T.MeshBasicMaterial color="#ddd" />
		</T.Mesh>

		<Box class="h-2 w-2">
			<Circle radius={1} color="#FF6057" z={10} />
		</Box>

		<Box class="h-2 w-2">
			<Circle radius={1} color="#FDBD2E" z={10} />
		</Box>

		<Box class="h-2 w-2">
			<Circle radius={1} color="#27C840" z={10} />
		</Box>

		<Box class="h-full w-auto flex-1 items-center justify-center">
			<Label text={title} z={10} fontStyle="semi-bold" fontSize={'m'} color="#454649" />
		</Box>
	</Box>

	<Box class={contentClass} let:width let:height>
		<slot width={width} {height} />
	</Box>
</Flex>
