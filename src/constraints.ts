import { range, Grid, count } from "js-algorithms";
import { Square } from "./square";
import { State } from "./state";


export function deriveRowConstraints(grid : Grid<Square>) : number[]
{
    return range(0, grid.height).map( y => deriveConstraint(grid.row(y)) );
}

export function deriveColumnConstraints(grid : Grid<Square>) : number[]
{
    return range(0, grid.width).map( x => deriveConstraint(grid.column(x)) );
}

function deriveConstraint(sequence : Square[])
{
    return count(sequence, x => x.state === State.Tent);
}