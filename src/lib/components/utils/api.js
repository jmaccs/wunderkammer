const API_KEY = import.meta.env.VITE_SKETCHFAB_API_KEY;

export async function getModels(model) {
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

export async function getAllModels() {
	const response = await fetch(
		'https://api.sketchfab.com/v3/models?user=britishmuseum&downloadable=true',
		{
			headers: {
				Authorization: `Token ${API_KEY}`
			}
		}
	);
	if (response.ok) {
		const res = await response.json();
		const allModels = res.results;

		const processedModels = allModels.map((model) => {
			const thumbnail = model.thumbnails?.images?.find(
				(image) => image.width >= 150 && image.width < 500
			);
			return {
				type: 'model',
				title: model.name,
				owner: model.user?.displayName,
				description: model.description,
				uid: model.uid,
				categories: model.categories
					? model.categories.map((category) => category.name)
					: 'No categories found',
				thumbnail: thumbnail ? thumbnail.url : 'No suitable thumbnail found'
			};
		});
		return processedModels;
	} else {
		console.error('Error fetching models from Sketchfab:', response.status);
	}
}
