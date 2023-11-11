import * as THREE from "three";

type selectEvent = {
		data: XRInputSource;
	} 
	& THREE.Event<
		"select" | "selectstart" | "selectend", 
		THREE.XRTargetRaySpace
	>;

export default class ControllerPickHelper extends THREE.EventDispatcher<{ 
	type: string; controller: THREE.XRTargetRaySpace; selectedObject: any; 
}> {
	// Class properties
	raycaster: THREE.Raycaster;
	objectToColorMap: Map<
		THREE.Object3D<THREE.Object3DEventMap>,
		THREE.Color
	>;
	controllerToObjectMap: Map<
		THREE.XRTargetRaySpace,
		any
	>;
	controllers: {
		controller: THREE.XRTargetRaySpace,
		line: THREE.Line,
	}[];
	pickedObject?: THREE.Object3D<THREE.Object3DEventMap> | null;
	tempMatrix: THREE.Matrix4;

	// Constructor
	constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
		super();

		this.raycaster = new THREE.Raycaster();
    this.objectToColorMap = new Map();
    this.controllerToObjectMap = new Map();
    this.tempMatrix = new THREE.Matrix4();

    const pointerGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ]);
		const pointerMaterial = new THREE.LineBasicMaterial({
			color: 0xFFFFFF,
		})
 
    this.controllers = [];

		const selectListener = (event: selectEvent) => {
      const controller = event.target;
      const selectedObject = this.controllerToObjectMap.get(event.target);
			const line = controller.children[0]
			// @ts-ignore
			line.material.color.setHex(0x00AAFF);

      if (selectedObject) {
        this.dispatchEvent({type: event.type, controller, selectedObject});
      }
    };

		const endListener = (event: selectEvent) => {
      const controller = event.target;
			const line = controller.children[0]
			// @ts-ignore
			line.material.color.setHex(0xFFFFFF);

      this.dispatchEvent({type: event.type, controller});
    };

    for (let i = 0; i < 2; ++i) {
      const controller = renderer.xr.getController(i);
			// is beign selected
			controller.addEventListener('select', selectListener);
			// is just selected
			controller.addEventListener('selectstart', selectListener);
			// just stopped being selected
			controller.addEventListener('selectend', endListener);
      scene.add(controller);
 
      const line = new THREE.Line(pointerGeometry, pointerMaterial);
      line.scale.z = 5;
      controller.add(line);
      this.controllers.push({controller, line});
    }
  }

	_reset() {
    // restore the colors
    this.objectToColorMap.forEach((color, object) => {
			// @ts-ignore
      object.material.emissive.setHex(color);
    });
    this.objectToColorMap.clear();
    this.controllerToObjectMap.clear();
  }

	update(pickablesParent: THREE.Object3D, time: number) {
    this._reset();
    for (const {controller, line} of this.controllers) {
      // cast a ray through the from the controller
      this.tempMatrix.identity().extractRotation(controller.matrixWorld);
      this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);
      // get the list of objects the ray intersected
      const intersections = this.raycaster.intersectObjects(pickablesParent.children);
      if (intersections.length) {
        const intersection = intersections[0];
        // make the line touch the object
        line.scale.z = intersection.distance;
        // pick the first object. It's the closest one
        const pickedObject = intersection.object;
        // save which object this controller picked
        this.controllerToObjectMap.set(controller, pickedObject);
        // highlight the object if we haven't already
        if (this.objectToColorMap.get(pickedObject) === undefined) {
          // save its color
					// @ts-ignore
          this.objectToColorMap.set(pickedObject, pickedObject.material.emissive.getHex());
          // set its emissive color to flashing red/yellow
					// @ts-ignore
          pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFF2000 : 0xFF0000);
        }
      } else {
        line.scale.z = 5;
      }
    }
  }

}