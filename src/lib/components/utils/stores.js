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
const initialSceneState = {
	scale: 0.2,
	position: [0, 3, 0],
	rotation: [0, 0, 0],
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
export const sceneTransform = writable(initialSceneState);
export const screenState = writable(initialScreenState);

export const activeScene = derived(
	[selectedModel, sceneTransform],
	([$selectedModel, $sceneTransform]) => {
		if (!$selectedModel) return null;
		return {
			model: $selectedModel,
			transform: $sceneTransform
		};
	}
);

export const modelActions = {
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
		sceneTransform.update((state) => ({ ...state, url }));
	}
};

export const sceneActions = {
	updateTransform({ scale, position, rotation }) {
		sceneTransform.update((state) => ({
			...state,
			...(scale !== undefined && { scale }),
			...(position !== undefined && { position }),
			...(rotation !== undefined && { rotation })
		}));
	},

	resetTransform() {
		sceneTransform.set(initialSceneState);
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
	reset() {
		screenState.set(initialScreenState);
	}
};
export function resetAllStores() {
	modelList.set([]);
	selectedModel.set(null);
	sceneTransform.set(initialSceneState);
	screenState.set(initialScreenState);
}


function createLogStore() {
    const { subscribe, update, set } = writable([]);
    
    return {
        subscribe,
        addLog: (message) => update(logs => [...logs, {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            message,
            type: 'info',
        }]),
        addError: (message) => update(logs => [...logs, {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            message,
            type: 'error',
        }]),
        addProgress: (message, progress) => update(logs => [...logs, {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            message,
            progress,
            type: 'progress',
        }]),
        clear: () => set([]),
        // Optional: Add animation states
        updateLogPosition: (id, position) => update(logs =>
            logs.map(log =>
                log.id === id
                    ? { ...log, position }
                    : log
            )
        ),
    };
}
export const logStore = createLogStore();


export const cameraControls = writable(undefined)

export const desktop = writable(undefined)