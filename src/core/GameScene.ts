import {
	AudioListener,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
	Texture,
	EquirectangularReflectionMapping,
	SRGBColorSpace,
	Object3D,
} from "three";
import { VRButton } from 'three/addons/webxr/VRButton.js';
import Entity from "./Entity";

class GameScene {
	
	private static _instance = new GameScene();

	private _entities: Entity[] = [];
	private _background: Texture | null = null;
	private _world: Object3D = new Object3D();

	public static get instance() {
		return this._instance;
	}

	private _width: number;
	private _height: number;
	private _scene = new Scene();

	public renderer: WebGLRenderer;
	public camera: PerspectiveCamera;
	public audio_listener: AudioListener | null;

	public set background(texture: Texture | null) {
		if (texture) {
			this._background = texture;
			this._background.mapping = EquirectangularReflectionMapping;
			this._background.colorSpace = SRGBColorSpace;
			this._scene.background = this._background;
		}
	}
	public get background() {
		return this._background;
	}

	private constructor() {

		// --- SCREEN PROPERTIES ---
		this._width = window.innerWidth;
		this._height = window.innerHeight;

		// --- RENDERER SECTION ---
		this.renderer = new WebGLRenderer({
			canvas: document.getElementById("app") as HTMLCanvasElement,
			antialias: true,
			alpha: true,
		});
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this._width, this._height);
		this.renderer.shadowMap.enabled = true;

		// CAMERA SECTION
		const aspectRatio = this._width / this._height;
		this.camera = new PerspectiveCamera(90, aspectRatio, 0.1, 1000);
		this.camera.position.set(0, 1.6, 0);

		// WORLD SECTION
		this._scene.add(this._world);

		// AUDIO SECTION
		this.audio_listener = null;

		document.onclick = () => {
			if (this.audio_listener) {
				document.onclick = null;
				return;
			}
			this.audio_listener = new AudioListener();
			this.camera.add(this.audio_listener);
			this.onAudioInit(this.audio_listener);
		}

		// VR STUFF
		const vr_button = VRButton.createButton( this.renderer );
		document.body.appendChild( vr_button );
		this.renderer.xr.enabled = true;

		// GAME LOOP
		this.renderer.setAnimationLoop((time) => {
			this.update(time);
			this.renderer.render(this._scene, this.camera);
		});

	}

	public addToWorld(obj: Object3D) {
		this._world.add(obj);
	}

	public addEntity = (ent: Entity) => {
		return this._entities.push(ent);
	}

	public getEntityById = (ent_id: number) => {
		return this._entities[ent_id] ? this._entities[ent_id] : null;
	}

	/** Load method. Loads everything for the game */
	public load = async () => {
		// Load entities for the game
		for (let ent of this._entities) {
			await ent.load();
			if (ent.mesh) this._scene.add(ent.mesh);
		}
	}

	/** Update method. Runs every frame */
	public update = (_time: number) => {
		// nothing
	}

	/** Excecutes once the audio has initialized */
	public onAudioInit = (_audio_listener: THREE.AudioListener) => {
		// nothing
	}
}

export default GameScene;