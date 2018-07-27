import { Square } from "./square";
import { State } from "./state";
import { generateSolutions } from './solve';
import { Grid, createGrid } from "js-algorithms";


export function* solve(trees : boolean[][], rowConstraints : number[], columnConstraints : number[]) : Iterable<boolean[][]>
{
    const width = trees.length;
    const height = trees[0].length;
    const treeGrid = createGrid(width, height, p => trees[p.x][p.y] );

    if ( treeGrid.width !== columnConstraints.length || treeGrid.height !== rowConstraints.length )
    {
        throw new Error(`Constraints not compatible with grid`);
    }
    else
    {
        const grid = treeGrid.map(x => new Square(x ? State.Tree : State.Unknown));

        for ( let solution of generateSolutions(grid, rowConstraints, columnConstraints) )
        {
            yield solution.map(s => s.state === State.Tent).toRowArray();
        }
    }
}
