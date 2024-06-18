import * as THREE from "three";
import * as CANNON from "cannon-es";

// import ControllerPickHelper from "./core/ControllerPickHelper";
import TextPlane from "./core/TextPlane";
import GameScene from "./core/GameScene";
import Player from "./core/Player";
import Entity from "./core/Entity";
import ModelManager from "./core/ModelManager";
import AudioManager from "./core/AudioManager";
import WorldBuilder from "./world_builder/WorldBuilder";
import ControllerManager, { MOVEMENT } from "./core/ControllerManager";
import UIManager from "./core/UIManager";
import UIPointer from "./core/UIPointer";
import ControllerTeleporter from "./core/ControllerTeleporter";

// Off-VR Menu
UIManager.instance.loadUI();


// VR Pickable objects
const uiElements = new THREE.Object3D();
GameScene.instance.addToWorld(uiElements);

GameScene.instance.debug_show_collisions = false;

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

// Text plane
const textPlane = new TextPlane(
	new THREE.Vector3(0, 1.25, -1),
	[
		"Hello World!\n \n This is a text box that can have multiple pages.",
		"This, for example, is another page.",
		"It can be used as a guide for a tutorial.",
		"Have fun!"
	],
	1.5, 1.0,
);
textPlane.rotateX(Math.PI / -8);

// Primary Controller custom model
const glove_model = await ModelManager.use_model("Glove.glb");
glove_model.rotateY(Math.PI);
glove_model.rotateZ(Math.PI/2);
glove_model.scale.set(0.25,0.25,0.25);
ControllerManager.instance.setCustomModel(0, glove_model);

// Player Entity
const player = new Player(new THREE.Vector3(0, 0, 0));

player.setController(ControllerManager.instance.controllers[0]);
player.appendCamera(GameScene.instance.camera);

// Adds objects to the main scene
uiElements.add(textPlane);
GameScene.instance.addToWorld(sunlight);
GameScene.instance.addToWorld(sunlight.target);
GameScene.instance.addToWorld(skyLight);
GameScene.instance.addEntity(player);
GameScene.instance.addEntity(cube);

// Main scene
await WorldBuilder.loadLevel("test_level.json");

let test_rotation = new THREE.Vector3(0, 0.01, 0);

let pink_cube = GameScene.instance.findEntityByName("pinkCube");
if (pink_cube) {
	pink_cube.angular_velocity = test_rotation;
}

window.addEventListener( "resize", onWindowResize, false );

function onWindowResize(){

  GameScene.instance.camera.aspect = window.innerWidth / window.innerHeight;
  GameScene.instance.camera.updateProjectionMatrix();

  GameScene.instance.renderer.setSize( window.innerWidth, window.innerHeight );

}

ControllerManager.movement_mode = MOVEMENT.DASH;

let prevTime = 0;

let prevMillis = 0;

let teleporterHelper = ControllerManager.instance.controllers[0]
.getObjectByName("Teleporter:CTRL_0") as ControllerTeleporter;

// Main Loop
GameScene.instance.update = function(time) {
	/** 
	 * Delta time.
	 * 
	 * Difference between the previous frame and the current.
	 **/
	const deltaTime = (time - prevMillis) / 1000;

	// Updates UIPointers raycasters, to be able to select UI Objects.
	// but just update every 0.05 seconds
	if (time > prevTime + 50) {

		let uiPointer0 = ControllerManager
			.instance
			.controllers[0]
			.getObjectByName("UIPOINTER_0") as UIPointer | undefined;

		// For Oculus GO, omit this controller
		// let uiPointer1 = ControllerManager
		// 	.instance
		// 	.controllers[1]
		// 	.getObjectByName("UIPOINTER_1") as UIPointer | undefined;

		// console.log("uiPointer?", !!uiPointer0);

		uiPointer0?.castRay([uiElements]);
		// uiPointer1?.castRay([uiElements]);

		prevTime = time;
	}

	// Updates the teleporterHelpers cooldown
	teleporterHelper.update(deltaTime);

	prevMillis = time;

};
