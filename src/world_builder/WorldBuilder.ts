import * as THREE from "three";
import * as CANNON from "cannon-es";
import {
	LevelInfo,
	TextureMapping,
	TextureRepeatMapping,
} from "./WorldBuilderTypes.ts";
import TextureManager from "../core/TextureManager.ts";
import GameScene from "../core/GameScene.ts";
import Entity from "../core/Entity.ts";
import ModelManager from "../core/ModelManager.ts";

export default class WorldBuilder {
	private static _LEVELS_PATH = "./levels/";

	private static _level_info: LevelInfo;

	private static _textures: Record<string,THREE.Texture> = {};
	private static _models: Record<string,THREE.Object3D> = {}
	private static _materials: Record<
		string,
		THREE.MeshBasicMaterial
		| THREE.MeshLambertMaterial
		| THREE.MeshPhongMaterial
		| THREE.MeshStandardMaterial
	> = {};
	private static _geometries: Record<string,
		THREE.BoxGeometry
		| THREE.SphereGeometry
		| THREE.CylinderGeometry
		| THREE.ConeGeometry
		| THREE.CircleGeometry
		| THREE.PlaneGeometry
		| THREE.TorusGeometry
	> = {};
	private static _meshes: Record<string, THREE.Mesh> = {};

	private static async _loadBackground() {
		const TEXTURE_MAPPING: Record<TextureMapping, THREE.AnyMapping> = {
			"uv": THREE.UVMapping,
			"cube_reflection": THREE.CubeReflectionMapping,
			"equirectangular_reflection": THREE.EquirectangularReflectionMapping,
		};

		const background = this._level_info.background;
		let new_bg = await TextureManager.use_texture(background.filename);
		new_bg.colorSpace = THREE.SRGBColorSpace;
		new_bg.mapping = TEXTURE_MAPPING[background.type];
		GameScene.instance.background = new_bg;
	}

	private static async _loadTextures() {
		const REPEAT_MAPPING: Record<TextureRepeatMapping, THREE.Wrapping> = {
			"repeat": THREE.RepeatWrapping,
			"clamp_to_edge": THREE.ClampToEdgeWrapping,
			"mirrored_repeat": THREE.MirroredRepeatWrapping,
		};

		const textures = this._level_info.textures;
		for (let t in textures) {
			const tex = textures[t];
			let new_texture = await TextureManager.use_texture(tex.filename);
			new_texture.colorSpace = THREE.SRGBColorSpace;
			new_texture.repeat.set(
				tex.repeat?.x || 1,
				tex.repeat?.y || 1,
			)
			new_texture.wrapS = REPEAT_MAPPING[tex.wrapS || "clamp_to_edge"];
			new_texture.wrapT = REPEAT_MAPPING[tex.wrapT || "clamp_to_edge"];

			this._textures[t] = new_texture;
		}
	}

	private static async _loadModels() {
		const models = this._level_info.models;
		for (let m in models) {
			const mdl = models[m];
			let new_model = await ModelManager.use_model(mdl.filename);
			this._models[m] = new_model;
		}
	}

	private static _setupMaterials() {
		// console.log("materials data:", this._level_info.materials);
		const materials = this._level_info.materials;
		for (let m in materials) {
			const mat = materials[m];

			const basicProps = {
				color: mat.color,
			};

			const lambertProps = {
				flatShading: mat.flatShading,
				emmisive: mat.emissive ? new THREE.Color(mat.emissive) : undefined,
			};

			const phongProps = {
				shininess: mat.shininess, 
			};

			const standardProps = {
				roughness: mat.roughness,
				metalness: mat.metalness,
			}

			let new_material: typeof this._materials.value;

			switch(mat.type) {
				case "basic": 
					new_material = new THREE.MeshBasicMaterial({
						...basicProps,
					});
					break;

				case "lambert": 
					new_material = new THREE.MeshLambertMaterial({
						...basicProps,
						...lambertProps,
					});
					break;
				case "phong": 
					new_material = new THREE.MeshPhongMaterial({
						...basicProps,
						...lambertProps,
						...phongProps,
					});
					break;
				case"standard": 
					new_material = new THREE.MeshStandardMaterial({
						...basicProps,
						...lambertProps,
						...phongProps,
						...standardProps,
					});
					break;
			}

			this._materials[m] = new_material;
			// console.log("CREATED MATERIAL:", new_material);
		}

	}

	private static _setupGeometries() {
		const geometries = this._level_info.geometries;
		for (let g in geometries) {
			const geo = geometries[g];

			let new_geometry = {
				"box": new THREE.BoxGeometry(geo.width, geo.height, geo.depth),
				"sphere": new THREE.SphereGeometry(
					geo.radius,
					geo.widthSegments,
					geo.heightSegments,
				),
				"cylinder": new THREE.CylinderGeometry(
					geo.radiusTop,
					geo.radiusBottom,
					geo.height,
					geo.radialSegments,
				),
				"cone": new THREE.ConeGeometry(
					geo.radius,
					geo.height,
					geo.radialSegments,
					geo.heightSegments,
				),
				"circle": new THREE.CircleGeometry(
					geo.radius,
					geo.radialSegments,
				),
				"plane": new THREE.PlaneGeometry(
					geo.width,
					geo.height,
					geo.widthSegments,
					geo.heightSegments,
				),
				"torus": new THREE.TorusGeometry(
					geo.radius,
					geo.tubeRadius,
					geo.radialSegments,
					geo.tubularSegments,
				),
			}[geo.type];

			this._geometries[g] = new_geometry;
		}
	}

	private static _initMeshes() {
		const meshes = this._level_info.world_geometry;
		// console.log("Mesh list:", meshes);
		// console.log("stored geometries:", this._geometries);
		for (let m in meshes) {
			const msh = meshes[m];

			// console.log("Mesh:", msh);

			let geo = this._geometries[msh.geometry];
			let mat = this._materials[msh.material];

			// console.log("Stored Geometry", msh.geometry, geo);
			// console.log("Stored Material", msh.material, mat);

			const new_mesh = new THREE.Mesh(geo, mat);

			new_mesh.visible = false;

			let ent = new Entity(new THREE.Vector3(
				msh.position.x,
				msh.position.y,
				msh.position.z,
			));

			new_mesh.position.set(
				msh.position.x,
				msh.position.y,
				msh.position.z,
			);
			new_mesh.rotation.set(
				msh.rotation.x,
				msh.rotation.y,
				msh.rotation.z,
			);
			new_mesh.castShadow = msh.castShadow || false;
			new_mesh.receiveShadow = msh.receiveShadow || false;

			let tex =
				this._textures[
					this.
						_level_info
						.materials[msh.material]
						.map || ""
				]
				|| null;
			
			// console.log("MATERIAL:", msh.material, new_mesh.material);
			// console.log("TEXTURE:", msh.material, tex);
			
			new_mesh.material.map = tex;

			new_mesh.visible = true;

			ent.mesh = new_mesh;
			ent.ent_name = msh.meshName;
			new_mesh.name = msh.meshName;

			if (msh.collision) {
				let new_shape: CANNON.Shape;
				if (msh.collision.copyFromGeometry) {
					switch(this._level_info.geometries[msh.geometry]?.type) {
						case "box": 
							new_shape = new CANNON.Box(new CANNON.Vec3(
								(this._level_info.geometries[msh.geometry].width || 1) / 2,
								(this._level_info.geometries[msh.geometry].height || 1) / 2,
								(this._level_info.geometries[msh.geometry].depth || 1) / 2,
							));
							break;
						case "plane": 
							new_shape = new CANNON.Box(new CANNON.Vec3(
								(this._level_info.geometries[msh.geometry].width || 1) / 2,
								(this._level_info.geometries[msh.geometry].height || 1) / 2,
								0.001,
							));
							break;
						case "sphere": 
							new_shape = new CANNON.Sphere(
								this._level_info.geometries[msh.geometry].radius || 0.5
							);
							break;
						case "cylinder": 
							new_shape = new CANNON.Cylinder(
								this._level_info.geometries[msh.geometry].radiusTop || 0.5,
								this._level_info.geometries[msh.geometry].radiusBottom || 0.5,
								this._level_info.geometries[msh.geometry].height || 0.5,
							);
							break;
						default: 
							new_shape = new CANNON.Box(new CANNON.Vec3(
								(this._level_info.geometries[msh.geometry].width || 1) / 2,
								(this._level_info.geometries[msh.geometry].height || 1) / 2,
								(this._level_info.geometries[msh.geometry].depth || 1) / 2,
							));
					}
				}
				else {
					new_shape = new CANNON.Box(new CANNON.Vec3(
						(msh.collision.boundaries?.x || 0) / 2,
						(msh.collision.boundaries?.y || 0) / 2,
						(msh.collision.boundaries?.z || 0) / 2,
					));
				} 

				const coll = new CANNON.Body({
					shape: new_shape,
					type: CANNON.Body.STATIC,
					material: new CANNON.Material({
						friction: 0.5,
					})
				});

				coll.position.set(
					msh.position.x + (msh.collision.offset?.x || 0),
					msh.position.y + (msh.collision.offset?.y || 0),
					msh.position.z + (msh.collision.offset?.z || 0),
				);

				coll.quaternion.setFromEuler(
					msh.rotation.x,
					msh.rotation.y,
					msh.rotation.z,
				);

				ent.collision = coll;
			}

			new_mesh.material.needsUpdate = true;

			this._meshes[msh.meshName] = new_mesh;
			GameScene.instance.addEntity(ent);
		}
	}

	private static async initEntities() {
		const entities = this._level_info.entity_list;
		for (let e in entities) {
			const ent = entities[e];

			const new_entity = new Entity(new THREE.Vector3(
				ent.origin.x,
				ent.origin.y,
				ent.origin.z,
			));

			if (ent.collision && ent.collision.boundaries) {
				const shp = new CANNON.Box(new CANNON.Vec3(
					ent.collision.boundaries.x,
					ent.collision.boundaries.y,
					ent.collision.boundaries.z,
				));

				const coll = new CANNON.Body({
					shape: shp,
				});

				coll.position.set(
					ent.origin.x + (ent.collision.offset?.x || 0),
					ent.origin.y + (ent.collision.offset?.y || 0),
					ent.origin.z + (ent.collision.offset?.z || 0),
				);

				new_entity.collision = coll;
			}

			new_entity.process_mode = ent.processMode;
			new_entity.ent_name = ent.entName;
			new_entity.model_name = this._level_info.models[ent.model || ""].filename;
			new_entity.scale = this._level_info.models[ent.model || ""].scale;
			new_entity.rotation = new THREE.Vector3(
				ent.rotation.x,
				ent.rotation.y,
				ent.rotation.z,
			);

			GameScene.instance.addEntity(new_entity);
		}
	}

	public static async loadLevel(filename: string) {
		let res = await fetch(this._LEVELS_PATH + filename);
		this._level_info = await res.json();

		await this._loadBackground();
		await this._loadTextures();
		await this._loadModels();

		this._setupMaterials();
		this._setupGeometries();
		this._initMeshes();
		await this.initEntities();

		await GameScene.instance.load();
	}
}