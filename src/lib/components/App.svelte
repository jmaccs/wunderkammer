<script>
	import { Canvas } from '@threlte/core';
	import { screenActions } from './utils/stores';
	import Scene from './Scene.svelte';

	let innerWidth;
	let innerHeight;
	$: screenActions.setScreenSize(innerWidth, innerHeight);
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<div>
<Canvas>

	<Scene  />
</Canvas>
</div>
<style>
	div {
	  height: 100%;
	}
  </style>