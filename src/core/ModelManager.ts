import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/** Structure that contains the specific model and
 * 	how many objects are using it.*/
export type ModelData = {
	model: THREE.Object3D,
	reference_count: number,
}

export default class ModelManager {
	// Singleton
	private static _instance = new ModelManager();

	public static get instance() {
		return this._instance;
	}

	private static _MODELS_PATH = "./assets/mdl/"; 

	private static _loaded_models: Record<string,ModelData> = {};

	private static _loader = new GLTFLoader();

	constructor() {}

	/**
	 * Search the model inside de models path with the filename specified.
	 * 
	 * If the model is already loaded, uses it. Else, loads it and
	 * adds it to the loaded models dict.
	 * 
	 * This works with gltf with the first children of its main scene
	 */
	public static async use_model(filename: string): Promise<THREE.Object3D> {

		let requested_model = this._loaded_models[filename];

		if (requested_model) {
			requested_model.reference_count++;
			return requested_model.model;
		}
		else {
			let gltf = await this._loader.loadAsync(this._MODELS_PATH + filename);
			let model = gltf.scene.children[0];
			this._loaded_models[filename] = {
				model: model,
				reference_count: 1,
			}
			return model;
		}
	}

	/**
	 * Tells the Model Manager that the caller will not use the model anymore.
	 * 
	 * The Model Manager can determine if it is safe to unload the specific model.
	 */
	public static async request_free_model(filename: string): Promise<void> {
		let requested_model = this._loaded_models[filename];

		if (requested_model) {

			requested_model.reference_count--;

			if (requested_model.reference_count <= 0) {

				let target = requested_model.model;

				target.removeFromParent();

				target.traverse((child: any) => {
					// disposing materials
					if (child.material && !child.material._isDisposed){
						// disposing textures
						for (const value of Object.values(child.material) as any[]){
							if (!value) continue;
							if (typeof value.dispose === "function" && !value._isDisposed){
								value.dispose();
								value._isDisposed = true;
							}
						}
						child.material.dispose();
						child.material._isDisposed = true;
					}
					// disposing geometries
					if (child.geometry?.dispose && !child.geometry._isDisposed){
						child.geometry.dispose();
						child.geometry._isDisposed = true;
					}
				});

			}

		}

	}
}