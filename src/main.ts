import * as THREE from "three";
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import PickHelper from "./core/PickHelper";
import ControllerPickHelper from "./core/ControllerPickHelper";
import TextPlane from "./core/TextPlane";

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

// RENDERER
const renderer = new THREE.WebGLRenderer({
	canvas: document.getElementById("app") as HTMLCanvasElement,
	antialias: true,
});

renderer.setSize(WIDTH, HEIGHT);

// CAMERA
const mainCamera = new THREE.PerspectiveCamera(90, WIDTH / HEIGHT, 0.1, 1000);
mainCamera.position.set(0, 1.7, 0);

// Audio listener (for 3d sounds)
var audioListener: THREE.AudioListener | null = null;

// Main scene
const mainScene = new THREE.Scene();

// VR Button
const vr_button = VRButton.createButton( renderer );
document.body.appendChild( vr_button );
// Enables xr
renderer.xr.enabled = true;

// VR Pickable objects
const pickRoot = new THREE.Object3D();
mainScene.add(pickRoot);

// Enables audio context on the first click of the user
// because AudioContext won't start unless it receives some user input
document.onclick = () => {
	if (audioListener) return;

	console.log("FIRST CLICK");
	
	audioListener = new THREE.AudioListener();
	mainCamera.add( audioListener );

	// Sound loader
	const birdSound = new THREE.PositionalAudio( audioListener );
	const audioLoader = new THREE.AudioLoader();
	audioLoader.load( './assets/snd/ambience/birds-isaiah658.ogg', 
		( buffer ) => {
			birdSound.setBuffer( buffer );
			birdSound.setRefDistance( 5 );
			birdSound.setVolume(0.2);
			birdSound.position.set(-4, 2.5, -4);
			birdSound.loop = true;
			birdSound.play();
			mainScene.add(birdSound);
		}
	);

}

// VR Pointer
const pickHelper = new ControllerPickHelper(renderer, mainScene);
// Move objects when selected
const controllerToSelection = new Map();

// Cube structure
const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const material = new THREE.MeshPhongMaterial({ 
	color: 0xFFFFFF,
	flatShading: true,
});
const cube = new THREE.Mesh(geometry, material);
cube.position.z = -1.5;
cube.position.y = 1;
cube.position.x = 1;

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
const skyColor = 0xccebff;
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

// Tree model
const gltfLoader = new GLTFLoader();
// Loads the whole pack
const path = "./assets/mdl/plants_pack2.gltf";
gltfLoader.load(
	path,
	(glb) => {
		const root = glb.scene;
		console.table("MODELS:", root.children.map(o => o.name));
		// finds the specific tree model
		const tree = root.children.find(o => o.name === "Tree-01-1")
		// console.log("MODEL:", tree);
		if (tree) {
			mainScene.add(tree);
			tree.position.set(-4, 0, -4);
		}
	}
);

// Text plane
const textPlane = new TextPlane(
	new THREE.Vector3(0,1,-1.5),
	"Hello World!",
);
textPlane.rotateX(Math.PI / -8);


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
		if (selectedObject.name === "TextPlane") textPlane.setText("It changed!");
  }
});
 
pickHelper.addEventListener('selectend', (event) => {
	//@ts-ignore | I'm tired of type-gymnastics
  const {controller} = event;
  const selection = controllerToSelection.get(controller);
  if (selection) {
    controllerToSelection.delete(controller);
    selection.parent.attach(selection.object);
		if (selection.object.name === "TextPlane") textPlane.setText("Hello World!");
  }
});

// Adds objects to the main scene
pickRoot.add(cube);
pickRoot.add(textPlane);
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
