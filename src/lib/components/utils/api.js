const API_KEY = import.meta.env.VITE_SKETCHFAB_API_KEY;
export const sketchfabProviders = ['britishmuseum', 'LapworthMuseum', 'ethlibrary'];

export async function fetchModels(model) {
	const response = await fetch(`https://api.sketchfab.com/v3/models/${model}/download`, {
		headers: {
			Authorization: `Token ${API_KEY}`
		}
	});
	if (response.ok) {
		const data = await response.json();
		const selectedModelUrl = data.glb.url;
		return selectedModelUrl;
	} else {
		console.error('Error fetching models from Sketchfab:', response.status);
	}
}
export async function getModelData(model) {
	const response = await fetch(`https://api.sketchfab.com/v3/models/${model}`, {
		headers: {
			Authorization: `Token ${API_KEY}`
		}
	});
	if (response.ok) {
		const data = await response.json();

		return data;
	} else {
		console.error('Error fetching model data from Sketchfab:', response.status);
	}
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

export async function getAllModels() {
	const modelPromises = sketchfabProviders.map(async (provider, index) => {
		await delay(index * 1000);
		return getProviderModels(provider);
	});

	const results = await Promise.all(modelPromises);

	const allModels = results.flat().filter(Boolean);
	return shuffleArray(allModels);
}

export async function getProviderModels(provider, cursor = null, allModels = []) {
	const baseUrl = `https://api.sketchfab.com/v3/models?user=${provider}&downloadable=true&animated=false&has_sound=false&archives_flavours=false`;
	const url = cursor ? `${baseUrl}&cursor=${cursor}` : baseUrl;

	try {
		const response = await fetch(url, {
			headers: {
				Authorization: `Token ${API_KEY}`
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const res = await response.json();
		const currentModels = res.results;
		const processedModels = currentModels.map((model) => {
			const thumbnail = model.thumbnails?.images?.find(
				(image) => image.width >= 150 && image.width < 500
			);
			const lgImage = model.thumbnails?.images?.find((image) => image.width >= 500);
			return {
				type: 'model',
				title: model.name,
				owner: model.user?.displayName,
				description: model.description,
				uid: model.uid,
				categories: model.categories
					? model.categories.map((category) => category.name)
					: 'No categories found',
				thumbnail: thumbnail ? thumbnail.url : 'No suitable thumbnail found',
				image: lgImage ? lgImage.url : thumbnail.url
			};
		});

		const updatedModels = [...allModels, ...processedModels];

		if (res.cursors?.next) {
			return getProviderModels(provider, res.cursors.next, updatedModels);
		}
		return updatedModels;
	} catch (error) {
		console.error('Error fetching models:', error);

		return allModels;
	}
}
