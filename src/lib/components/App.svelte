<script>
	import { Canvas } from '@threlte/core';

	import Scene from './Scene.svelte';



 let innerWidth
 let innerHeight
</script>


<svelte:window bind:innerWidth bind:innerHeight />
	<Canvas>
		
			<Scene {innerWidth} {innerHeight} />
		
	</Canvas>

