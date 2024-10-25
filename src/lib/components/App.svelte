<script>
	import { Canvas } from '@threlte/core';
	import { screenActions } from './utils/stores';
	import Scene from './Scene.svelte';
	import { logStore } from './utils/stores.js';
	import { fade, fly } from 'svelte/transition';
	import {Pane, Slider, Folder} from 'svelte-tweakpane-ui';
	import { sceneTransform, sceneActions } from './utils/stores.js';
	
	let logContainer;

	$: visibleLogs = $logStore.slice(-50);

	$: if (logContainer) {
		logContainer.scrollTop = logContainer.scrollHeight;
	}

	const logColors = {
		info: '#ffffff',
		error: '#ff5555',
		progress: '#4CAF50'
	};
	let innerWidth;
	let innerHeight;
	$: screenActions.setScreenSize(innerWidth, innerHeight);

	let scale = $sceneTransform.scale;
	let positionX = $sceneTransform.position[0];
	let positionY = $sceneTransform.position[1];
	let positionZ = $sceneTransform.position[2];
	let rotationX = $sceneTransform.rotation[0];
	let rotationY = $sceneTransform.rotation[1];
	let rotationZ = $sceneTransform.rotation[2];

	$: sceneActions.updateTransform({
		scale,
		position: [positionX, positionY, positionZ],
		rotation: [rotationX, rotationY, rotationZ]
	});
</script>

<!-- {#if visibleLogs.length > 1}
	<div class="logs-container" bind:this={logContainer}>
		{#each visibleLogs as log (log.id)}
			<div
				class="log-entry"
				class:error={log.type === 'error'}
				class:progress={log.type === 'progress'}
				transition:fade={{ duration: 200 }}
			>
				<span class="timestamp">{log.timestamp}</span>

				{#if log.type === 'progress'}
					<div class="progress-entry">
						<span>{log.message}</span>
						<div class="progress-bar">
							<div class="progress-fill" style="width: {log.progress}%"></div>
						</div>
						<span class="progress-value">{log.progress.toFixed(1)}%</span>
					</div>
				{:else}
					<span>{log.message}</span>
				{/if}
			</div>
		{/each}
	</div>
{/if} -->

<!-- <Pane title="Model Controls" expanded={false} position="bottom-right">
	<Slider label="Scale" bind:value={scale} min={0.1} max={5} step={0.1} />
	<Folder title="Position">
		<Slider label="X" bind:value={positionX} min={-10} max={10} step={0.1} />
		<Slider label="Y" bind:value={positionY} min={-10} max={10} step={0.1} />
		<Slider label="Z" bind:value={positionZ} min={-10} max={10} step={0.1} />
	</Folder>
	<Folder title="Rotation">
		<Slider label="X" bind:value={rotationX} min={-Math.PI} max={Math.PI} step={0.1} />
		<Slider label="Y" bind:value={rotationY} min={-Math.PI} max={Math.PI} step={0.1} />
		<Slider label="Z" bind:value={rotationZ} min={-Math.PI} max={Math.PI} step={0.1} />
	</Folder>
</Pane> -->

<svelte:window bind:innerWidth bind:innerHeight />
<div class="scene">
	<Canvas>
		<Scene />
	</Canvas>
</div>

<style>
	.scene {
		height: 100%;
		position:relative
	}
	.logs-container {
		background: #1a1a1a;
		border-radius: 4px;
		padding: 1rem;
		width: full;
		height:full;
		overflow-y: auto;
		font-family: monospace;
		color: #e0e0e0;
	}

	.log-entry {
		padding: 0.25rem 0;
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.timestamp {
		color: #666;
		font-size: 0.9em;
	}

	.error {
		color: #ff5555;
	}

	.progress-entry {
		flex: 1;
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.progress-bar {
		flex: 1;
		height: 6px;
		background: #333;
		border-radius: 3px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: #4caf50;
		transition: width 0.3s ease;
	}

	.progress-value {
		min-width: 4em;
		text-align: right;
	}
</style>
