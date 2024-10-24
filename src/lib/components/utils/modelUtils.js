import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier.js';
import { logStore } from './stores';
export class ModelProcessor {
	constructor() {
		this.loader = new GLTFLoader();
		this.cache = new Map();
		this.simplifyModifier = new SimplifyModifier();
		console.log('ModelProcessor initialized');
		logStore.addLog('ModelProcessor initialized');
	}

	async processModel(url, options = {}) {
		if (!url) {
			console.error('ModelProcessor: No URL provided');
			logStore.addError('ModelProcessor: No URL provided');
			throw new Error('No URL provided');
		}

		console.log(`ModelProcessor: Processing model from ${url}`);
		logStore.addLog(`ModelProcessor: Processing model from ${url}`);

		const { targetSize = 10, center = true, createLODs = true } = options;

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

			if (createLODs) {
				try {
					processedModel.userData.lod = this.createLODGroup(processedModel.scene);
					console.log('ModelProcessor: LOD levels created successfully');
					logStore.addLog('ModelProcessor: LOD levels created successfully');
				} catch (error) {
					console.warn('ModelProcessor: Failed to create LOD levels', error);
					logStore.addError('ModelProcessor: Failed to create LOD levels', error);
				}
			}

			this.cache.set(url, processedModel);
			return processedModel;
		} catch (error) {
			console.error('ModelProcessor: Error processing model:', error);
			logStore.addError('ModelProcessor: Error processing model:', error);
			throw error;
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
						const percent = ((progress.loaded / progress.total) * 100).toFixed(2);
						console.log(`ModelProcessor: Loading progress: ${percent}%`);
						logStore.addProgress(`ModelProcessor: Loading progress: ${percent}%`);
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

			const box = new THREE.Box3().setFromObject(scene);
			if (!box.isBox3) {
				throw new Error('Failed to calculate bounding box');
			}

			const size = box.getSize(new THREE.Vector3());
			const maxDimension = Math.max(size.x, size.y, size.z);

			if (maxDimension === 0) {
				console.warn('ModelProcessor: Model has zero dimensions');
				logStore.addError('ModelProcessor: Model has zero dimensions');
				return gltf;
			}

			const scale = targetSize / maxDimension;
			scene.scale.multiplyScalar(scale);

			if (center) {
				const center = box.getCenter(new THREE.Vector3());
				scene.position.sub(center);
			}

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

	createLODGroup(originalScene) {
		if (!originalScene) {
			console.error('ModelProcessor: No scene provided for LOD creation');
			logStore.addError('ModelProcessor: No scene provided for LOD creation');
			throw new Error('No scene provided for LOD creation');
		}

		try {
			const lodGroup = new THREE.LOD();

			const highDetail = originalScene.clone();
			lodGroup.addLevel(highDetail, 0);
			console.log('ModelProcessor: High detail LOD created');
			logStore.addLog('ModelProcessor: High detail LOD created');

			let hasValidMeshes = false;

			this.traverseMeshes(originalScene, (mesh) => {
				if (mesh.geometry && mesh.geometry.isBufferGeometry) {
					hasValidMeshes = true;
					try {
						const lowMesh = this.createSimplifiedMesh(mesh, 0.25);
						if (lowMesh) {
							const lowLOD = new THREE.LOD();
							lowLOD.addLevel(lowMesh, 150);
							lodGroup.addLevel(lowLOD, 150);
							console.log('ModelProcessor: Low detail LOD created');
							logStore.addLog('ModelProcessor: Low detail LOD created');
						}
					} catch (error) {
						console.warn('ModelProcessor: Failed to create LOD for mesh:', error);
						logStore.addError('ModelProcessor: Failed to create LOD for mesh:', error);
					}
				}
			});

			if (!hasValidMeshes) {
				console.warn('ModelProcessor: No valid meshes found for LOD creation');
				logStore.addError('ModelProcessor: No valid meshes found for LOD creation');
				return null;
			}

			return lodGroup;
		} catch (error) {
			console.error('ModelProcessor: Error creating LOD group:', error);
			logStore.addError('ModelProcessor: Error creating LOD group:', error);
			return null;
		}
	}

	createSimplifiedMesh(originalMesh, reduction) {
		if (!originalMesh || !originalMesh.geometry || !originalMesh.geometry.isBufferGeometry) {
			console.warn('ModelProcessor: Invalid mesh for simplification');
			return null;
		}

		try {
			const geometry = originalMesh.geometry.clone();

			const originalVertexCount = geometry.attributes.position.count;
			const targetVertexCount = Math.floor(originalVertexCount * reduction);
			const vertexReduction = originalVertexCount - targetVertexCount;

			if (vertexReduction <= 0) {
				console.warn('ModelProcessor: No vertex reduction needed');
				logStore.addError('ModelProcessor: No vertex reduction needed');
				return null;
			}

			const simplified = this.simplifyModifier.modify(geometry, vertexReduction);

			const simplifiedMesh = new THREE.Mesh(simplified, originalMesh.material.clone());

			simplifiedMesh.position.copy(originalMesh.position);
			simplifiedMesh.rotation.copy(originalMesh.rotation);
			simplifiedMesh.scale.copy(originalMesh.scale);

			console.log(`ModelProcessor: Mesh simplified to ${reduction * 100}%`);
			logStore.addProgress(`ModelProcessor: Mesh simplified to ${reduction * 100}%`);
			return simplifiedMesh;
		} catch (error) {
			console.warn('ModelProcessor: Failed to create simplified mesh:', error);
			logStore.addError('ModelProcessor: Failed to create simplified mesh:', error);
			return null;
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
