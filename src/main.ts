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
import ControllerManager from "./core/ControllerManager";

// VR Pickable objects
const draggables = new THREE.Object3D();
GameScene.instance.addToWorld(draggables);

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

// Controller Model
const controller_model = await ModelManager.use_model("controller.gltf");
controller_model.position.set(0, 0.01, 0.02);
controller_model.rotation.set(Math.PI/2, 0, Math.PI/2);
// pickHelper.setControllerModel(controller_model);


// Text plane
const textPlane = new TextPlane(
	new THREE.Vector3(0,1.25,-1),
	"Hello World!",
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
draggables.add(textPlane);
GameScene.instance.addToWorld(sunlight);
GameScene.instance.addToWorld(sunlight.target);
GameScene.instance.addToWorld(skyLight);
GameScene.instance.addEntity(player);
GameScene.instance.addEntity(cube);

// Main scene
await WorldBuilder.loadLevel("test_level.json");

// Events

// TEST: Game Pause
addEventListener("hashchange", event => {
	event.preventDefault();
	// if (event.key === " ") {
		let prevState = GameScene.instance.is_paused;
		GameScene.instance.is_paused = !prevState;
		console.log("PAUSED:", !prevState);
		ControllerManager.control_mode = prevState
			? "DEFAULT"
			: "UI";
	// }
});

let test_rotation = new THREE.Vector3(0, 0.01, 0);

let pink_cube = GameScene.instance.findEntityByName("pinkCube");
if (pink_cube) {
	pink_cube.angular_velocity = test_rotation;
}

let firstTime = true;

// Main Loop
GameScene.instance.update = function(time) {
	let seconds = time * 0.001;	// converts it to seconds
	
	let gamepad = ControllerManager.updateInput()
	
	if (gamepad) {
		textPlane.setText(gamepad.buttons.map(
			(b,i) => `B${i}: ${b.pressed ? "1" : "0"}`
		).join(", "));
	}

	const session = GameScene.instance.renderer.xr.getSession()
	if (session && firstTime) {
		console.log("session found!");
		session.addEventListener("end", event => {
			event.preventDefault();
			console.log("Attempted to exit immersive mode. cancelable?", event.cancelable);
			textPlane.setText("Attempted to exit immersive mode.");
		});
		firstTime = false;
	}
};
