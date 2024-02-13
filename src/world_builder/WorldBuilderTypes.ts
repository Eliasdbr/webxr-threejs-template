// import * as THREE from "three";

/* Three dimentional Vector */
export type Vec3 = {
	x: number,
	y: number,
	z: number,
}
/* Three dimentional Vector */
export type Vec2 = {
	x: number,
	y: number,
}

/**
 * Texture Mapping modes.
 */
export type TextureMapping =
	"uv" |
	"cube_reflection" |
	"equirectangular_reflection";

/**
 * Texture Repeat wrapping modes
 */
export type TextureRepeatMapping =
	"repeat" |
	"clamp_to_edge" |
	"mirrored_repeat";

/**
 * Texture Options.
 */
export type TextureOptions = {
	filename: string,
	mapping?: TextureMapping,
	wrapS?: TextureRepeatMapping,
	wrapT?: TextureRepeatMapping,
	repeat?: Vec2,	// x->u, y->v
}

/**
 * Contains the list of textures needed to load, in the structure of
 * key-value pairs.
 * 
 * The key being the texture name, and the value being
 * the texture filename.
 */
export type TextureDict = Record<string,TextureOptions>;

/**
 * Material types. From fastest to slowest in terms of GPU usage
 */
export type MaterialTypes = 
	"basic"	|
	"lambert" |
	"phong" |
	"standard";

/**
 * Material Options. Sets how a mesh surface behaves with the presence of
 * light. 
 */
export type MaterialOptions = {
	type: MaterialTypes,
	/** What texture it has assigned. This is the name to reference in the
	 * TextureDict.
	 */
	map: string | null,

	color: string | number,
	// Lambert type Materials also have:
	flatShading?: boolean,
	emissive?: string,
	// Phong type Materials also have:
	shininess?: number,
	// Standard type Materials also have:
	roughness?: number,
	metalness?: number,
}

/**
 * Geometry types. Different types of primitive shapes
 */
export type GeometryTypes = 
	"box" |
	"sphere" |
	"cylinder" |
	"cone" |
	"circle" |
	"plane" |
	"torus";

/**
 * Geometry options. Details about the geometry shape.
 */
export type GeometryOptions = {
	type: GeometryTypes,
	// For Boxes and Planes
	width?: number,
	height?: number,	// Also for Cones and Spheres
	// For Boxes
	depth?: number,
	// For Circles, Spheres, Cones, and Torus
	radius?: number,
	// For Circles, Cones, and Torus
	radialSegments?: number,
	// For Cylinders
	radiusTop?: number,
	radiusBottom?: number,
	// For Spheres
	widthSegments?: number,
	heightSegments?: number,
	// For Torus
	tubeRadius?: number,
	tubularSegments?: number,
}

/**
 * Collision options. Sets the collisions for the world mesh
 */
export type CollisionOptions = {
	/** If true, copies shape and info from the mesh geometry */
	copyFromGeometry?: boolean,
	/** 
	 * Sets the collision box boundaries.
	 * 
	 * If copyFromGeometry == true, this is ignored.
	 */
	boundaries?: Vec3,
	/** 
	 * Sets the collision box rotation.
	 * 
	 * If ommited, it copies from its mesh.
	 * 
	 * If copyFromGeometry == true, this is ignored.
	 */
	rotation?: Vec3,
}

/**
 * Contains a list of Materials 
 */
export type MaterialDict = Record<string,MaterialOptions>;

/**
 * Contains a list of Materials 
 */
export type GeometryDict = Record<string,GeometryOptions>;

/** 
 * Mesh Options. Contains all the necessary data to make a shape with 
 * geometry, material, collision, position and rotation to be added
 * to the world.
 */
export type MeshOptions = {
	meshName: string,
	geometry: keyof GeometryDict,
	material: keyof MaterialDict,
	position: Vec3,
	rotation: Vec3,
	collision: CollisionOptions | null,
	castShadow?: boolean,
	receiveShadow?: boolean,
}

/**
 * Contains a list of Meshes for the world 
 */
export type MeshList = Array<MeshOptions>;

/**
 * Level data.
 * 
 * Here lies all the info to make a level.
 */
export type LevelInfo = {
	textures: TextureDict,
	materials: MaterialDict,
	geometries: GeometryDict,

	world_geometry: MeshList,
}