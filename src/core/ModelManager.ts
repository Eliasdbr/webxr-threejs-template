import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export default class ModelManager {
	// Singleton
	private static _instance = new ModelManager();

	public static get instance() {
		return this._instance;
	}

	private static _MODELS_PATH = "./assets/mdl/"; 

	private static _loaded_models: Record<string,THREE.Object3D> = {};

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

		let wanted_model = this._loaded_models[filename];

		if (wanted_model) {
			return wanted_model;
		}
		else {
			let gltf = await this._loader.loadAsync(this._MODELS_PATH + filename);
			let model = gltf.scene.children[0];
			this._loaded_models[filename] = model;
			return model;
		}
	}
}