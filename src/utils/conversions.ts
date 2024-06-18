/**
 * Conversion utilities
 */
import * as THREE from "three";
import * as CANNON from "cannon-es";

/**
 * Converts a CANNON.Vec3 object to a THREE.Vector3 object.
 *
 * @param {CANNON.Vec3} input - The CANNON.Vec3 object to be converted.
 * @return {THREE.Vector3} The converted THREE.Vector3 object.
 */
export function cannonVec3toThreeVec3(input: CANNON.Vec3) {
	return new THREE.Vector3(
		input.x,
		input.y,
		input.z
	);
}

/**
 * Converts a THREE.Vector3 object to a CANNON.Vec3 object.
 *
 * @param {THREE.Vector3} input - The THREE.Vector3 object to be converted.
 * @return {CANNON.Vec3} The converted CANNON.Vec3 object.
 */
export function threeVec3toCannonVec3(input: THREE.Vector3) {
	return new CANNON.Vec3(
		input.x,
		input.y,
		input.z
	);
}

/**
 * Compares two vectors for equality within a specified error margin.
 * 
 * Accepts a combination of THREE.Vector3 and CANNON.Vec3 types
 *
 * @param {THREE.Vector3 | CANNON.Vec3} a - The first vector to compare.
 * @param {THREE.Vector3 | CANNON.Vec3} b - The second vector to compare.
 * @param {number} [errorMargin=0.0] - The maximum allowed difference between vector components.
 * @return {boolean} - True if the vectors are equal within the error margin, false otherwise.
 */
export function compareVec3(
	a: THREE.Vector3 | CANNON.Vec3, 
	b: THREE.Vector3 | CANNON.Vec3,
	errorMargin: number = 0.0,
) {
	return (
		Math.abs(a.x - b.x) <= errorMargin &&
		Math.abs(a.y - b.y) <= errorMargin &&
		Math.abs(a.z - b.z) <= errorMargin
	);
}