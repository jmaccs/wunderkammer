<script>
	import { useProgress } from '@threlte/extras';
	import { tweened } from 'svelte/motion';
	import { fade } from 'svelte/transition';
	import { HTML } from '@threlte/extras';
	const { progress } = useProgress();
	import { T } from '@threlte/core';
	import { MeshBasicMaterial, PlaneGeometry } from 'three';

	const tweenedProgress = tweened($progress, {
		duration: 3000
	});
	$: tweenedProgress.set($progress);
</script>

{#if $tweenedProgress < 1}
	<T.Group
		on:create={({ cleanup }) => {
			cleanup(() => {
				console.log('load cleanup');
			});
		}}
	>
		<HTML>
			<div
				transition:fade|local={{
					duration: 200
				}}
				class="absolute h-auto w-auto max-w-screen rounded-sm opacity-80 flex flex-col bg-gray-600 sepia"
			>
				<div class="bg-gray-50 p-10>">
					<p class="text-gray-800 font-serif text-center text-xl mb-2">Loading</p>
					<div
						class=" border-black border-2 !aspect-video max-w-full max-h-full divide-y divide-current"
					></div>
					<div class="h-full bg-black" />
					width: {$tweenedProgress * 100}%
				</div>
			</div>
		</HTML>
	</T.Group>
{/if}
