import { writable, derived } from 'svelte/store';

const initialModelData = {
	type: 'model',
	title: null,
	owner: null,
	description: null,
	uid: null,
	categories: null,
	thumbnail: null,
	image: null
};
const initialModelState = {
	scale: 3,
	position: [-20, 15, -35],
	rotation: [0, 0, 0],
	autoRotate: false,
	url: null
};

const initialScreenState = {
	isOpen: false,
	currentPage: null,
	isModelLoaded: false,
	screenSize: {
		innerWidth: 2000,
		innerHeight: 2000
	}

};
export const cameraValues = writable({
	position: [-15, 6, 10],
	rotation: [0, 0, 0],
	fov: 40
});

export const modelList = writable([]);
export const selectedModel = writable(initialModelData);
export const modelTransform = writable(initialModelState);
export const screenState = writable(initialScreenState);

export const activeScene = derived(
	[selectedModel, modelTransform],
	([$selectedModel, $modelTransform]) => {
		if (!$selectedModel) return null;
		return {
			model: $selectedModel,
			transform: $modelTransform
		};
	}
);

export const modelListActions = {
	setModelList(models) {
		modelList.set(models ?? []);
	},

	async setSelectedModel(uid) {
		if (!uid) {
			selectedModel.set(null);
			return;
		}

		const unsubscribe = modelList.subscribe((models) => {
			if (!models?.length) return;
			const foundModel = models.find((model) => model.uid === uid);
			console.log('found model', foundModel);
			selectedModel.set(foundModel ?? null);
		});

		unsubscribe();
	},

	setModelUrl(url) {
		modelTransform.update((state) => ({ ...state, url }));
	}
};

export const sceneActions = {
	updateTransform({ scale, position, rotation, autoRotate }) {
		modelTransform.update((state) => ({
			...state,
			...(scale !== undefined && { scale }),
			...(position !== undefined && { position }),
			...(rotation !== undefined && { rotation }),
			...(autoRotate !== undefined && { autoRotate })
		}));
	},

	resetTransform() {
		modelTransform.set(initialModelState);
	}
};
export const screenActions = {
	setPage(pageId) {
		screenState.update((state) => ({ ...state, currentPage: pageId }));
	},

	setModelLoadState(isLoaded) {
		screenState.update((state) => ({ ...state, isModelLoaded: isLoaded }));
	},

	toggleScreen(isOpen) {
		screenState.update((state) => ({ ...state, isOpen }));
	},
	setScreenSize(innerWidth, innerHeight) {
		screenState.update((state) => ({
			...state,
			screenSize: { innerWidth: innerWidth, innerHeight: innerHeight }
		}));
	},
	setDoors(isOpen) {
		screenState.update((state) => ({ ...state, doorsOpen: isOpen }));
	},

	reset() {
		screenState.set(initialScreenState);
	}
};
export function resetAllStores() {
	modelList.set([]);
	selectedModel.set(null);
	modelTransform.set(initialModelState);
	screenState.set(initialScreenState);
}

function createLogStore() {
	const { subscribe, update, set } = writable([]);
	let logIndex = 0;

	return {
		subscribe,
		addLog: (message) =>
			update((logs) => [
				...logs,
				{
					id: `${logIndex++}_${Date.now()}`,
					timestamp: new Date().toLocaleTimeString(),
					message,
					type: 'info'
				}
			]),
		addError: (message) =>
			update((logs) => [
				...logs,
				{
					id: `${logIndex++}_${Date.now()}`,
					timestamp: new Date().toLocaleTimeString(),
					message,
					type: 'error'
				}
			]),

		clear: () => {
			logIndex = 0;
			set([]);
		},
		updateLogPosition: (id, position) =>
			update((logs) => logs.map((log) => (log.id === id ? { ...log, position } : log)))
	};
}
export const logStore = createLogStore();

export const cameraControls = writable(undefined);

export const desktop = writable(undefined);
export const room = writable(undefined);
export const wunderkammerRef = writable(undefined);

const initialPropValues = {
	wunderkammer: {
		doorsOpen: false
	}
}

export const propValues = writable(initialPropValues)

export function propActions(prop, key, value) {
	propValues.update(propValues => ({
		...propValues,
		[prop]: {
			...propValues[prop],
			[key]: value
		}
	}))
}