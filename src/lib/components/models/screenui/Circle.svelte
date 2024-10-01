<script>
    import { T } from '@threlte/core'
    export let color = 'white'
    export let radius = 5
    export let z = 0
  </script>
  <T.Mesh position.z={z}>
    <T.CircleGeometry args={[radius]} />
    <T.MeshBasicMaterial {color} />
  </T.Mesh>