import * as THREE from "three";
import ModelManager from "./ModelManager";

class Entity {

	protected _origin: THREE.Vector3;
	protected _mesh: THREE.Mesh | THREE.Object3D | null = null;
	protected _scale: number = 1.0;
	protected _rotation: THREE.Vector3
	
	/**
	 * Uses the ModelManager class to load a model providing a filename.
	 * 
	 * Will search the model at "assets/mdl/" in the "public" folder.
	 * */
	public model_name: string = "";

	/** Mesh getter. Read Only */
	public get mesh() {
		return this._mesh;
	}

	/** Scale setter. Write Only */
	public set scale(value: number) {
		this._scale = value;
	}

	/** Rotation setter. Write Only */
	public set rotation(value: THREE.Vector3) {
		this._rotation = value;
	}

	constructor(position: THREE.Vector3) {
		this._origin = position;
		this._rotation = new THREE.Vector3();
		if (this._mesh) {
			this._mesh.position.set(
				this._origin.x,
				this._origin.y,
				this._origin.z,
			);
			this._mesh.rotation.set(
				this._rotation.x,
				this._rotation.y,
				this._rotation.z,
			);
		}
	}


	public load = async () => {
		// Loads the model
		if (this.model_name) {
			let model = await ModelManager.use_model(this.model_name);
			if (model) {
				this._mesh = model;
				this._mesh.position.set(
					this._origin.x,
					this._origin.y,
					this._origin.z,
				);
				this._mesh.scale.set(
					this._scale,
					this._scale,
					this._scale
				);
				this._mesh.rotation.set(
					this._rotation.x,
					this._rotation.y,
					this._rotation.z,
				);
			}
		}
	}

	public update() {}

}

export default Entity;