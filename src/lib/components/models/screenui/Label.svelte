<script>
	import { Text } from '@threlte/extras';
	import { useReflow } from '@threlte/flex';
	
	export let text;
	export let color = 'white';
	export let z = 20;
	export let anchorX = '50%';
	export let anchorY = '50%';
	export let fontSize = 'l';
	export let font = `/fonts/Catrinity.otf`;
	
	const fontSizes = {
		xs: 1,
		s: 2,
		m: 4,
		l: 6,
		xl: 8
	};


	function getScaledSize(size) {
		const baseSize = fontSizes[size];
		if (typeof window === 'undefined') return baseSize;
		
	
		return window.innerWidth <= 768 ? baseSize * 0.8 : baseSize;
	}

	$: scaledFontSize = getScaledSize(fontSize);
	const reflow = useReflow();
</script>

<Text
	font={font}
	position.z={z}
	{text}
	{anchorX}
	{anchorY}
	fontSize={scaledFontSize}
	{color}
	on:sync={reflow}
/>
