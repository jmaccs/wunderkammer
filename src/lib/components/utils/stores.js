import { writable } from 'svelte/store';
import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';

export const model = writable(null);

export const modelValues = writable({
	scale: 0.01,
	position: [0, 0, 0],
	rotation: [0, 0, 0]
});

export const cameraValues = writable({
	position: [-15, 6, 10],
	rotation: [0, 0, 0],
	fov: 40
});

export const macbookValues = writable({
	position: tweened([1.4, 1.22, 0.5], { duration: 1500, easing: cubicOut }),
	rotation: [0, -Math.PI / 2, 0]
});

export const screenValue = writable({
	screenOpen: false,
	currentPage: null
});

export const models = writable([])


export function setCurrentPage(id) {
	screenValue.update((state) => ({ ...state, currentPage: id }));
}




export function toggleScreen(bool) {
	screenValue.update((state) => ({ ...state, screenOpen: bool }));
}

export const winamp = writable({
	winampOpen: undefined,
	isPlaying: undefined
});

// export function toggleWinamp(bool) {
// 	winamp.update((state) => ({ ...state, winampOpen: bool }));
// }

// export function togglePlaying(bool) {
// 	winamp.update((state) => ({ ...state, isPlaying: bool }));
// }

