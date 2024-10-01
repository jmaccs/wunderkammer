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
	position: [-8, 6, 10],
	rotation: [0, 0, 0],
	fov: 40
});

export const macbookValues = writable({
	position: tweened([1.4, 1.22, 0.5], { duration: 1500, easing: cubicOut }),
	rotation: [0, -Math.PI / 2, 0]
});
