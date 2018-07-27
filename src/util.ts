import { Grid, Position, any, all, count, filter, range } from "js-algorithms";
import { Square } from "./square";
import { State } from "./state";


export function isUnknownAt(grid : Grid<Square>, position : Position) : boolean
{
    return grid.at(position).state === State.Unknown;
}

export function isTreeAt(grid : Grid<Square>, position : Position) : boolean
{
    return grid.at(position).state === State.Tree;
}

export function isTentAt(grid : Grid<Square>, position : Position) : boolean
{
    return grid.at(position).state === State.Tent;
}

export function isEmptyAt(grid : Grid<Square>, position : Position) : boolean
{
    return grid.at(position).state === State.Empty;
}

export function hasTreeAround(grid : Grid<Square>, position : Position) : boolean
{
    return any(grid.around4(position), p => grid.at(p).state === State.Tree);
}

export function hasTentAround8(grid : Grid<Square>, position : Position) : boolean
{
    return any(grid.around8(position), p => grid.at(p).state === State.Tent);
}

export function noUnknownsLeft(grid : Grid<Square>) : boolean
{
    return all(grid.positions, p => grid.at(p).state !== State.Unknown);
}

export function unknownCount(grid : Grid<Square>) : number
{
    return count(grid.positions, p => isUnknownAt(grid, p));
}

export function unknownsAround(grid : Grid<Square>, position : Position) : Position[]
{
    return filter(grid.around4(position), p => isUnknownAt(grid, p));
}

export function countEmptyAround(grid : Grid<Square>, position : Position) : number
{
    return count(grid.around4(position), p => isEmptyAt(grid, p));
}

export function countTreesAround(grid : Grid<Square>, position : Position) : number
{
    return count(grid.around4(position), p => isTreeAt(grid, p));
}

export function copy(grid : Grid<Square>) : Grid<Square>
{
    return grid.map(x => x.copy());
}

export function copySequence(sequence : Square[]) : Square[]
{
    return sequence.map(x => x.copy());
}

export function show(grid : Grid<Square>) : string
{
    return range(0, grid.height).map(i => showSequence(grid.row(i))).join("|");    
}

export function showSequence(sequence : Square[]) : string
{
    return sequence.map(x => toChar(x.state)).join('');


    function toChar(c : State) : string
    {
        if ( c === State.Empty) return '.';
        else if ( c === State.Tent ) return 't';
        else if ( c === State.Tree ) return 'T';
        else if ( c === State.Unknown ) return '?';
        else throw new Error(`Bug`);
    }
}

export function surroundWithEmpty(grid : Grid<Square>, position : Position) : boolean
{
    for ( let p of grid.around8(position) )
    {
        if ( isTentAt(grid, p) )
        {
            return false;
        }
        else if ( isUnknownAt(grid, p) )
        {
            grid.at(p).state = State.Empty;
        }
    }

    return true;
}

export function surroundWithEmptyIfTent(grid : Grid<Square>, position : Position) : boolean
{
    if ( isTentAt(grid, position) )
    {
        return surroundWithEmpty(grid, position);
    }
    else
    {
        return true;
    }
}