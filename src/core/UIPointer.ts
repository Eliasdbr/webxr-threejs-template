import * as THREE from "three";

/**
 * This class handles the pointer that selects in-VR UI elements.
 * An instance of this class should be attached in at least one VR
 * controller.
 */
class UIPointer extends THREE.Object3D {

	/** Raycaster object. */
	private _raycaster: THREE.Raycaster;

	/** Line which shows where the raycaster is pointing. */
	private _renderLine: THREE.Object3D;

	/** List with the last intersected objects */
	private _intersectedObjects: THREE.Object3D[] = [];

	/** Raycasters reach in meters, */
	public range: number;

	constructor(range: number) {
		super();

		this.range = range;

		this._raycaster = new THREE.Raycaster(
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0, 0, -1),	// Forward
			0, range
		);

		const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ]);

		const lineMaterial = new THREE.LineBasicMaterial({
			color: 0xFFFFFF,
		});

		this._renderLine = new THREE.Line(lineGeometry, lineMaterial);
		// Line length based on range
		this._renderLine.scale.set(1, 1, range);
		this._renderLine.visible = true;
		this.add(this._renderLine);
 
	}

	/** Updates the list of all the intersected objects by the raycaster. */
	public castRay(objectsToCheck: THREE.Object3D[]) {

		// Before casting a new ray, excecutes its onHover method
		for (let int of this._intersectedObjects) {
			// @ts-ignore
			int.parent?.onHoverEnd();
		}

		this._renderLine.visible = false;
		this._renderLine.scale.set(1, 1, this.range);

		this._intersectedObjects = [];

		let tempMatrix = new THREE.Matrix4();

		// Sets raycasters world position and direction
		tempMatrix.identity().extractRotation(this.matrixWorld);
		this._raycaster.ray.origin.setFromMatrixPosition(this.matrixWorld);
		this._raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

		let intersections = this._raycaster
			.intersectObjects(objectsToCheck, true)
			.filter(int => int.object.name.includes("UISelectable"));

		if (intersections.length >= 1) {
			
			this._renderLine.visible = true;
			this._renderLine.scale.set(1, 1, intersections[0].distance);

			this._intersectedObjects = intersections.map(i => i.object);

			// gets the closest intersected object. if it has an "onHover" method,
			// executes it

			// console.log("Intersected objects:", this._intersectedObjects);

			let closestObject = this._intersectedObjects[0];

			if (closestObject) {
				// @ts-ignore
				closestObject.parent?.onHover();
			}
			
		}

	}

	/** Executes the "onSelect" method from the first UI object the
	 * raycaster intersects.
	 */
	public select() {

		// console.log("Intersected objects:", this._intersectedObjects);
		let closestObject = this._intersectedObjects[0];

		if (closestObject) {
			// @ts-ignore
			closestObject.parent?.onSelect();
		}

	}

	
	public selectStart() {

		// @ts-ignore
		this._renderLine.material.color.setHex(0x00AAFF);

	}

	public selectEnd() {

		// @ts-ignore
		this._renderLine.material.color.setHex(0xFFFFFF);

	}

}

export default UIPointer;