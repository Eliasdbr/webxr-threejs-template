import * as THREE from "three";
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import PickHelper from "./core/PickHelper";
import ControllerPickHelper from "./core/ControllerPickHelper";
import TextPlane from "./core/TextPlane";

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const MOVEMENT_SPEED = 0.01;

// RENDERER
const renderer = new THREE.WebGLRenderer({
	canvas: document.getElementById("app") as HTMLCanvasElement,
	antialias: true,
});

renderer.setSize(WIDTH, HEIGHT);
renderer.shadowMap.enabled = true;

// Player object
const player = new THREE.Object3D();

// CAMERA
const mainCamera = new THREE.PerspectiveCamera(90, WIDTH / HEIGHT, 0.1, 1000);
mainCamera.position.set(0, 1.6, 0);
player.add(mainCamera);

const playerHead = new THREE.Object3D();
mainCamera.add(playerHead);

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
			birdSound.setVolume(0.5);
			birdSound.position.set(-4, 2.5, -4);
			birdSound.loop = true;
			birdSound.play();
			mainScene.add(birdSound);
		}
	);

}

// VR Pointer
const pickHelper = new ControllerPickHelper(renderer);
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
cube.castShadow = true;

// Plane structure
const plane = new THREE.Mesh(
	new THREE.PlaneGeometry(10, 10),
	new THREE.MeshPhongMaterial({
		color: 0x80C000,
		flatShading: true,
	})
);
plane.rotation.x = Math.PI / -2.0;
plane.receiveShadow = true;

// Sun light
const sunColor = 0xFFFFFF;
const sunIntensity = 1;
const sunlight = new THREE.DirectionalLight(sunColor, sunIntensity);
// Sun Position and direction
sunlight.position.set(5, 10, 5);
sunlight.target.position.set(-5, 0, 0);
sunlight.castShadow = true;

// Sky light
const skyColor = 0xccebff;
const groundColor = 0xacfc7e;
const skyIntensity = 1;
const skyLight = new THREE.HemisphereLight(skyColor, groundColor, skyIntensity);

// Skybox
const textureLoader = new THREE.TextureLoader();
textureLoader.load(
	'./assets/img/sky4.jpg',
	skytexture => {
		skytexture.mapping = THREE.EquirectangularReflectionMapping;
		skytexture.colorSpace = THREE.SRGBColorSpace;
		mainScene.background = skytexture;
	},
	() => {},
	error => {
		console.log("Error while loading image", error)
	}
);
// Grass
plane.visible = false;

textureLoader.load(
	'./assets/img/cartoon_grass.jpeg',
	grasstexture => {
		grasstexture.colorSpace = THREE.SRGBColorSpace;
		grasstexture.repeat.set(5, 5);
		grasstexture.wrapS = THREE.RepeatWrapping;
		grasstexture.wrapT = THREE.RepeatWrapping;

		plane.material.map = grasstexture;
		plane.visible = true;
	},
	() => {},
	error => {
		console.log("Error while loading image", error)
	}
);

// Tree model
const gltfLoader = new GLTFLoader();
// Loads the whole pack
const path = "./assets/mdl/Low_Poly_Tree_GLTF.glb";
gltfLoader.load(
	path,
	(glb) => {
		const root = glb.scene;
		// console.table("MODELS:", root.children.map(o => o.name));
		// finds the specific tree model
		const tree = root.children[0];
		// console.log("MODEL:", tree);
		if (tree) {
			mainScene.add(tree);
			tree.scale.set(0.075, 0.075, 0.075);
			tree.position.set(-4, 0, -4);
		}
	}
);

gltfLoader.load(
	"./assets/mdl/detail_barrel.glb",
	(glb) => {
		const root = glb.scene;
		// console.table("MODELS:", root.children.map(o => o.name));
		// finds the specific tree model
		const barrel = root.children[0];
		// console.log("MODEL:", tree);
		if (barrel) {
			mainScene.add(barrel);
			barrel.scale.set(4.0, 4.0, 4.0);
			barrel.position.set(-4, 0, 4);
		}
	}
);
gltfLoader.load(
	"./assets/mdl/wall_gate.glb",
	(glb) => {
		const root = glb.scene;
		// console.table("MODELS:", root.children.map(o => o.name));
		// finds the specific tree model
		const wall_gate = root.children[0];
		// console.log("MODEL:", tree);
		if (wall_gate) {
			mainScene.add(wall_gate);
			wall_gate.scale.set(4.0, 4.0, 4.0);
			wall_gate.position.set(4, 0, 4);
		}
	}
);


gltfLoader.load(
	"./assets/mdl/controller.gltf",
	(gltf) => {
		const root = gltf.scene;
		const controllerModel = root.children[0];
		controllerModel.rotation.set( Math.PI/2, 0, Math.PI/2);
		controllerModel.position.set( 0, 0.01, 0.02 );
		pickHelper.setControllerModel(controllerModel);
	}
);

// Text plane
const textPlane = new TextPlane(
	new THREE.Vector3(0,1.25,-1),
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

player.add(pickHelper.controllers[0].controller);

// Adds objects to the main scene
pickRoot.add(cube);
pickRoot.add(textPlane);
mainScene.add(plane);
mainScene.add(sunlight);
mainScene.add(sunlight.target);
mainScene.add(skyLight);
mainScene.add(player);

// Main Loop
renderer.setAnimationLoop( (time) => {
	let seconds = time * 0.001;	// converts it to seconds

	// Axis movement (touchpad)
	let inputSources = renderer.xr.getSession()?.inputSources;
	if (inputSources && inputSources.length) {
		for (let source of inputSources) {
			let gamepad = source.gamepad;
			if (gamepad) {
				const quat = player.quaternion.clone();
				player.quaternion.copy(pickHelper.controllers[0].controller.getWorldQuaternion(new THREE.Quaternion()));
				
				player.position.y = 0;
				
				player.translateX(gamepad.axes[0] * MOVEMENT_SPEED);
				player.translateZ(gamepad.axes[1] * MOVEMENT_SPEED * (gamepad.axes[1] < 0 ? 2 : 1));

				player.quaternion.copy(quat);

				// Found the first gamepad, exits the loop
				break;
			}
		}
	}

	// Rotates the cube
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	pickHelper.update(pickRoot, seconds);

	renderer.render(mainScene, mainCamera);

} );
