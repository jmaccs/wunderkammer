<script>
	import { Box, useReflow, Flex, useDimensions } from '@threlte/flex';
	import { interactivity, transitions, Align } from '@threlte/extras';
	import { T } from '@threlte/core'
	import { getAllModels } from '../../utils/api.js';
	import { onDestroy, onMount, tick } from 'svelte';
	import { setModelStore } from '../../utils/stores.js';
	import Results from './Results.svelte';
	import Button from './Button.svelte';
	import Label from './Label.svelte';
	let modelList = [];
	let isLoading = true;
	export let rows = 4;
	export let columns = 4;
	const { width, height } = useDimensions();
	let page = 1;
	let totalPages = 1;
	let currentPage = [];

	$: itemsPerPage = rows * columns;
	$: offset = (page - 1) * itemsPerPage;
	$: currentPage = modelList.slice(offset, offset + itemsPerPage);

	$: totalPages = Math.ceil(modelList.length / itemsPerPage);

	async function loadModels() {
	
		try {
			const res = await getAllModels();
			modelList = res;
			setModelStore(modelList);
			
			isLoading = false;
		} catch (error) {
			console.error('Failed to load models:', error);
			isLoading = false;
		}
	}

	const { reflow } = useReflow();
	onMount(async () => {
	
		await loadModels()
		
	});
</script>

<Box class="h-full w-full flex-col items-stretch gap-10 p-10" >
	{#each new Array(rows) as _, rowIndex}
		<Box class="h-auto w-full flex-1 items-center justify-evenly gap-10">
			{#each new Array(columns) as _, columnIndex}
				<Box class="h-full w-full flex-1">
					{@const index = rowIndex * columns + columnIndex}
					{#if currentPage[index]}
						{@const model = currentPage[index]}
						{@const url = model.thumbnail}
						{@const title = model.title}
						{@const description = model.description || null}
						{@const id = model.uid}
						{@const thumbZoom = 0.7}

						<Box class="h-full w-full flex-1" let:width let:height >
							<Results
								on:select
								{width}
								{height}
								{url}
								{title}
								{description}
								{id}
								{thumbZoom}
								{index}
							/>
						</Box>
					{/if}
				</Box>
			{/each}
		</Box>
	{/each}

	<Box order={999} class="h-40 w-auto items-center justify-center gap-10">
		<Button
			class="h-full w-auto flex-1"
			z={15}
			text="← PREVIOUS PAGE"
			order={0}
			on:click={() => {
				page = Math.max(1, page - 1);
			}}
		/>

		<Box class="h-full w-auto flex-1" order={1}>
			<Label z={10.1} text={`PAGE: ${page} of ${totalPages}`} />
		</Box>

		<Button
			class="h-full w-auto flex-1"
			z={15}
			text="NEXT PAGE →"
			order={999}
			on:click={() => {
				page = Math.min(10, page + 1);
			}}
		/>
	</Box>
</Box>
