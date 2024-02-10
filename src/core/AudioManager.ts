import * as THREE from "three";

/** Structure that contains the specific audio and
 * 	how many objects are using it.*/
export type AudioData = {
	audio: AudioBuffer,
	reference_count: number,
}

export default class AudioManager {
	// Singleton
	private static _instance = new AudioManager();

	public static get instance() {
		return this._instance;
	}

	private static _AUDIO_PATH = "./assets/snd/"; 

	private static _loaded_audios: Record<string,AudioData> = {};

	private static _loader = new THREE.AudioLoader();

	constructor() {}

	/**
	 * Search the audio inside de audios path with the filename specified.
	 * 
	 * If the audio is already loaded, uses it. Else, loads it and
	 * adds it to the loaded audios dict.
	 * 
	 * This works with gltf with the first children of its main scene
	 */
	public static async use_audio(filename: string): Promise<AudioBuffer> {

		let requested_audio = this._loaded_audios[filename];

		if (requested_audio) {
			requested_audio.reference_count++;
			return requested_audio.audio;
		}
		else {
			let audio = await this._loader.loadAsync(this._AUDIO_PATH + filename);
			this._loaded_audios[filename] = {
				audio: audio,
				reference_count: 1,
			}
			return audio;
		}
	}

	/**
	 * Tells the Audio Manager that the caller will not use the audio anymore.
	 * 
	 * The Audio Manager can determine if it is safe to unload the specific audio.
	 */
	public static async request_free_audio(filename: string): Promise<void> {
		let requested_audio = this._loaded_audios[filename];

		if (requested_audio) {

			requested_audio.reference_count--;

			if (requested_audio.reference_count <= 0) {

				delete this._loaded_audios[filename];
				
			}

		}

	}
}