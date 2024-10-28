import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { logStore } from './stores';

export class ModelProcessor {
	constructor() {
		this.loader = new GLTFLoader();
		this.cache = new Map();

		console.log('ModelProcessor initialized');
		logStore.addLog('ModelProcessor initialized');
	}

	async processModel(url, options = {}) {
		if (!url) {
			console.error('ModelProcessor: No URL provided');
			logStore.addError('ModelProcessor: No URL provided');
			throw new Error('No URL provided');
		}

		console.log(`ModelProcessor: Processing model from SketchFab`);
		logStore.addLog(`ModelProcessor: Processing model from SketchFab`);

		const { targetSize = 10, center = true } = options;

		try {
			if (this.cache.has(url)) {
				console.log('ModelProcessor: Returning cached model');
				logStore.addLog('ModelProcessor: Returning cached model');
				return this.cache.get(url);
			}

			const gltf = await this.loadModel(url);
			console.log('ModelProcessor: Model loaded successfully');
			logStore.addLog('ModelProcessor: Model loaded successfully');

			if (!gltf || !gltf.scene) {
				throw new Error('Invalid GLTF data');
			}

			const processedModel = this.normalizeModel(gltf, { targetSize, center });

			this.traverseMeshes(processedModel.scene, (mesh) => {
				mesh.castShadow = true;
				mesh.receiveShadow = true;
				if (mesh.material) {
					this.handleSpecularGlossiness(mesh);
					mesh.material.needsUpdate = true;
				}
			});

			this.cache.set(url, processedModel);
			return processedModel;
		} catch (error) {
			console.error('ModelProcessor: Error processing model:', error);
			logStore.addError('ModelProcessor: Error processing model:', error);
			throw error;
		}
	}

	handleSpecularGlossiness(mesh) {
		try {
			if (mesh.material?.extensions?.KHR_materials_pbrSpecularGlossiness) {
				console.log('ModelProcessor: Converting KHR Specular Glossiness material');
				logStore.addLog('ModelProcessor: Converting KHR Specular Glossiness material');

				const oldMaterial = mesh.material;
				const newMaterial = new THREE.MeshStandardMaterial({
					color: oldMaterial.color || new THREE.Color(1, 1, 1),
					map: oldMaterial.map,
					normalMap: oldMaterial.normalMap,
					roughness: oldMaterial.roughness !== undefined ? oldMaterial.roughness : 0.5,
					metalness: oldMaterial.metalness !== undefined ? oldMaterial.metalness : 0.5,
					transparent: oldMaterial.transparent,
					opacity: oldMaterial.opacity
				});

				mesh.material = newMaterial;
			}
		} catch (error) {
			console.warn('ModelProcessor: Error handling Specular Glossiness material:', error);
			logStore.addError('ModelProcessor: Error handling Specular Glossiness material:', error);

			// Fallback to basic material if material processing fails
			mesh.material = new THREE.MeshStandardMaterial({
				color: new THREE.Color(0.8, 0.8, 0.8),
				roughness: 0.5,
				metalness: 0.5
			});
		}
	}

	loadModel(url) {
		return new Promise((resolve, reject) => {
			try {
				this.loader.load(
					url,
					(gltf) => {
						console.log('ModelProcessor: GLTF loaded successfully');
						logStore.addLog('ModelProcessor: GLTF loaded successfully');
						resolve(gltf);
					},
					(progress) => {
						const percent = ((progress.loaded / progress.total) * 100).toFixed();
						console.log(`ModelProcessor: Loading progress: ${percent}%`);
						logStore.addLog(`ModelProcessor: Loading progress: ${percent}%`);
					},
					(error) => {
						console.error('ModelProcessor: Error loading GLTF:', error);
						logStore.addError('ModelProcessor: Error loading GLTF:', error);
						reject(error);
					}
				);
			} catch (error) {
				console.error('ModelProcessor: Error in load process:', error);
				logStore.addError('ModelProcessor: Error in load process:', error);
				reject(error);
			}
		});
	}

	normalizeModel(gltf, { targetSize, center }) {
		if (!gltf || !gltf.scene) {
			console.error('ModelProcessor: Invalid model for normalization');
			throw new Error('Invalid model for normalization');
		}

		try {
			const scene = gltf.scene;

			scene.position.set(0, 0, 0);
			scene.rotation.set(0, 0, 0);
			scene.scale.set(1, 1, 1);
			scene.updateMatrix();
			scene.updateMatrixWorld(true);

			const box = new THREE.Box3().setFromObject(scene);
			const size = box.getSize(new THREE.Vector3());
			const maxDimension = Math.max(size.x, size.y, size.z);

			if (maxDimension === 0) {
				console.warn('ModelProcessor: Model has zero dimensions');
				logStore.addError('ModelProcessor: Model has zero dimensions');
				return gltf;
			}

			const scale = targetSize / maxDimension;
			scene.scale.set(scale, scale, scale);

			if (center) {
				const center = box.getCenter(new THREE.Vector3());
				scene.position.copy(center).multiplyScalar(-scale);
			}

			scene.updateMatrix();
			scene.updateMatrixWorld(true);

			box.setFromObject(scene);

			gltf.userData = {
				...gltf.userData,
				originalSize: maxDimension,
				normalizedScale: scale,
				boundingBox: box
			};

			console.log('ModelProcessor: Model normalized successfully');
			logStore.addLog('ModelProcessor: Model normalized successfully');
			return gltf;
		} catch (error) {
			console.error('ModelProcessor: Error normalizing model:', error);
			logStore.addError('ModelProcessor: Error normalizing model:', error);
			throw error;
		}
	}

	traverseMeshes(object, callback) {
		if (!object) {
			console.warn('ModelProcessor: No object provided for traversal');
			logStore.addError('ModelProcessor: No object provided for traversal');
			return;
		}

		try {
			object.traverse((child) => {
				if (child.isMesh) {
					callback(child);
				}
			});
		} catch (error) {
			console.error('ModelProcessor: Error traversing meshes:', error);
			logStore.addLog('ModelProcessor: Error traversing meshes:', error);
		}
	}

	clearCache() {
		try {
			this.cache.clear();
			console.log('ModelProcessor: Cache cleared');
			logStore.addLog('ModelProcessor: Cache cleared');
		} catch (error) {
			console.error('ModelProcessor: Error clearing cache:', error);
			logStore.addError('ModelProcessor: Error clearing cache:', error);
		}
	}
}

export const modelProcessor = new ModelProcessor();
