import { Square } from "./square";
import { State } from "./state";
import { generateSolutions } from './solve';
import { Grid } from "js-algorithms";


export function* solve(trees : Grid<boolean>, rowConstraints : number[], columnConstraints : number[]) : Iterable<Grid<boolean>>
{
    if ( trees.width !== columnConstraints.length || trees.height !== rowConstraints.length )
    {
        throw new Error(`Constraints not compatible with grid`);
    }
    else
    {
        const grid = trees.map(x => new Square(x ? State.Tree : State.Unknown));

        for ( let solution of generateSolutions(grid, rowConstraints, columnConstraints) )
        {
            yield solution.map(s => s.state === State.Tent);
        }
    }
}
