<script>
	import { T } from '@threlte/core';
	import { RoundedBoxGeometry } from '@threlte/extras';
	import { Box, Flex, tailwindParser } from '@threlte/flex';
	import Circle from './Circle.svelte';
	import Label from './Label.svelte';
	import { fade } from '../../utils/responsivityUtils';

	export let title;
	export let width;
	export let height;


	$: headerHeight = Math.max(15, height * 0.08);
	$: headerWidth = width * 1.002; 
	$: contentPadding = Math.max(8, width * 0.02);
	$: fontSize = width < 400 ? 'm' : 'l';
	
	$: headerClass = `h-[${headerHeight}px] w-full items-center justify-start gap-2 px-[${contentPadding}px]`;
	$: contentClass = `h-auto w-auto flex-1 p-[${contentPadding}px]`;
</script>

<Flex 
	classParser={tailwindParser} 
	{width} 
	{height} 
	class="flex-col gap-1 p-6" 
	let:reflow
>
	<T.Mesh>
		<RoundedBoxGeometry args={[width, height, 20]} radius={6} />
		<T.MeshBasicMaterial color="#0A0F19" transparent opacity={0.5} transition={fade} />
	</T.Mesh>

	<Box 
		class={headerClass}
		let:height 
		let:width
	>
		<T.Mesh position.z={10}>
			<RoundedBoxGeometry 
				args={[headerWidth, headerHeight, 10]} 
				radius={5} 
			/>
			<T.MeshBasicMaterial color="#ddd" />
		</T.Mesh>

		<Box class="h-6 w-6">
			<Circle radius={4} color="#FF6057" z={30} />
		</Box>

		<Box class="h-6 w-6">
			<Circle radius={4} color="#FDBD2E" z={30} />
		</Box>

		<Box class="h-6 w-6">
			<Circle radius={4} color="#27C840" z={30} />
		</Box>

		<Box class="h-full w-auto flex-1 items-center justify-center">
			<Label 
				text={title} 
				z={30} 
				fontStyle="semi-bold" 
				fontSize={fontSize}
				color="#454649" 
			/>
		</Box>
	</Box>

	<Box 
		class={contentClass}
		let:width 
		let:height
	>
		<slot {width} {height} />
	</Box>
</Flex>
