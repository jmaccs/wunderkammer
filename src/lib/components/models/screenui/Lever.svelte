<script>
	import { GLTF, useGltfAnimations, createTransition } from '@threlte/extras';
	import { forwardEventHandlers, T, useThrelte } from '@threlte/core';
	import * as THREE from 'three';
	import { cubicOut } from 'svelte/easing';
	const { gltf, actions, mixer } = useGltfAnimations();
	const component = forwardEventHandlers();
	const white = new THREE.MeshBasicMaterial({ color: 'white' });
	const fly = createTransition((ref) => {
    return {
      tick(t) {
        // t is [0,1] and needs to be converted to [1,0]
        t = 1 - t
        ref.position.y = t
	
      },
      easing: cubicOut,
      duration: 2000
    }
  })
	export const triggerAnimation = () => {
		const crankAction = $actions['Crank'];

		if (crankAction) {
			crankAction.loop = THREE.LoopOnce;
			crankAction.clampWhenFinished = true;

			crankAction.paused = false;

			crankAction.play();
		}
	};
</script>

<GLTF bind:gltf={$gltf} url="/models/Lever.glb" {...component} on:click={triggerAnimation} in={fly} />
