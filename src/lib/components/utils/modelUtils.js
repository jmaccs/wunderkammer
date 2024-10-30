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
		let truncatedUrl = url.slice(15) + '...';
		console.log(`ModelProcessor: Processing model from ${truncatedUrl}`);
		logStore.addLog(`ModelProcessor: Processing model from ${truncatedUrl}`);

		const { 
			targetSize = 10, 
			center = true, 
			simplifyRatio = 0.5 // New option for controlling simplification
		} = options;

		if (simplifyRatio < 0 || simplifyRatio > 1) {
			const error = 'ModelProcessor: simplifyRatio must be between 0 and 1';
			console.error(error);
			logStore.addError(error);
			throw new Error(error);
		}

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

			
			await this.simplifyModel(processedModel.scene, simplifyRatio);

		
			this.traverseMeshes(processedModel.scene, (mesh) => {
				mesh.castShadow = true;
				mesh.receiveShadow = true;
				if (mesh.material) {
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

	async simplifyModel(scene, ratio) {
		console.log(`ModelProcessor: Starting model simplification with ratio ${ratio}`);
		logStore.addLog(`ModelProcessor: Starting model simplification with ratio ${ratio}`);

		let totalOriginalVertices = 0;
		let totalSimplifiedVertices = 0;
		let meshCount = 0;
		let errorCount = 0;

		try {
			await new Promise((resolve) => {
				this.traverseMeshes(scene, (mesh) => {
					try {
						meshCount++;
						const geometry = mesh.geometry;
						
						if (!(geometry instanceof THREE.BufferGeometry)) {
							console.warn(`ModelProcessor: Skipping non-BufferGeometry mesh: ${mesh.name || 'unnamed'}`);
							logStore.addLog(`ModelProcessor: Skipping non-BufferGeometry mesh: ${mesh.name || 'unnamed'}`);
							return;
						}

						const vertexCount = geometry.attributes.position.count;
						totalOriginalVertices += vertexCount;

					
						if (vertexCount < 10) {
							console.log(`ModelProcessor: Skipping mesh with only ${vertexCount} vertices: ${mesh.name || 'unnamed'}`);
							logStore.addLog(`ModelProcessor: Skipping mesh with only ${vertexCount} vertices: ${mesh.name || 'unnamed'}`);
							totalSimplifiedVertices += vertexCount;
							return;
						}

						const targetCount = Math.floor(vertexCount * ratio);
						console.log(`ModelProcessor: Simplifying mesh "${mesh.name || 'unnamed'}" from ${vertexCount} to ${targetCount} vertices`);
						logStore.addLog(`ModelProcessor: Simplifying mesh "${mesh.name || 'unnamed'}" from ${vertexCount} to ${targetCount} vertices`);

						
						const startTime = performance.now();

					
						const simplifiedGeometry = geometry.clone();
						
					
						if (simplifiedGeometry.index !== null) {
							console.log(`ModelProcessor: Converting indexed geometry to non-indexed for mesh: ${mesh.name || 'unnamed'}`);
							logStore.addLog(`ModelProcessor: Converting indexed geometry to non-indexed for mesh: ${mesh.name || 'unnamed'}`);
							simplifiedGeometry.toNonIndexed();
						}

						const simplified = this.simplifyModifier.modify(simplifiedGeometry, Math.max(0, vertexCount - targetCount));
						
						const endTime = performance.now();
						const processingTime = (endTime - startTime).toFixed(2);
						
						console.log(`ModelProcessor: Mesh "${mesh.name || 'unnamed'}" simplified in ${processingTime}ms`);
						logStore.addLog(`ModelProcessor: Mesh "${mesh.name || 'unnamed'}" simplified in ${processingTime}ms`);

						mesh.geometry.dispose(); 
						mesh.geometry = simplified;

						totalSimplifiedVertices += simplified.attributes.position.count;

					} catch (error) {
						errorCount++;
						console.error(`ModelProcessor: Error simplifying mesh "${mesh.name || 'unnamed'}":`, error);
						logStore.addError(`ModelProcessor: Error simplifying mesh "${mesh.name || 'unnamed'}": ${error.message}`);
					}
				});

			
				const reductionPercent = ((1 - (totalSimplifiedVertices / totalOriginalVertices)) * 100).toFixed(2);
				const summary = `ModelProcessor: Simplification complete - 
					Processed ${meshCount} meshes with ${errorCount} errors.
					Total vertices reduced from ${totalOriginalVertices} to ${totalSimplifiedVertices} 
					(${reductionPercent}% reduction)`;
				
				console.log(summary);
				logStore.addLog(summary);

				if (errorCount > 0) {
					const errorSummary = `ModelProcessor: Completed with ${errorCount} errors during simplification`;
					console.warn(errorSummary);
					logStore.addError(errorSummary);
				}

				resolve();
			});
		} catch (error) {
			const errorMessage = 'ModelProcessor: Critical error during simplification process';
			console.error(errorMessage, error);
			logStore.addError(`${errorMessage}: ${error.message}`);
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
