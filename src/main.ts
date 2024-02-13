import * as THREE from "three";
import * as CANNON from "cannon-es";

import ControllerPickHelper from "./core/ControllerPickHelper";
import TextPlane from "./core/TextPlane";
import GameScene from "./core/GameScene";
import Player from "./core/Player";
import Entity from "./core/Entity";
import ModelManager from "./core/ModelManager";
// import TextureManager from "./core/TextureManager";
import AudioManager from "./core/AudioManager";
import WorldBuilder from "./world_builder/WorldBuilder";

// VR Pickable objects
const pickRoot = new THREE.Object3D();
GameScene.instance.addToWorld(pickRoot);

GameScene.instance.debug_show_collisions = true;

// Setup sound effects
GameScene.instance.onAudioInit = async (audioListener) => {
	const birdSoundEmitter = new THREE.PositionalAudio( audioListener );
	const birdSound = await AudioManager.use_audio('ambience/birds-isaiah658.ogg');
	birdSoundEmitter.setBuffer( birdSound );
	birdSoundEmitter.setRefDistance( 5 );
	birdSoundEmitter.setVolume(0.5);
	birdSoundEmitter.position.set(-4, 2.5, -4);
	birdSoundEmitter.loop = true;
	birdSoundEmitter.play();
	GameScene.instance.addToWorld(birdSoundEmitter);

}

// VR Pointer
const pickHelper = new ControllerPickHelper(GameScene.instance.renderer);
// Move objects when selected
const controllerToSelection = new Map();

// Cube structure
const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const material = new THREE.MeshPhongMaterial({ 
	color: 0xAAFFFF,
	flatShading: true,
});
const cubeMesh = new THREE.Mesh(geometry, material);
cubeMesh.castShadow = true;
// Cube collision
const cubeCollision = new CANNON.Body({
	type: CANNON.Body.DYNAMIC,
	material: new CANNON.Material({
		friction: 0.5,
	}),
	mass: 1,
	shape: new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.25)),
});
cubeCollision.position.set(1, 1, -1.5);
cubeCollision.quaternion.setFromEuler(-Math.PI / 4.0, -Math.PI / 4.0, 0);
// Cube Entity
const cube = new Entity(new THREE.Vector3(1, 1, -1.5));
cube.collision = cubeCollision;
cube.mesh = cubeMesh;

// // Plane structure
// const planeMesh = new THREE.Mesh(
// 	new THREE.PlaneGeometry(1000, 1000),
// 	new THREE.MeshPhongMaterial({
// 		color: 0x80C000,
// 		flatShading: true,
// 	})
// );
// planeMesh.rotation.x = Math.PI / -2.0;
// planeMesh.receiveShadow = true;

// // Plane collision
// const planeCollision = new CANNON.Body({
// 	type: CANNON.Body.STATIC,
// 	material: new CANNON.Material({
// 		friction: 0.5,
// 	}),
// 	shape: new CANNON.Plane(),
// });
// planeCollision.quaternion.setFromEuler(-Math.PI / 2.0, 0, 0);
// // Plane Entity
// const plane = new Entity(new THREE.Vector3(0,0,0));
// plane.collision = planeCollision;
// plane.mesh = planeMesh;

// // Grass Texture for the plane
// planeMesh.visible = false;	// Hides the plane until the grass texture loads

// const grasstexture = await TextureManager.use_texture("cartoon_grass.jpeg");
// grasstexture.colorSpace = THREE.SRGBColorSpace;
// grasstexture.repeat.set(5, 5);
// grasstexture.wrapS = THREE.RepeatWrapping;
// grasstexture.wrapT = THREE.RepeatWrapping;

// planeMesh.material.map = grasstexture;
// planeMesh.visible = true;

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
// const skytexture = await TextureManager.use_texture("sky4.jpg");
// skytexture.mapping = THREE.EquirectangularReflectionMapping;
// skytexture.colorSpace = THREE.SRGBColorSpace;
// GameScene.instance.background = skytexture;

// Tree model
// const tree_model = new Entity(new THREE.Vector3(-4, -0.2, -4));
// tree_model.model_name = "Low_Poly_Tree_GLTF.glb";
// tree_model.scale = 0.075;
// tree_model.rotation = new THREE.Vector3(Math.PI/2, 0, 0);
// GameScene.instance.addEntity(tree_model);

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

// Player Entity
const player = new Player(new THREE.Vector3(0, 0, 0));

player.setController(pickHelper.controllers[0].controller);
player.appendCamera(GameScene.instance.camera);

// Adds objects to the main scene
pickRoot.add(textPlane);
GameScene.instance.addToWorld(sunlight);
GameScene.instance.addToWorld(sunlight.target);
GameScene.instance.addToWorld(skyLight);
// GameScene.instance.addEntity(plane);
GameScene.instance.addEntity(player);
GameScene.instance.addEntity(cube);

// Main scene
await WorldBuilder.loadLevel("test_level.json");
GameScene.instance.load()

// window.addEventListener("keydown", (event) => {
// 	event.key === "Space";
// })

// TEMP: Testing the Entity.destroy() method.
// setTimeout(() => {
// 	cube.destroy();
// }, 5000);

// Main Loop
GameScene.instance.update = function(time) {
	let seconds = time * 0.001;	// converts it to seconds

	// Rotates the cube
	pickHelper.update(pickRoot, seconds);
};
