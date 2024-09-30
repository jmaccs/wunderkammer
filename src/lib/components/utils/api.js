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