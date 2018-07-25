import { Grid } from "js-algorithms";
import { Square } from '../src/square';
import { State } from '../src/state';


export function show(grid : Grid<Square>) : string
{
    const xss = grid.map(x => toChar(x.state)).toRowArray();

    return xss.map(xs => xs.join("")).join("|");


    function toChar(c : State) : string
    {
        if ( c === State.Empty) return '.';
        else if ( c === State.Tent ) return 't';
        else if ( c === State.Tree ) return 'T';
        else if ( c === State.Unknown ) return '?';
        else throw new Error(`Bug`);
    }
}