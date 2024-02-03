import * as THREE from "three";
import GameScene from "./GameScene";
import Entity from "./Entity";

class Player extends Entity {

	private MOVEMENT_SPEED = 0.01;

	private _controller: THREE.XRTargetRaySpace | null = null;

	constructor (origin: THREE.Vector3) {
		super(origin);

		this._mesh = new THREE.Object3D();
	}

	public appendCamera(cam: THREE.PerspectiveCamera) {
		this._mesh?.add(cam);
	}


	public setController(controller: THREE.XRTargetRaySpace) {
		this._controller = controller;
		this._mesh?.add(controller);
	}

	public appendMeshChild(child: THREE.Object3D) {
		this._mesh?.add(child);
	}

	private updateInput() {
		// Axis movement (touchpad)
		let inputSources = GameScene.instance.renderer.xr.getSession()?.inputSources;
		if (inputSources && inputSources.length) {
			for (let source of inputSources) {
				let gamepad = source.gamepad;
				if (gamepad) return gamepad;
			}
		}
		return null;
	}

	private moveBasedOnInput(input: Gamepad) {
		if (this._mesh && this._controller) {
			const quat = this._mesh.quaternion.clone();
			this._mesh.quaternion.copy(
				this._controller.getWorldQuaternion(new THREE.Quaternion())
			);
			
			this._mesh.position.y = 0;
			
			this._mesh.translateX(
				input.axes[0] * this.MOVEMENT_SPEED
			);
			this._mesh.translateZ(
				input.axes[1] * this.MOVEMENT_SPEED * (input.axes[1] < 0 ? 2 : 1)
			);

			this._mesh.quaternion.copy(quat);
		}
	}

	/** Process the player actions and events each frame */
	public update() {
		// Player Input
		let gamepad = this.updateInput();

		// Player Movement based on input
		if (gamepad) this.moveBasedOnInput(gamepad);
	}
}

export default Player;