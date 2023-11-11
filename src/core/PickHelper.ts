import * as THREE from "three";

function makeDataTexture(data: Uint8Array, width: number, height: number) {
	const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;
	texture.needsUpdate = true;
	return texture;
}

export default class PickHelper {

	raycaster: THREE.Raycaster;
	pickedObject?: any | null;		// TODO: resolve type
	cursor: THREE.Mesh;
	cursorTexture: THREE.DataTexture;
	selectTimer: number;
	selectDuration: number;
	lastTime: number;

	constructor(camera: THREE.Camera) {
		this.raycaster = new THREE.Raycaster();
		this.pickedObject = null;
		const cursorColors = new Uint8Array([
      64, 64, 64, 64,       // dark gray
      255, 255, 255, 255,   // white
    ]);
    this.cursorTexture = makeDataTexture(cursorColors, 2, 1);
 
    const ringRadius = 0.4;
    const tubeRadius = 0.1;
    const tubeSegments = 4;
    const ringSegments = 64;
    const cursorGeometry = new THREE.TorusGeometry(
			ringRadius,
			tubeRadius,
			tubeSegments,
			ringSegments
		);
 
    const cursorMaterial = new THREE.MeshBasicMaterial({
      color: 'white',
      map: this.cursorTexture,
      transparent: true,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneMinusDstColorFactor,
      blendDst: THREE.OneMinusSrcColorFactor,
    });

    const cursor = new THREE.Mesh(cursorGeometry, cursorMaterial);
    // add the cursor as a child of the camera
    camera.add(cursor);
    // and move it in front of the camera
    cursor.position.z = -1;
    const scale = 0.05;
    cursor.scale.set(scale, scale, scale);
    this.cursor = cursor;
 
    this.selectTimer = 0;
    this.selectDuration = 2;
    this.lastTime = 0;
	}

	pick(
		normalizedPosition: THREE.Vector2,
		scene: THREE.Scene,
		camera: THREE.Camera,
		time: number,
	) {
		const elapsedTime = time - this.lastTime;
    this.lastTime = time;

		const lastPickedObject = this.pickedObject;
    this.pickedObject = undefined;

		// cast a ray through the frustum
		this.raycaster.setFromCamera(normalizedPosition, camera);

		// get the list of objects the ray intersected
		const intersectedObjects = this.raycaster.intersectObjects(scene.children);

		if (intersectedObjects.length) {
			// pick the first object. It's the closest one
			this.pickedObject = intersectedObjects[0].object;
		}

		// show the cursor only if it's hitting something
		this.cursor.visible = this.pickedObject ? true : false;

		let selected = false;
	
		// if we're looking at the same object as before
		// increment time select timer
		if (this.pickedObject && lastPickedObject === this.pickedObject) {
			this.selectTimer += elapsedTime;
			if (this.selectTimer >= this.selectDuration) {
				this.selectTimer = 0;
				selected = true;
			}
		} else {
			this.selectTimer = 0;
		}
	
		// set cursor material to show the timer state
		const fromStart = 0;
		const fromEnd = this.selectDuration;
		const toStart = -0.5;
		const toEnd = 0.5;
		this.cursorTexture.offset.x = THREE.MathUtils.mapLinear(
			this.selectTimer,
			fromStart, fromEnd,
			toStart, toEnd
		);
	
		return selected ? this.pickedObject : undefined;
	}

}