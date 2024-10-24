<script>
	import { Text } from '@threlte/extras';
	import { useReflow } from '@threlte/flex';
	
	export let text;
	export let color = 'white';
	export let z = 30;
	export let anchorX = '50%';
	export let anchorY = '50%';
	export let fontSize = 'l';
	export let font = `/fonts/Catrinity.otf`;
	
	const fontSizes = {
		xs: 4,
		s: 6,
		m: 8,
		l: 10,
		xl: 12
	};

	// Simple window width based scaling
	function getScaledSize(size) {
		const baseSize = fontSizes[size];
		if (typeof window === 'undefined') return baseSize;
		
		// Scale down for smaller screens
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
