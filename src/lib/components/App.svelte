<script>
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';

	import * as THREE from 'three';
	import { onMount } from 'svelte';
	let canvasElement;
</script>


	<Canvas>
	
		<Scene />
	
	</Canvas>
