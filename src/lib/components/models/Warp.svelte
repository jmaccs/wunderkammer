<script>
	import { T, useTask } from '@threlte/core';
	import * as THREE from 'three';
	import VertexShader from './shaders/vertex.glsl?raw';
	import FragmentShader from './shaders/fragment.glsl?raw';



	const geometry = new THREE.PlaneGeometry(1, 1, 1,);
   
	const warpMaterial = new THREE.ShaderMaterial({
		uniforms: {
			uTime: { value: 0 },
			uColorStart: { value: new THREE.Color('#179FFF') },
			uColorEnd: { value: new THREE.Color('#F280D0') }
		},
		vertexShader: VertexShader,
		fragmentShader: FragmentShader,
        transparent: true
	});
	const warpMesh = new THREE.Mesh(geometry, warpMaterial);
	
	useTask((delta) => {
		warpMaterial.uniforms.uTime.value += delta;

	});
</script>

<T is={warpMesh} position={[0, 1.5, -2.4]} scale={2} rotation.y={-.5} />

