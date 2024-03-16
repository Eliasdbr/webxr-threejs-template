import * as THREE from "three";
import GameScene from "./GameScene";
import {
	XRControllerModel,
	XRControllerModelFactory
} from "three/examples/jsm/Addons.js";
import UIPointer from "./UIPointer";

/**
 * Controller Manager.
 * 
 * Handles VR Controllers
 */

class ControllerManager {

	private static _instance = new ControllerManager();
	private static _control_mode: "DEFAULT" | "UI" = "DEFAULT";
	private _controller_models: XRControllerModel[] = [];

	public static get instance() {
		return this._instance;
	};

	public controllers = [
		GameScene.instance.renderer.xr.getController(0),
		GameScene.instance.renderer.xr.getController(1),
	];

	public static custom_models: THREE.Object3D[] = [
		new THREE.Object3D(),		// controller 0 model placeholder
		new THREE.Object3D(),		// controller 1 model placeholder
	];

	public static get control_mode() {
		return this._control_mode;
	}

	public static set control_mode(value: typeof this._control_mode) {
		this._control_mode = value;
		
		// UI Controller models
		this.instance._controller_models.forEach( 
			mdl => mdl.visible = value === "UI"
		);

		this.custom_models.forEach(
			mdl => mdl.visible = value === "DEFAULT"
		);
 
	}

	/**
	 * Constructor
	 */
	constructor() {
		const controllerModelFactory = new XRControllerModelFactory();

		for (let c in this.controllers) {

			//
			// Controller Model
			//
			const model = controllerModelFactory
					.createControllerModel(this.controllers[c]);
			
			model.rotateX(Math.PI / 6);
			model.translateY(-0.01);
			model.visible = ControllerManager._control_mode === "UI";
			this._controller_models[c] = model;
			this.controllers[c].add(model);

			//
			// UI Raycaster
			//
			let uiRaycaster = new UIPointer(5);
			uiRaycaster.name = "UIPOINTER_" + c;
			this.controllers[c].add(uiRaycaster);

			//
			// Trigger events
			//
			
			// Trigger just pressed
			this.controllers[c].addEventListener(
				"select",
				event => {
					// Checks for selectable UI elements 
					uiRaycaster.select();
					// Fires the onTrigger method
					this.onTrigger(c, event)
				}
			);

			// Hold Trigger
			this.controllers[c].addEventListener(
				"selectstart",
				_event => {
						// Changes the UIPointer color
						uiRaycaster.selectStart();
				}
			);

			// Release Trigger
			this.controllers[c].addEventListener(
				"selectend",
				_event => {
						// Changes the UIPointer color
						uiRaycaster.selectEnd();
				}
			);
		}

	}

	/**
	 * Fires when the trigger is pressed once and the 
	 * control_mode property is set to "DEFAULT".
	 */
	public onTrigger(
		_controllerIndex: string,
		_event: {
			data: XRInputSource;
		} & THREE.Event<"select", THREE.XRTargetRaySpace>
	) {

	}

	/**
	 * Sets a custom model for a controller
	 */
	public setCustomModel(
		controllerIndex: 0 | 1,
		model: THREE.Object3D,
	) {
		ControllerManager.custom_models[controllerIndex] = model;
		ControllerManager.custom_models[controllerIndex].visible = 
			ControllerManager._control_mode === "DEFAULT";
		this.controllers[controllerIndex].add(model);
	}

	/**
	 * Updates gamepad input
	 */
	public static updateInput() {
		// Axis movement (touchpad)
		let inputSources = GameScene.instance.renderer.xr.getSession()?.inputSources;
		if (inputSources && inputSources.length) {
			for (let source of inputSources) {
				let gamepad = source.gamepad;
				if (gamepad) return gamepad;
			}
		}
		return null;
	}
}

export default ControllerManager;