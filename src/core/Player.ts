import * as THREE from "three";
import * as CANNON from "cannon-es";

import GameScene from "./GameScene";
import Entity from "./Entity";
import ControllerManager, { MOVEMENT } from "./ControllerManager";
import ControllerTeleporter from "./ControllerTeleporter";
import { compareVec3 } from "../utils/conversions";

class Player extends Entity {

	private MOVEMENT_SPEED = 0.01;

	private DASH_SPEED_MULT = 12.0;

	private _controller: THREE.XRTargetRaySpace | null = null;

	private _prevButtons: boolean[];

	private _dashTowards: THREE.Vector3 | null = null;

	public can_move = true;

	constructor (origin: THREE.Vector3) {
		super(origin);

		this._mesh = new THREE.Object3D();
		this._mesh.position.set(origin.x, origin.y, origin.z);

		this._collision_shape = new CANNON.Body({
			type: CANNON.Body.DYNAMIC,
			fixedRotation: true,
			mass: 1.0,
			shape: new CANNON.Box(new CANNON.Vec3(0.25, 0.85, 0.25)),
			material: new CANNON.Material({
				friction: 0.5,
			}),
		});
		this._collision_shape.shapeOffsets[0] = new CANNON.Vec3(
			0.0		+ origin.x, 
			0.85	+ origin.y,
			0.0		+ origin.z,
		);

		this._prevButtons = [
			false,
			false,
			false,
		];
	}

	public appendCamera(cam: THREE.PerspectiveCamera) {
		if (this._mesh) cam.position.set(
			this._mesh?.position.x,
			this._mesh?.position.y,
			this._mesh?.position.z,
		);
		this._mesh?.add(cam);
	}


	public setController(controller: THREE.XRTargetRaySpace) {
		this._controller = controller;
		this._mesh?.add(controller);
	}

	public appendMeshChild(child: THREE.Object3D) {
		this._mesh?.add(child);
	}

	private moveBasedOnInput(input: Gamepad) {
		if (this._collision_shape && this._controller) {
			let teleporterHelper = ControllerManager.instance.controllers[0]
						.getObjectByName("Teleporter:CTRL_0") as ControllerTeleporter;

			let wasTouchpadButtonPressed = this._prevButtons[2];

			let isTouchpadButtonPressed = input.buttons[2].pressed;

			// Movement types
			switch(ControllerManager.movement_mode) {

				// The player teleports to where its pointing.
				case MOVEMENT.TELEPORT:

					if (
						wasTouchpadButtonPressed
						&& !isTouchpadButtonPressed
					) {						
						let newPosition = teleporterHelper?.teleportReleased();

						if (newPosition) this._collision_shape?.position.set(
							newPosition.x,
							newPosition.y,
							newPosition.z,
						)
					}
					else if (isTouchpadButtonPressed) {
						// Updates Teleporter Controller
						if (
							ControllerManager.movement_mode === MOVEMENT.TELEPORT 
							|| ControllerManager.movement_mode === MOVEMENT.DASH
						) {
							teleporterHelper?.teleportUpdate(GameScene.instance.scene.children);
						}
					}
					break;

				// Like Teleport, but the player dashes to its destination.
				case MOVEMENT.DASH:

					if (
						wasTouchpadButtonPressed
						&& !isTouchpadButtonPressed
					) {						
						let newPosition = teleporterHelper?.teleportReleased();

						if (newPosition) this._dashTowards = new THREE.Vector3(
							newPosition.x,
							newPosition.y,
							newPosition.z,
						)
					}
					else if (isTouchpadButtonPressed) {
						// Updates Teleporter Controller
						teleporterHelper?.teleportUpdate(GameScene.instance.scene.children);
					}

					break;

				// The player moves depending on controller axis.
				case MOVEMENT.FREE:
				default:
					const contr_quat = this._controller.getWorldQuaternion(new THREE.Quaternion());
		
					const final_vector = new THREE.Vector3(
						input.axes[0] * this.MOVEMENT_SPEED,
						0,
						input.axes[1] * this.MOVEMENT_SPEED * (input.axes[1] < 0 ? 2 : 1),
					).applyQuaternion(contr_quat);
					
					this._collision_shape.position.x += final_vector.x;
		
					this._collision_shape.position.z += final_vector.z;
			
			}


			// Updates Touchpad Buttons
			this._prevButtons[2] = input.buttons[2].pressed;

		}
	}

	/** Process the player actions and events each frame */
	public update() {
		// Calls the Entity update
		super.update();

		// Player Input
		let gamepad = ControllerManager.updateInput();

		// Player Movement based on input
		if (
			!GameScene.instance.is_paused
			&& this.can_move 
			&& gamepad
		) this.moveBasedOnInput(gamepad);


		if (this._collision_shape && this._dashTowards) {

			if (
				!compareVec3(
					this._dashTowards,
					this._collision_shape.position,
					this.MOVEMENT_SPEED * this.DASH_SPEED_MULT
				)
			) {
				// get the normalized vector that points to the dashTowads position from this._collision_shape.position
				const dashVector = new THREE.Vector3()
					.subVectors(
						this._dashTowards,
						new THREE.Vector3(
							this._collision_shape.position.x,
							this._collision_shape.position.y,
							this._collision_shape.position.z
						)
					)
					.normalize();

				const final_vector = new THREE.Vector3(
					dashVector.x * this.MOVEMENT_SPEED * this.DASH_SPEED_MULT,
					0,
					dashVector.z * this.MOVEMENT_SPEED * this.DASH_SPEED_MULT,
				)
				// .applyQuaternion(contr_quat);
				
				this._collision_shape.position.x += final_vector.x;
	
				this._collision_shape.position.z += final_vector.z;
			}

			else {
				this._dashTowards = null;
			}
			
		}
	}
}

export default Player;