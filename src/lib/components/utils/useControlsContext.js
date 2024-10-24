import { useThrelteUserContext } from '@threlte/core';
import { writable } from 'svelte/store';

export const useControlsContext = () => {
	return useThrelteUserContext('threlte-controls', {
		orbitControls: writable(undefined)
	});
};
