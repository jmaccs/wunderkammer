<!--
Auto-generated by: https://github.com/threlte/threlte/tree/main/packages/gltf
Command: npx @threlte/gltf@2.0.3 static/models/Desktop.glb -T -k
-->

<script>
	import { Group } from 'three';
	import { T, forwardEventHandlers } from '@threlte/core';
	import { Align, useGltf } from '@threlte/extras';
	import { desktop } from '../utils/stores';
	import { onMount } from 'svelte';
	export const ref = new Group();

	const gltf = useGltf('/models/Desktop-transformed.glb', { useDraco: true });

	const component = forwardEventHandlers();
	onMount(() => {
		desktop.set(ref);
	});
</script>

<T
	is={ref}
	dispose={false}
	{...$$restProps}
	bind:this={$component}
	scale={4}
	position={[0, 3, 15]}
	rotation.y={-Math.PI / 2}
>
	{#await gltf}
		<slot name="fallback" />
	{:then gltf}
		<T.Group name="Sketchfab_model">
			<T.Mesh
				name="Object_10"
				geometry={gltf.nodes.Object_10.geometry}
				material={gltf.materials.light_beige}
				castShadow
				receiveShadow
			/>
			<T.Mesh
				name="Object_11"
				geometry={gltf.nodes.Object_11.geometry}
				material={gltf.materials.lighter_beige}
				castShadow
				receiveShadow
			/>
			<T.Mesh
				name="Object_4"
				geometry={gltf.nodes.Object_4.geometry}
				material={gltf.materials.dark_beige}
				castShadow
				receiveShadow
			/>
			<T.Mesh
				name="Object_5"
				geometry={gltf.nodes.Object_5.geometry}
				material={gltf.materials.dark_grey}
				castShadow
				receiveShadow
			/>
			<T.Mesh
				name="Object_6"
				geometry={gltf.nodes.Object_6.geometry}
				material={gltf.materials.darker_beige}
				castShadow
				receiveShadow
			/>
			<T.Mesh
				name="Object_7"
				geometry={gltf.nodes.Object_7.geometry}
				material={gltf.materials.darker_beige}
				castShadow
				receiveShadow
			/>
			<T.Mesh
				name="Object_8"
				geometry={gltf.nodes.Object_8.geometry}
				material={gltf.materials.darkest_beige}
				castShadow
				receiveShadow
			/>
			<T.Mesh
				name="Object_9"
				geometry={gltf.nodes.Object_9.geometry}
				material={gltf.materials.darkest_beige}
				castShadow
				receiveShadow
			/>

			<T.Mesh
				name="Screen"
				geometry={gltf.nodes.Screen.geometry}
				material={gltf.materials.dark_grey}
				castShadow
				receiveShadow
			></T.Mesh>
		</T.Group>
	{:catch error}
		<slot name="error" {error} />
	{/await}

	<slot {ref} />
</T>
