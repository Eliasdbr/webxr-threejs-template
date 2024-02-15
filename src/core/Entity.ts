import * as THREE from "three";
import * as CANNON from "cannon-es";
import ModelManager from "./ModelManager";
import GameScene from "./GameScene";
import * as ConvUtils from "../utils/conversions";

class Entity {

	protected _origin: THREE.Vector3;
	protected _mesh: THREE.Mesh | THREE.Object3D | null = null;
	protected _scale: number = 1.0;
	protected _rotation: THREE.Vector3;
	protected _collision_shape: CANNON.Body | null = null;

	private _linear_velocity: THREE.Vector3 = new THREE.Vector3(0,0,0);
	private _angular_velocity: THREE.Vector3 = new THREE.Vector3(0,0,0);

	/**
	 * Entity name. An optional name for being easier to find.
	 */
	public ent_name: string = "";
	
	/**
	 * Uses the ModelManager class to load a model providing a filename.
	 * 
	 * Will search the model at "assets/mdl/" in the "public" folder.
	 * */
	public model_name: string = "";

	/**
	 * Whether this entity updates normally or while paused.
	 */
	public process_mode: "NORMAL" | "PAUSE" = "NORMAL";

	/** Mesh getter */
	public get mesh() {
		return this._mesh;
	}
	/** Mesh setter */
	public set mesh(value: THREE.Object3D | null) {
		this._mesh = value;
	}

	/** Collision shape getter */
	public get collision() {
		return this._collision_shape;
	}
	/** Collision shape setter */
	public set collision(value: CANNON.Body | null) {
		this._collision_shape = value;
	}

	/** Scale setter. Write Only */
	public set scale(value: number) {
		this._scale = value;
	}

	/** Rotation setter. */
	public set rotation(value: THREE.Vector3) {
		this._rotation = value;
	}
	public get rotation() {
		return this._rotation;
	}

	public set linear_velocity(value: THREE.Vector3) {
		this._linear_velocity = value;
		if (this._collision_shape) {
			this._collision_shape.velocity.set(
				value.x,
				value.y,
				value.z
			);
		}
	}
	public get linear_velocity() {
		return this._linear_velocity;
	}

	public set angular_velocity(value: THREE.Vector3) {
		this._angular_velocity = value;
		if (this._collision_shape) {
			this._collision_shape.angularVelocity.set(
				value.x,
				value.y,
				value.z
			);
		}
	}
	public get angular_velocity() {
		return this._angular_velocity;
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

	private physics_update() {
		if (this._collision_shape 
			&& this._collision_shape.type === CANNON.Body.DYNAMIC
		) {
			this._linear_velocity = ConvUtils.cannonVec3toThreeVec3(
				this._collision_shape.velocity
			);
			this._angular_velocity = ConvUtils.cannonVec3toThreeVec3(
				this._collision_shape.angularVelocity
			);

			const transformed_pos = new THREE.Vector3(
				this._collision_shape.position.x,
				this._collision_shape.position.y,
				this._collision_shape.position.z,
			);

			const transformed_rot = new THREE.Quaternion(
				this._collision_shape.quaternion.x,
				this._collision_shape.quaternion.y,
				this._collision_shape.quaternion.z,
				this._collision_shape.quaternion.w,
			);
			
			this._origin = transformed_pos;
			this._rotation = new THREE.Vector3().applyQuaternion(transformed_rot);

			this._mesh?.position.copy(transformed_pos);
			this._mesh?.quaternion.copy(transformed_rot);
		}
		else if (this._mesh) {
			let new_rot = new THREE.Euler(
				this._mesh.rotation.x + this._angular_velocity.x,
				this._mesh.rotation.y + this._angular_velocity.y,
				this._mesh.rotation.z + this._angular_velocity.z,
			);
			this._mesh.rotation.copy(new_rot);
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

	public update() {
		// Only updates if the game process matches the entity process mode.
		if (
			GameScene.instance.is_paused 
			=== (this.process_mode === "NORMAL") 
		) return;
		this.physics_update();
	}

	public destroy() {
		if (this.model_name) {
			ModelManager.request_free_model(this.model_name);
		}
		if (this._mesh) {
			this._mesh.removeFromParent();
		}
		if (this._collision_shape) {
			this._collision_shape.world?.removeBody(this._collision_shape);
		}
		
	}

}

export default Entity;