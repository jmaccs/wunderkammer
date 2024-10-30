<script>
	import { Canvas } from '@threlte/core';
	import { screenActions } from './utils/stores';
	import Scene from './Scene.svelte';
	import { logStore } from './utils/stores.js';
	import { fade } from 'svelte/transition';
	import { tweened } from 'svelte/motion';
	import { Pane, Slider, Folder, Checkbox } from 'svelte-tweakpane-ui';
	import { modelTransform, sceneActions } from './utils/stores.js';
	import { useProgress } from '@threlte/extras';
	import { onDestroy } from 'svelte';

	const { progress } = useProgress();
	let logContainer;

	$: visibleLogs = $logStore

	$: if (logContainer) {
		logContainer.scrollTop = logContainer.scrollHeight;
	}

	const tweenedProgress = tweened($progress, {
		duration: 6000
	});
	$: tweenedProgress.set($progress);

	$: if ($progress === 1) {
		setTimeout(() => {
			logStore.clear();
			visibleLogs = [];
		}, 5000);
	}

	let innerWidth;
	let innerHeight;
	$: screenActions.setScreenSize(innerWidth, innerHeight);

	let scale = $modelTransform.scale;
	let positionX = $modelTransform.position[0];
	let positionY = $modelTransform.position[1];
	let positionZ = $modelTransform.position[2];
	let rotationX = $modelTransform.rotation[0];
	let rotationY = $modelTransform.rotation[1];
	let rotationZ = $modelTransform.rotation[2];
	let autoRotate = $modelTransform.autoRotate;

	$: sceneActions.updateTransform({
		scale,
		position: [positionX, positionY, positionZ],
		rotation: [rotationX, rotationY, rotationZ],
		autoRotate
	});

	onDestroy(() => {
		logStore.clear();
	});
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<Pane title="Model Controls" expanded={false} position="bottom-right">
	<Slider label="Scale" bind:value={scale} min={0.1} max={5} step={0.1} />
	<Folder title="Position">
		<Slider label="X" bind:value={positionX} min={-50} max={50} step={0.1} />
		<Slider label="Y" bind:value={positionY} min={-50} max={50} step={0.1} />
		<Slider label="Z" bind:value={positionZ} min={-50} max={50} step={0.1} />
	</Folder>
	<Folder title="Rotation">
		<Slider label="X" bind:value={rotationX} min={-Math.PI} max={Math.PI} step={0.1} />
		<Slider label="Y" bind:value={rotationY} min={-Math.PI} max={Math.PI} step={0.1} />
		<Slider label="Z" bind:value={rotationZ} min={-Math.PI} max={Math.PI} step={0.1} />
	</Folder>
	<Checkbox label="Auto Rotate" bind:value={autoRotate} />
</Pane>

<div class="h-full relative">
	{#key visibleLogs.length}
		{#if visibleLogs.length > 1}
			<div
				class="absolute inset-x-0 top-0 h-32 bg-slate-200/80 backdrop-blur-sm overflow-y-auto border-black border-4"
				bind:this={logContainer}
			>
				<slot name="loading">
					{#each visibleLogs as log (log.id)}
						<div
							class="p-2 {log.type === 'error' ? 'text-red-500' : 'text-white'}"
							transition:fade={{ duration: 200 }}
						>
							<span class="text-xs opacity-50">{log.timestamp}</span>
							<div class="flex flex-col gap-4 items-center font-mono text-lg">
								<span>{log.message}</span>
							</div>
							{#if $tweenedProgress < 1}
								<div
									transition:fade|local={{
										duration: 200
									}}
									class="w-full bg-gray-200 rounded-full h-2.5 mt-2"
								>
									<div
										class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
										style="width: {$tweenedProgress * 100}%"
									/>
								</div>
							{/if}
						</div>
					{/each}
				</slot>
			</div>
		{/if}
	{/key}
	<Canvas>
		<Scene {innerWidth} {innerHeight} />
	</Canvas>
</div>
