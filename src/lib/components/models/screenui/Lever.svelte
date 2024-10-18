<script>
	import { GLTF, useGltfAnimations } from '@threlte/extras';
	import { forwardEventHandlers, T, useThrelte } from '@threlte/core';
	import * as THREE from 'three';

	const { gltf, actions, mixer } = useGltfAnimations();
	const component = forwardEventHandlers();
	const white = new THREE.MeshBasicMaterial({ color: 'white' });

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

<GLTF bind:gltf={$gltf} url="/models/Lever.glb" {...component} on:click={triggerAnimation} />
