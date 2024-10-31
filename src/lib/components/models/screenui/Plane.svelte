<script>
	import { T } from '@threlte/core';
	import { HTML } from '@threlte/extras';
	import { onMount } from 'svelte';

	export let height;
	export let width;

	export let uid;

	onMount(() => {
		const iframe = document.getElementById('api-frame');

		// Wait for Sketchfab to be defined
		const initViewer = () => {
			if (typeof Sketchfab !== 'undefined') {
				const client = new Sketchfab(iframe);

				client.init(uid, {
					success: function onSuccess(api) {
						api.start();
						api.addEventListener('viewerready', function () {
							console.log('Viewer is ready');
						});
					},
					error: function onError() {
						console.log('Viewer error');
					}
				});
			} else {
				// If Sketchfab isn't loaded yet, try again in 100ms
				setTimeout(initViewer, 100);
			}
		};

		initViewer();
	});
</script>

<svelte:head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>wunderkammer</title>
	<script
		type="text/javascript"
		src="https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js"
		async
		defer
	></script>
</svelte:head>

<HTML  transform>
	<div style="width: 100%; height: 100%; position: absolute;">
		<iframe
			src=""
			id="api-frame"
			allow="autoplay"
			execution-while-out-of-viewport
			execution-while-not-rendered
			web-share
			mozallowfullscreen="true"
			webkitallowfullscreen="true"
			class="w-auto "
		/>
	</div>
</HTML>

<style>
	:global(iframe) {
		width: 100% !important;
		height: 100% !important;
		min-width: 4000px;
		min-height: 3000px;
	}
</style>
