<script>
    import { T, forwardEventHandlers } from '@threlte/core'
    import { RoundedBoxGeometry, useCursor } from '@threlte/extras'
    import { Box } from '@threlte/flex'
    import Label from './Label.svelte'
  
    const component = forwardEventHandlers()
  
    let _class
    export { _class as class }
  export let z = 10
    export let text = ''
    export let order= undefined
    
    const { hovering, onPointerEnter, onPointerLeave } = useCursor()
  </script>
  
  <Box
    class={_class}
    let:width
    let:height
    {order}
  >
    <T.Mesh
      bind:this={$component}
      position.z={z}
      on:click={(e) => e.stopPropagation()}
      on:pointerenter={onPointerEnter}
      on:pointerleave={onPointerLeave}
    >
      <RoundedBoxGeometry
        args={[width, height, 10]}
        radius={5}
      />
      <T.MeshBasicMaterial color={$hovering ? '#9D9FA3' : '#404550'} />
  
      <Label
        z={10}
        fontSize="l"
        {text}
      />
    </T.Mesh>
  </Box>
  