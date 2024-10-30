<script>
	import { Box, useReflow, useDimensions } from '@threlte/flex';
	import { getAllModels } from '../../utils/api.js';
	import { onMount } from 'svelte';
	import { modelListActions, modelList as modelListStore } from '../../utils/stores.js';
	import Results from './Results.svelte';
	import Button from './Button.svelte';
	import Label from './Label.svelte';
	
	let isLoading = true;
	export let rows = 3;
	export let columns = 3;
	const { width, height } = useDimensions();
	let page = 1;
	let totalPages = 1;
	let currentPage = [];
	const reflow = useReflow();

	$: itemsPerPage = rows * columns;
	$: offset = (page - 1) * itemsPerPage;
	$: if ($modelListStore.length > 0) {
		currentPage = $modelListStore.slice(offset, offset + itemsPerPage);
		reflow();
	}
	$: totalPages = Math.ceil($modelListStore.length / itemsPerPage);

	async function loadModels() {
		isLoading = true;
		try {
			const res = await getAllModels();
			modelListActions.setModelList(res);
		} catch (error) {
			console.error('Failed to load models:', error);
		} finally {
			isLoading = false;
			reflow();
		}
	}

	onMount(async () => {
		if ($modelListStore.length === 0) {
			await loadModels();
		} else {
			isLoading = false;
		}
	});
</script>

<Box class="h-full w-full flex-col items-stretch gap-10 p-2 ">
	{#if isLoading}
		<Box class="h-full w-full flex-1 items-center justify-center">
			<Label text="Loading models..." z={10} />
		</Box>
	{:else}
		{#each new Array(rows) as _, rowIndex}
			<Box class="h-auto w-full flex-1 items-center justify-evenly gap-5">
				{#each new Array(columns) as _, columnIndex}
					<Box class="h-full w-full flex-1">
						{@const index = rowIndex * columns + columnIndex}
						{#if currentPage[index]}
							{@const model = currentPage[index]}
							{@const url = model.thumbnail}
							{@const title = model.title +" | " + model.owner}
							{@const description = model.description || null}
							
							{@const id = model.uid}
							{@const thumbZoom = 0.7}

							<Box class="h-full w-full flex-1 p-2" let:width let:height on:sync={reflow}>
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

		<Box order={999} class="h-10 w-auto items-end justify-center gap-10">
			<Button
				class="h-full w-auto flex-1 "
				z={10}
				text="← PREVIOUS PAGE"
				order={0}
				on:click={() => {
					page = Math.max(1, page - 1);
				}}
			/>

			<Box class="h-full w-auto flex-1" order={1}>
				<Label z={10} text={`PAGE: ${page} of ${totalPages}`} />
			</Box>

			<Button
				class="h-full w-auto flex-1 text-sm"
				z={10}
				text="NEXT PAGE →"
				order={999}
				on:click={() => {
					page = Math.min(10, page + 1);
				}}
			/>
		</Box>
	{/if}
</Box>
