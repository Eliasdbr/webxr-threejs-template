import * as THREE from "three";

export default class TextPlane extends THREE.Object3D {
	text: string;
	plane: THREE.Mesh;
	texture: THREE.Texture;
	private _width: number;
	private _height: number;

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
		text: string = "Sample Text",
		width: number = 1,
		height: number = 0.5,
	) {
		super();

		this.plane = new THREE.Mesh(
			new THREE.PlaneGeometry(width, height),
			new THREE.MeshBasicMaterial({
				opacity: 0.75,
				transparent: true,
			})
		);

		this.text = text;
		this.texture = this.generateTexture();
		//@ts-ignore
		this.plane.material.map = this.texture;
		this.plane.name = "TextPlane";

		this.plane.position.set(
			position.x,
			position.y,
			position.z,
		)

		this._width = width;
		this._height = height;

		this.setText(text);

		this.add(this.plane);

		return this;
	}

	private generateTexture() {
		//create image
		var text = this.text;
		var bitmap = document.createElement('canvas');
		var g = bitmap.getContext('2d');
		bitmap.width = this._width*1024;
		bitmap.height = this._height*1024;
		if (g) {
			g.fillStyle = 'black';
			g.fillRect(0, 0, bitmap.width, bitmap.height);

			g.font = '32px monospace';

			g.fillStyle = 'white';
			g.textBaseline = 'middle';
			g.textAlign = 'center';
			g.fillText(text || "Sample Text", bitmap.width/2, bitmap.height/2);
	
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

	setPosition(pos: THREE.Vector3) {
		this.position.set(pos.x, pos.y, pos.z);
	}

	setText(text: string) {
		this.text = text;
		this.generateTexture()
	}

}