<script>
	import { T } from '@threlte/core';
	import { Box, Flex, tailwindParser } from '@threlte/flex';
	import { HTML } from '@threlte/extras';
	import Window from './Window.svelte';
	import { logStore } from '../../utils/stores.js';
	import { fade, fly } from 'svelte/transition';

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
</script>

<T.Group>
	<HTML transform occlude>
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
	</HTML>
</T.Group>

<style>
	.logs-container {
		background: #1a1a1a;
		border-radius: 4px;
		padding: 1rem;
		max-height: 300px;
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
