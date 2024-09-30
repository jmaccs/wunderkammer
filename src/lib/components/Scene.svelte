<script>
  import { T, useThrelte } from '@threlte/core'
  import {getModels} from './utils/api.js';
  import { onMount } from 'svelte';
  import { ContactShadows, Float, Grid, OrbitControls } from '@threlte/extras'
  import Model from './models/Model.svelte';
  export let selectedModelId = '52b3e0bcc90f4cba930b336dbdba63c0'; 
  let modelUrl = '';
  onMount(async () => {
      if (selectedModelId) {
        modelUrl = await getModels(selectedModelId);
      }
    });
</script>

<T.PerspectiveCamera
  makeDefault
  position={[-10, 10, 10]}
  fov={15}
>
  <OrbitControls
    autoRotate
    enableZoom={false}
    enableDamping
    autoRotateSpeed={0.5}
    target.y={1.5}
  />
</T.PerspectiveCamera>

<T.DirectionalLight
  intensity={0.8}
  position.x={5}
  position.y={10}
/>
<T.AmbientLight intensity={0.2} />

<Grid
  position.y={-0.001}
  cellColor="#ffffff"
  sectionColor="#ffffff"
  sectionThickness={0}
  fadeDistance={25}
  cellSize={2}
/>

<ContactShadows
  scale={10}
  blur={2}
  far={2.5}
  opacity={0.5}
/>

<Float
  floatIntensity={1}
  floatingRange={[0, 1]}
>
{#if modelUrl}
<Model modelUrl={modelUrl} />
{/if}
</Float>


