import { Grid, Position } from "js-algorithms";
import { Maybe } from "maybe";
import { Square } from "./square";
export declare function generateSolutions(grid: Grid<Square>, rowConstraints: number[], columnConstraints: number[]): Iterable<Grid<Square>>;
export declare function setTreelessSquaresToEmpty(grid: Grid<Square>): void;
export declare function intersectionOfPossibilities(combinations: Iterable<Square[]>): Maybe<{
    common: Square[];
    emptyNeighbors: boolean[];
}>;
export declare function addPossibilityIntersections(grid: Grid<Square>, rowConstraints: number[], columnConstraints: number[]): boolean;
export declare function addPossibilityIntersectionToRow(grid: Grid<Square>, rowIndex: number, rowConstraint: number): boolean;
export declare function addPossibilityIntersectionToColumn(grid: Grid<Square>, columnIndex: number, columnConstraint: number): boolean;
export declare function isTentAllowedAt(grid: Grid<Square>, position: Position): boolean;
export declare function generatePossibilities(sequence: Square[], constraint: number, tentAllowed: (i: number) => boolean): Iterable<Square[]>;
