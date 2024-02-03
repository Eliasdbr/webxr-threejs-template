import * as THREE from "three";
import ControllerPickHelper from "./core/ControllerPickHelper";
import TextPlane from "./core/TextPlane";
import GameScene from "./core/GameScene";
import Player from "./core/Player";
import Entity from "./core/Entity";
import ModelManager from "./core/ModelManager";

// Player Entity
const player = new Player(new THREE.Vector3(0.0, 0.0, 0.0));

// VR Pickable objects
const pickRoot = new THREE.Object3D();
GameScene.instance.addToWorld(pickRoot);

GameScene.instance.onAudioInit = (audioListener) => {
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
			// mainScene.add(birdSound);
		}
	);
}

// VR Pointer
const pickHelper = new ControllerPickHelper(GameScene.instance.renderer);
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
		GameScene.instance.background = skytexture;
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
const tree_model = new Entity(new THREE.Vector3(-4, -0.2, -4));
tree_model.model_name = "Low_Poly_Tree_GLTF.glb";
tree_model.scale = 0.075;
tree_model.rotation = new THREE.Vector3(Math.PI/2, 0, 0);
GameScene.instance.addEntity(tree_model);

// Barrel model
const barrel_model = new Entity(new THREE.Vector3(-4, 0, 4));
barrel_model.model_name = "detail_barrel.glb";
barrel_model.scale = 4.0;
GameScene.instance.addEntity(barrel_model);

// Wall Model
const wall_model = new Entity(new THREE.Vector3(4, 0, 4));
wall_model.model_name = "wall_gate.glb";
wall_model.scale = 4.0;
GameScene.instance.addEntity(wall_model);

// Controller Model
const controller_model = await ModelManager.use_model("controller.gltf");
controller_model.position.set(0, 0.01, 0.02);
controller_model.rotation.set(Math.PI/2, 0, Math.PI/2);
pickHelper.setControllerModel(controller_model);


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

player.setController(pickHelper.controllers[0].controller);
player.appendCamera(GameScene.instance.camera);

// Adds objects to the main scene
pickRoot.add(cube);
pickRoot.add(textPlane);
GameScene.instance.addToWorld(plane);
GameScene.instance.addToWorld(sunlight);
GameScene.instance.addToWorld(sunlight.target);
GameScene.instance.addToWorld(skyLight);
GameScene.instance.addEntity(player);

// Main scene
GameScene.instance.load()

// Temp: keyboard movement
// var keyZ = 0;
// var keyX = 0;

// window.addEventListener("keydown", (event) => {
// 	keyZ = +(event.key === "w") - +(event.key === "s");
// 	keyX = +(event.key === "d") - +(event.key === "a");
// })
// window.addEventListener("keyup", (event) => {
// 	if (event.key === "w" || event.key === "s") {
// 		keyZ = 0;
// 	}
// 	if (event.key === "a" || event.key === "d") {
// 		keyX = 0;
// 	}
// })

// Main Loop
GameScene.instance.update = (time) => {
	let seconds = time * 0.001;	// converts it to seconds

	player.update();

	// Rotates the cube
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	pickHelper.update(pickRoot, seconds);
};
