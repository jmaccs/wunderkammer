<script>
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
	import * as THREE from 'three'
	

</script>

<div class="w-full h-screen flex flex-col sm:flex-row">


  

	<div class="flex-grow relative">
	
	  <div class="absolute inset-0">
	
		<Canvas>
			<Scene />
		</Canvas>
	  </div>
	</div>


</div>

