import { writable } from 'svelte/store';
import {  spring } from 'svelte/motion';


export const modelValues = writable({
	scale: 1,
	position: [0, 1, -4],
	rotation: [0, 0, 0],
	url: null
});

export const cameraValues = writable({
	position: [-15, 6, 10],
	rotation: [0, 0, 0],
	fov: 40
});

export const macbookValues = writable({
	position: [0.3, .7, 3],
	scale: spring(1),
	rotation: [Math.PI / 2, 0, Math.PI / 2]
});

export const screenValue = writable({
	screenOpen: false,
	currentPage: null,
	modelLoaded: false
});



export const model = writable(null);
export const modelsStore = writable([]);

export function setModelStore(modelList) {
	if (modelList != null) {
		modelsStore.set(modelList);
	} else modelsStore.set(null);
}


export function setScreen(id) {
	screenValue.update((state) => ({ ...state, currentPage: id }));
}
export function setShowModel(bool) {
	screenValue.update((state) => ({ ...state, modelLoaded: bool }));
}
export function toggleScreen(bool) {
	screenValue.update((state) => ({ ...state, screenOpen: bool }));
}

export async function setModel(uid) {
	modelsStore.subscribe((models) => {
		if (!models || models.length === 0) return;

		const foundModel = models.find((model) => model.uid === uid);

		if (foundModel) {
			model.set(foundModel);
		} else if (uid === null) {
			model.set(null);
		}
	});
}
export function setModelUrl(url){
	modelValues.update((state)=>({...state, url : url}))
}