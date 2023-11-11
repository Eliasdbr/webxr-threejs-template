import * as THREE from "three";
import { VRButton } from 'three/addons/webxr/VRButton.js';
// import PickHelper from "./core/PickHelper";
import ControllerPickHelper from "./core/ControllerPickHelper";

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

// RENDERER
const renderer = new THREE.WebGLRenderer({
	canvas: document.getElementById("app") as HTMLCanvasElement,
	antialias: true,
});

renderer.setSize(WIDTH, HEIGHT);

// CAMERA
const mainCamera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 0.1, 1000);
mainCamera.position.set(0, 1.7, 0);

// VR Button
document.body.appendChild( VRButton.createButton( renderer ) );
// Enables xr
renderer.xr.enabled = true;

// Main scene
const mainScene = new THREE.Scene();

// VR Pickable objects
const pickRoot = new THREE.Object3D();
mainScene.add(pickRoot);

// VR Pointer
const pickHelper = new ControllerPickHelper(renderer, mainScene);

// Move objects when selected
const controllerToSelection = new Map();
pickHelper.addEventListener('selectstart', (event) => {
	//@ts-ignore | I'm tired of type-gymnastics
  const {controller, selectedObject} = event;
  const existingSelection = controllerToSelection.get(controller);
  if (!existingSelection) {
    controllerToSelection.set(controller, {
      object: selectedObject,
      parent: selectedObject.parent,
    });
    controller.attach(selectedObject);
  }
});
 
pickHelper.addEventListener('selectend', (event) => {
	//@ts-ignore | I'm tired of type-gymnastics
  const {controller} = event;
  const selection = controllerToSelection.get(controller);
  if (selection) {
    controllerToSelection.delete(controller);
    selection.parent.attach(selection.object);
  }
});

// Cube structure
const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const material = new THREE.MeshPhongMaterial({ 
	color: 0xFFFFFF,
	flatShading: true,
});
const cube = new THREE.Mesh(geometry, material);
cube.position.z = -2;
cube.position.y = 1;

// Plane structure
const plane = new THREE.Mesh(
	new THREE.PlaneGeometry(10, 10),
	new THREE.MeshPhongMaterial({
		color: 0x80C000,
		flatShading: true,
	})
);
plane.rotation.x = Math.PI / -2.0;

// Sun light
const sunColor = 0xFFFFFF;
const sunIntensity = 1;
const sunlight = new THREE.DirectionalLight(sunColor, sunIntensity);
// Sun Position and direction
sunlight.position.set(5, 10, 0);
sunlight.target.position.set(-5, 0, 0);

// Sky light
const skyColor = 0xB1E1FF;
const groundColor = 0xacfc7e;
const skyIntensity = 1;
const skyLight = new THREE.HemisphereLight(skyColor, groundColor, skyIntensity);

// Skybox
const loader = new THREE.TextureLoader();
const texture = loader.load(
	'./assets/img/sky4.jpg',
	() => {
		texture.mapping = THREE.EquirectangularReflectionMapping;
		texture.colorSpace = THREE.SRGBColorSpace;
		mainScene.background = texture;
	});

// Adds objects to the main scene
pickRoot.add(cube);
mainScene.add(plane);
mainScene.add(sunlight);
mainScene.add(sunlight.target);
mainScene.add(skyLight);
mainScene.add(mainCamera);

// Main Loop
renderer.setAnimationLoop( (time) => {
	let seconds = time * 0.001;	// converts it to seconds

	// Rotates the cube
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	pickHelper.update(pickRoot, seconds);

	renderer.render(mainScene, mainCamera);

} );
