import GameScene from "./GameScene";

/**
 * Manages all UI logic outside VR 
 */
class UIManager {

	main_container: HTMLElement | null;

	menu_title: HTMLElement | null;
	button_play: HTMLElement | null;
	button_options: HTMLElement | null;

	public set title_text(text: string) {
		
		if (this.menu_title) {
			this.menu_title.innerText = text;
		}

	}

	public set show_ui(value: boolean) {

		if (this.main_container) {
			this.main_container.style.display = value
				? "flex"
				: "none";
		}

	}

	private static _instance = new UIManager();

	public loadUI = async () => {

		const html= await (await fetch("./ui/menu.html")).text();
	 
		let styleLinkElement = document.createElement("link");
	
		styleLinkElement.setAttribute("rel","stylesheet");
		styleLinkElement.setAttribute("type","text/css");
		styleLinkElement.setAttribute("href","./ui/menu.css");
	
		document.head.appendChild(styleLinkElement);

		if (this.main_container) {
	
			this.main_container.style.width = "100vw";
			this.main_container.style.height = "100vh";
			this.main_container.style.position= "fixed";
			this.main_container.style.top= "0";
			this.main_container.style.left= "0";
			this.main_container.innerHTML = html;
	
			document.body.appendChild(this.main_container);
		}
	
		this.button_play = document.getElementById("button-play");
		this.button_options = document.getElementById("button-options");
		this.menu_title = document.getElementById("menu-title");

		if (this.button_play) {

			this.button_play.onclick = async (_event) => {

				if (!GameScene.instance.session) {

					GameScene.instance.is_paused = false;

					GameScene.instance.session = await navigator.xr?.requestSession(
						"immersive-vr",
						{ 
							optionalFeatures: [
								'unbounded',
								'local-floor',
								'bounded-floor',
								'layers',
							],
						}
					) || null;

					if (GameScene.instance.session) {

						const onSessionEnded = () => {

							GameScene.instance.session?.removeEventListener("end", onSessionEnded );

							this.show_ui = true;

							GameScene.instance.session = null;

							GameScene.instance.is_paused = true;

						}

						await GameScene.instance.session
							.requestReferenceSpace("local-floor");

						GameScene.instance.session.addEventListener("end", onSessionEnded);

						await GameScene.instance.renderer.xr.setSession(
							GameScene.instance.session
						);

						this.button_play!!.innerText = "Resume";

						this.title_text = "Pause Menu";

						this.show_ui = false;
					}

				}

			};

		}
	}

	public static get instance() {
		return this._instance;
	}

	constructor() {
		
		this.main_container = document.createElement("div");
		
		this.show_ui = true;

		this.menu_title = null;
		this.button_play = null;
		this.button_options = null;

		this.title_text = "VR Test in Three.js + Vite";

	}
}

export default UIManager;