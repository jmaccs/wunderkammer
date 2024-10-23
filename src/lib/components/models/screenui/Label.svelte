<script>
	import { Text } from '@threlte/extras';

	import { useReflow } from '@threlte/flex';
	export let text;
	export let color = 'white';
	export let z = 20;
	export let anchorX = '50%';
	export let anchorY = '50%';
	export let fontSize = 'l';
	const fontSizes = {
		xs: 4,
		s: 6,
		m: 8,
		l: 10,
		xl: 12
	};
	export let font = `/fonts/Catrinity.otf`;
	const reflow = useReflow();
</script>

<Text
	font={font}
	position.z={20}
	{text}
	{anchorX}
	{anchorY}
	fontSize={fontSizes[fontSize]}
	{color}
	on:sync={reflow}
/>
