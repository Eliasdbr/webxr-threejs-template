import {
	AudioListener,
	PerspectiveCamera,
	Scene,
	WebGLRenderer
} from "three";
import { VRButton } from 'three/addons/webxr/VRButton.js';

class GameScene {
	
	private static _instance = new GameScene();

	public static get instance() {
		return this._instance;
	}

	private _width: number;
	private _height: number;

	public renderer: WebGLRenderer;
	public camera: PerspectiveCamera;
	public audio_listener: AudioListener | null;

	public scene = new Scene();

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
			this.renderer.render(this.scene, this.camera);
		});

	}

	/** Update method. Runs every frame */
	public update = (time: number) => {
		// nothing
	}

	/** Excecutes once the audio has initialized */
	public onAudioInit = (audio_listener: THREE.AudioListener) => {
		// nothing
	}
}

export default GameScene;