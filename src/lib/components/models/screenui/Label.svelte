<script lang="ts">
    import { Text } from '@threlte/extras'
    import type { ColorRepresentation } from 'three'
    import { useReflow } from '@threlte/flex'
    import { forwardEventHandlers } from '@threlte/core'
    export let text: string
    export let color: ColorRepresentation = 'white'
    export let z = 0
    export let fontStyle = 'regular'
    export let anchorX = '50%'
    export let anchorY = '50%'
    export let fontSize = 'm'
    const fontSizes = {
      xs: 4,
      s: 6,
      m: 8,
      l: 10,
      xl: 12
    }
    $: fontUrl = `/fonts/inter/inter-${fontStyle}.ttf`
    const reflow = useReflow()
  </script>