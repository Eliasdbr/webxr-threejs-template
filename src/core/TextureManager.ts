import * as THREE from "three";

/** Structure that contains the specific texture and
 * 	how many objects are using it.*/
export type TextureData = {
	texture: THREE.Texture,
	reference_count: number,
}

export default class TextureManager {
	// Singleton
	private static _instance = new TextureManager();

	public static get instance() {
		return this._instance;
	}

	private static _TEXTURES_PATH = "./assets/img/"; 

	private static _loaded_textures: Record<string,TextureData> = {};

	private static _loader = new THREE.TextureLoader();

	constructor() {}

	/**
	 * Search the texture inside de textures path with the filename specified.
	 * 
	 * If the texture is already loaded, uses it. Else, loads it and
	 * adds it to the loaded textures dict.
	 * 
	 * This works with gltf with the first children of its main scene
	 */
	public static async use_texture(filename: string): Promise<THREE.Texture> {

		let requested_texture = this._loaded_textures[filename];

		if (requested_texture) {
			requested_texture.reference_count++;
			return requested_texture.texture;
		}
		else {
			let texture = await this._loader.loadAsync(this._TEXTURES_PATH + filename);
			this._loaded_textures[filename] = {
				texture: texture,
				reference_count: 1,
			}
			return texture;
		}
	}

	/**
	 * Tells the Texture Manager that the caller will not use the texture anymore.
	 * 
	 * The Texture Manager can determine if it is safe to unload the specific texture.
	 */
	public static async request_free_texture(filename: string): Promise<void> {
		let requested_texture = this._loaded_textures[filename];

		if (requested_texture) {
			requested_texture.reference_count--;
			if (requested_texture.reference_count <= 0) {
				let target = requested_texture.texture;
				target.dispose();
			}
		}
	}
}