/**
 * This abstract class helps to make the foundations for all UI Elements.  
 */

abstract class UIBase {
	/** Determines if the component is visible or not. The space it takes
	 * will still be taken into account for its parent.
	 * @default true
	 */
	visible?: boolean;
	/** If none, the element won't be rendered. 
	 * In contrast with "visible", this element will not occupy the space in its
	 * parent.
	 * @default "none"
	 */
	display?: "none" | "flex";
	/** Just like in CSS, thetermines how the element will be positioned
	 * @default "relative"
	 */
	position?: "relative" | "fixed" | "absolute";

	/** The width of the element.
	 * @default "fit-contents"
	 */
	width?: `${number}${"px" | "%"}` | "fit-contents";
	/** The height of the element.
	 * @default "fit-contents"
	 */
	height?: `${number}${"px" | "%"}` | "fit-contents";

	/** Distance from the top of the parent and the element's top */
	top?: number;
	/** Distance from the bottom of the parent and the element's bottom */
	bottom?: number;
	/** Distance from the left of the parent and the element's left */
	left?: number;
	/** Distance from the right of the parent and the element's right */
	right?: number;

	/** If the display "flex" is selected, determines how many fractions of
	 * parent's space it will take. (Like CSS' flex-grow)
	 * 
	 * If one parent has 2 children, and each one has a grow value of 1, both 
	 * children wil take the same amount of space.
	 * If one child has a value of 1 and the other has a value of 2, the 
	 * first child will occupy 1/3rds of the parent's space, and the other will take
	 * 2/3rds of the parent's space.
	*/
	grow?: number;

	padding?: number | [number, number] | [number, number, number, number];

	margin?: number | [number, number] | [number, number, number, number];

	children?: UIBase[];
}