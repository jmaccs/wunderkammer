import { prune, dedup, draco, center } from '@gltf-transform/functions';
import { WebIO } from '@gltf-transform/core';
import { logStore } from './stores';

export class GltfTransformer {
    constructor() {
        this.io = new WebIO();
        this.cache = new Map();
        
   
        this.io.registerExtensions([]);
        
        console.log('GltfTransformer initialized');
        logStore.addLog('GltfTransformer initialized');
    }

    async transformGltf(url, options = {}) {
        if (!url) {
            const error = 'GltfTransformer: No URL provided';
            console.error(error);
            logStore.addError(error);
            throw new Error(error);
        }

        let truncatedUrl = url.slice(0, 50) + '...';
        console.log(`GltfTransformer: Processing model from ${truncatedUrl}`);
        logStore.addLog(`GltfTransformer: Processing model from ${truncatedUrl}`);

        try {
     
            if (this.cache.has(url)) {
                console.log('GltfTransformer: Returning cached model');
                logStore.addLog('GltfTransformer: Returning cached model');
                return this.cache.get(url);
            }

         
            const document = await this.loadModel(url);
            const processedDoc = await this.processDocument(document);
            const result = await this.createBlob(processedDoc);

       
            this.cache.set(url, result);
            return result;

        } catch (error) {
            const errorMsg = `GltfTransformer: Error processing model: ${error.message}`;
            console.error(errorMsg);
            logStore.addError(errorMsg);
            throw error;
        }
    }

    async loadModel(url) {
        console.log('GltfTransformer: Loading model');
        logStore.addLog('GltfTransformer: Loading model');

        try {
            const document = await this.io.read(url);
            console.log('GltfTransformer: Model loaded successfully');
            logStore.addLog('GltfTransformer: Model loaded successfully');
            return document;
        } catch (error) {
            const errorMsg = `GltfTransformer: Error loading model: ${error.message}`;
            console.error(errorMsg);
            logStore.addError(errorMsg);
            throw error;
        }
    }

    async processDocument(document) {
        console.log('GltfTransformer: Processing document');
        logStore.addLog('GltfTransformer: Processing document');

        try {
            await document.transform(
               
                prune(),
          
                dedup(),
            
                draco(),
               
                center()
            );

            console.log('GltfTransformer: Document processed successfully');
            logStore.addLog('GltfTransformer: Document processed successfully');
            return document;
        } catch (error) {
            const errorMsg = `GltfTransformer: Error processing document: ${error.message}`;
            console.error(errorMsg);
            logStore.addError(errorMsg);
            throw error;
        }
    }

    async createBlob(document) {
        console.log('GltfTransformer: Creating Blob');
        logStore.addLog('GltfTransformer: Creating Blob');

        try {
         
            const glbBuffer = await this.io.writeBinary(document);
            
          
            const blob = new Blob([glbBuffer], { type: 'model/gltf-binary' });
            
            const blobUrl = URL.createObjectURL(blob);
            
            console.log('GltfTransformer: Blob created successfully');
            logStore.addLog('GltfTransformer: Blob created successfully');
            
            return blobUrl;
        } catch (error) {
            const errorMsg = `GltfTransformer: Error creating Blob: ${error.message}`;
            console.error(errorMsg);
            logStore.addError(errorMsg);
            throw error;
        }
    }

    clearCache() {
        try {
          
            for (const blobUrl of this.cache.values()) {
                URL.revokeObjectURL(blobUrl);
            }
            this.cache.clear();
            console.log('GltfTransformer: Cache cleared');
            logStore.addLog('GltfTransformer: Cache cleared');
        } catch (error) {
            const errorMsg = `GltfTransformer: Error clearing cache: ${error.message}`;
            console.error(errorMsg);
            logStore.addError(errorMsg);
        }
    }
}

export const gltfTransformer = new GltfTransformer();
