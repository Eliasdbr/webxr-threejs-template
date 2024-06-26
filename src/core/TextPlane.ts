import * as THREE from "three";
import GameScene from "./GameScene";

export default class TextPlane extends THREE.Object3D {
	text: string[];
	textColor: THREE.Color;
	backgroundColor: THREE.Color;

	plane: THREE.Mesh;
	texture: THREE.Texture;

	resolution: number = 1024;
	
	padding: number = 128;

	fontSize: number = 56;

	maxCharsPerLine: number = 30;
	maxLines: number = 5;

	lineHeight: number = this.fontSize * 1.5;	// in pixels

	private _width: number;
	private _height: number;

	private _pages: string[];

	private _wrapText = (text: string) => {
		let lines: string[] = [];
		let lineCount = 0;
	
		let words = text.split("\ ");
	
		while (words.length > 0 && lineCount < this.maxLines) {
			// Generate a line, word by word, taking into account each line's length
			let currentLine = "";

			// Checks if the addition of the next word excedes the max chars per line.
			// If it doesn't, add that word to the current line
			let keepLooping = true;

			while (keepLooping) {

				let nextWord = words[0];

				if (
					nextWord &&
					currentLine.length + nextWord.length <= this.maxCharsPerLine
				) {
					currentLine += nextWord + " ";
					words.shift();
					if (nextWord.includes("\n")) break;
				}
				else {
					keepLooping = false;
				}
			}
			
			lines.push(currentLine);
			lineCount++;

		}

		return lines;
	}

	public set width(value: number) {
		this._width = value
		this.plane.scale.set(value, this._height, 1);
	}
	public get width() {
		return this._width;
	}

	public set height(value: number) {
		this._height = value
		this.plane.scale.set(this._width, value, 1);
	}
	public get height() {
		return this._height;
	}
	
	constructor(
		position: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
		text: string[] = ["Sample Text"],
		width: number = 1,
		height: number = 0.5,
		textColor: THREE.Color = new THREE.Color(0xFFFFFF),
		backgroundColor: THREE.Color = new THREE.Color(0x000000),
	) {
		super();

		this.text = text;

		this.texture = new THREE.Texture();

		this.plane = new THREE.Mesh(
			new THREE.PlaneGeometry(width, height),
			new THREE.MeshBasicMaterial({
				opacity: 0.75,
				transparent: true,
			})
		);

		this._pages = text;
		
		this.textColor = textColor;
		this.backgroundColor = backgroundColor;

		//@ts-ignore
		this.plane.material.map = this.texture;
		this.plane.name = "UISelectable:TextPlane";

		this.plane.position.set(
			position.x,
			position.y,
			position.z,
		)

		this._width = width;
		this._height = height;

		this.maxCharsPerLine = Math.trunc( 
			(width*this.resolution - this.padding) / (this.fontSize*0.6) 
		);

		this.maxLines = Math.trunc( 
			(height*this.resolution - this.padding) / this.lineHeight - 1
		);

		this._nextPage();

		this.add(this.plane);

		return this;
	}

	private generateTexture() {
		//create image

		var bitmap = document.createElement('canvas');
		var g = bitmap.getContext('2d');
		bitmap.width = this._width*1024;
		bitmap.height = this._height*1024;
		if (g) {
			g.fillStyle = this.backgroundColor.getStyle();
			// roundRect() doesn't work on Oculus GO's Browser
			// g.roundRect(0, 0, bitmap.width, bitmap.height, this._height*this.padding);
			g.fillRect(0, 0, bitmap.width, bitmap.height);
			g.fill();

			g.font = `${this.fontSize}px monospace`;

			g.fillStyle = this.textColor.getStyle();
			g.textBaseline = 'top';
			g.textAlign = 'left';

			this.text.forEach((_el, ln) => {
				g?.fillText(
					this.text[ln], 
					this.padding/2, this.padding/2 + ln*this.lineHeight, 
					bitmap.width-this.padding
				);
			});

			g.fillStyle = this.textColor.getStyle();
			g.textBaseline = 'bottom';
			g.textAlign = 'right';
			g.fillText(
				this._pages.length >= 1 ? "Click to continue ->" : "< Click to close >",
				bitmap.width-this.padding/2,		// x position
				bitmap.height-this.padding/2,	// y position
				bitmap.width-this.padding			// max width
			)
	
		}
		// canvas contents will be used for a texture
		var texture = new THREE.Texture(bitmap);
		texture.needsUpdate = true;

		//@ts-ignore
		this.plane.material.map = texture;

		// clean the temporal element
		bitmap.remove();

		return texture;
	}

	private _nextPage() {

		if (this._pages.length >= 1) {

			let nextPage = this._pages.shift()!!;

			this.text = this._wrapText(nextPage);
			this.generateTexture();
		}
		else {
			this.destroy();
		}

	}


	setPosition(pos: THREE.Vector3) {
		this.position.set(pos.x, pos.y, pos.z);
	}

	onHover() {
		if (Array.isArray(this.plane.material)) {
			this.plane.material[0].opacity = 1.0;
		}
		else {
			this.plane.material.opacity = 1.0;
		}
	}

	onHoverEnd() {
		if (Array.isArray(this.plane.material)) {
			this.plane.material[0].opacity = 0.75;
		}
		else {
			this.plane.material.opacity = 0.75;
		}
	}

	onSelect() {
		this._nextPage()
	}

	destroy() {

		if (Array.isArray(this.plane.material)) {
			for (let mat of this.plane.material) {
				mat.dispose();
			}
		}
		else {
			this.plane.material.dispose();
		}

		this.plane.geometry.dispose();


		this.plane.removeFromParent();

		GameScene.instance.removeFromWorld(this);

	}

	// TODO: Hover animation
	// hoverAnimation() {
	// 	this.plane.animations.push(
	// 		new THREE.AnimationClip(
	// 			"anim_hover",
	// 			500,
	// 			[
	// 				new THREE.VectorKeyframeTrack("scale",
	// 					[0, 250, 500], [1.0, 1.1, 1.0],
	// 					THREE.InterpolateSmooth
	// 				)
	// 			]
	// 		)
	// 	)
	// }

}