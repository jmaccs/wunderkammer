<script>
	import {
		Align,
		FakeGlowMaterial,
		ImageMaterial,
		interactivity,
		useCursor,
		Text3DGeometry
	} from '@threlte/extras';
	import { useReflow, Box } from '@threlte/flex';
	import { T, forwardEventHandlers } from '@threlte/core';
	import { onDestroy, onMount, createEventDispatcher } from 'svelte';
	import { spring } from 'svelte/motion';

	import Results from './Results.svelte';
	import { Group } from 'three';

	import Label from './Label.svelte';

	export let menuOptions = [
		{
			optionName: 'Paintings',
			optionThumbnail: '/img/paintings.jpg',
			type: 'menu',
			id: 'paintings',
			thumbZoom: 1.5
		},
		{
			optionName: 'Models',
			optionThumbnail: '/img/models.jpg',
			type: 'menu',
			id: 'models',
			thumbZoom: 0.3
		},
		{
			optionName: 'Search',
			optionThumbnail: '/img/search.jpg',
			type: 'menu',
			id: 'search',
			thumbZoom: 0.9
		},
		{
			optionName: 'Collection',
			optionThumbnail: '/img/winamp.png',
			type: 'menu',
			id: 'collection',
			thumbZoom: 0.2
		}
	];
	let saturation = 1;
	const { onPointerEnter, onPointerLeave, hovering } = useCursor();
	let currentPage;

	interactivity();
	let value = '';

	const reflow = useReflow();
	export const ref = new Group();
	const component = forwardEventHandlers();

	const dispatch = createEventDispatcher();
	
	function handleClick(id) {
		dispatch('select', { value: id });
	}

	onDestroy(() => {
		console.log('menu destroyed');
	});
</script>

<Box class="h-full w-full flex-col items-stretch gap-10 p-10">
	{#each menuOptions as option, i (option.id)}
		{@const index = i}
		{@const description = null}
		{@const url = option.optionThumbnail}
		{@const title = option.optionName}
		{@const id = option.id}
		{@const thumbZoom = option.thumbZoom}
		<Box class="h-full w-full flex-1 " let:width let:height>
			<Results 
			{width}
			{height}
			{url}
			{title}
			{description}
			{id}
			{thumbZoom}
			{index}
			on:select
			/>
		</Box>
	{/each}
</Box>