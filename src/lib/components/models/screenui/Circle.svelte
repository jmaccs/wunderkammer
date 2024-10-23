<script>
	import { T } from '@threlte/core';
	import { interactivity } from '@threlte/extras';
	import { spring } from 'svelte/motion';
	import { sceneActions } from '../../utils/stores';
	
export let color = 'white';
	export let radius = 5;
	export let z = 0;

	interactivity();
	const scale = spring(1);

	function handleClick() {
		sceneActions.toggleScreen(false);
	
	
	}
</script>

<T.Mesh
	position.z={z}
	scale={$scale}
	on:pointerenter={() => scale.set(1.5)}
	on:pointerleave={() => scale.set(1)}
	on:click={handleClick}
>
	<T.CircleGeometry args={[radius]} />
	<T.MeshBasicMaterial {color} />
</T.Mesh>
