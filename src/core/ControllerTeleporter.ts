import * as THREE from "three";
import GameScene from "./GameScene";
// import { terminal } from "virtual:terminal";

/**
 * Object that handles the player teleportation
 * based on where its pointing
 */
class ControllerTeleporter extends THREE.Object3D {

	/** Raycaster object. */
	private _raycaster: THREE.Raycaster;

	/** Line which shows where the raycaster is pointing. */
	private _renderLine: THREE.Object3D;

	/** Circle which shows where the player is going to land. */
	private _renderCircle: THREE.Object3D;

	/** Latest teleportation point */
	private _lastPoint: THREE.Vector3 | null;

	/** Raycasters reach in meters, */
	public range: number;

	constructor(range: number) {
		
		super();

		this.range = range;

		this._lastPoint = new THREE.Vector3();

		this._raycaster = new THREE.Raycaster(
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0, 0, -1),	// Forward
			0.5, range
		);

		const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ]);

		const lineMaterial = new THREE.LineBasicMaterial({
			color: 0xFFFFFF,
			opacity: 0.5,
		});

		this._renderLine = new THREE.Line(lineGeometry, lineMaterial);
		// Line length based on range
		this._renderLine.scale.set(1, 1, range);
		this._renderLine.visible = false;
		this.add(this._renderLine);

		const circleGeometry = new THREE.CircleGeometry(0.25, 16);
		
		const circleMaterial = new THREE.MeshBasicMaterial({
			color: 0xFFFFFF,
			opacity: 0.5,
		})

		this._renderCircle = new THREE.Mesh(circleGeometry, circleMaterial);
		this._renderCircle.rotation.set(-Math.PI/2, 0, 0);
		this._renderCircle.visible = false;
		this._renderCircle.name = "TELEPORT_IGNORE:TeleportCircle";
		GameScene.instance.addToWorld(this._renderCircle);

	}

	/**
	 * Updates the line to be teleported to.
	 */
	teleportUpdate(objectsToCheck: THREE.Object3D[]) {
		
		this._renderLine.visible = true;
		this._renderCircle.visible = true;

		this._renderLine.scale.set(1, 1, this.range);

		let tempMatrix = new THREE.Matrix4();

		// Sets raycasters world position and direction
		tempMatrix.identity().extractRotation(this.matrixWorld);
		this._raycaster.ray.origin.setFromMatrixPosition(this.matrixWorld);
		this._raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

		let intersections = this._raycaster
			.intersectObjects(objectsToCheck, true)
			.filter(int => !int.object.name.includes("TELEPORT_IGNORE"));
		
			// terminal.log("Intersections:", intersections.length);
		
		if (intersections.length) {

			let isFirstTeleportable = intersections[0]
				.object.name.includes("TELEPORTABLE");

			if (isFirstTeleportable) {
				// @ts-ignore
				this._renderLine.material.color.setHex(0x00AA44);

				this._renderLine.scale.set(1, 1, intersections[0].distance);

				this._lastPoint = intersections[0].point;
				// @ts-ignore
				this._renderCircle.material.color.setHex(0x00AA44);

				this._renderCircle.position.set(
					this._lastPoint.x,
					this._lastPoint.y + 0.05,
					this._lastPoint.z,
				);
				
			}
			else {
				// @ts-ignore
				this._renderLine.material.color.setHex(0xAA0000);
				
				this._renderCircle.visible = false;

				if (this._lastPoint) this._renderCircle.position.set(
					this._lastPoint.x,
					this._lastPoint.y + 0.05,
					this._lastPoint.z,
				);
			}

		}
		else {
			this._renderLine.visible = true;
			this._renderCircle.visible = false;
			// @ts-ignore
			this._renderLine.material.color.setHex(0xAA0000);

			this._lastPoint = null;
		}
	}

	teleportReleased() {

		this._renderLine.visible = false;

		this._renderCircle.visible = false;
		
		return this._lastPoint;
	}

}

export default ControllerTeleporter;