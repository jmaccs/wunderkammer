<script>
	import { Box, useReflow } from '@threlte/flex';
	import { getAllModels } from '../../utils/api.js';
	import { onMount, createEventDispatcher } from 'svelte';
	import { modelListActions } from '../../utils/stores.js';
	import Results from './Results.svelte';
	import Label from './Label.svelte';
	import { HTML, Text } from '@threlte/extras';

	const dispatch = createEventDispatcher();
	let modelList = [];
	let filteredModels = [];
	let searchTerm = '';
	let isLoading = true;
	export let rows = 2;
	export let columns = 3;
	const reflow = useReflow();

	$: itemsPerPage = rows * columns;
	$: if (searchTerm && modelList.length > 0) {
		filteredModels = modelList.filter(
			(model) =>
				model.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(model.owner && model.owner.toLowerCase().includes(searchTerm.toLowerCase()))
		);
		reflow();
	} else {
		filteredModels = modelList;
	}

	async function loadModels() {
		isLoading = true;
		try {
			const res = await getAllModels();
			modelList = res;
			filteredModels = res;
			modelListActions.setModelList(modelList);
		} catch (error) {
			console.error('Failed to load models:', error);
		} finally {
			isLoading = false;
			reflow();
		}
	}

	onMount(async () => {
		await loadModels();
	});

	function handleSelect(event) {
		dispatch('select', event.detail);
	}
</script>

<Box class="h-full w-full flex-col items-stretch gap-10 p-2">
	<Box class="h-32 w-full flex-0 items-center justify-center">
		<Label text="SEARCH" z={20} fontSize="xxl" color="#FFFFFF" />
		<HTML transform>
			<div class="w-[200px] h-[100px] flex flex-col items-center gap-4">
				<input
					type="text"
					bind:value={searchTerm}
					placeholder="Search models..."
					class="w-[200px] h-[100px] px-8 rounded-lg bg-gray-800 text-white border-4 border-gray-600 focus:outline-none focus:border-blue-500 text-4xl font-bold placeholder-gray-500"
					autofocus
				/>
			</div>
		</HTML>
		<Text text={searchTerm} fontSize={80} color="white" position.z={20} />
	</Box>

	{#if isLoading}
		<Box class="h-full w-full flex-1 items-center justify-center">
			<Label text="Loading models..." z={10} />
		</Box>
	{:else if filteredModels.length === 0}
		<Box class="h-full w-full flex-1 items-center justify-center">
			<Label text="No results found" z={10} />
		</Box>
	{:else}
		{#each new Array(rows) as _, rowIndex}
			<Box class="h-auto w-full flex-1 items-center justify-evenly gap-5">
				{#each new Array(columns) as _, columnIndex}
					<Box class="h-full w-full flex-1">
						{@const index = rowIndex * columns + columnIndex}
						{#if filteredModels[index]}
							{@const model = filteredModels[index]}
							{@const url = model.thumbnail}
							{@const title = model.title}
							{@const categories = model.categories}
							{@const description = model.owner || null}
							{@const id = model.uid}
							{@const thumbZoom = 0.7}

							<Box class="h-full w-full flex-1 p-2" let:width let:height on:sync={reflow}>
								<Results
									on:select={handleSelect}
									{width}
									{height}
									{url}
									{title}
									{description}
									{id}
									{thumbZoom}
									{index}
									{categories}
								/>
							</Box>
						{/if}
					</Box>
				{/each}
			</Box>
		{/each}
	{/if}
</Box>
