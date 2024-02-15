/**
 * Conversion utilities
 */
import * as THREE from "three";
import * as CANNON from "cannon-es";

export function cannonVec3toThreeVec3(input: CANNON.Vec3) {
	return new THREE.Vector3(
		input.x,
		input.y,
		input.z
	);
}

export function threeVec3toCannonVec3(input: THREE.Vector3) {
	return new CANNON.Vec3(
		input.x,
		input.y,
		input.z
	);
}