import { Grid, createGrid } from 'js-algorithms';
import { Square } from "./square";
import { State } from "./state";


export function parse(string : string) : Grid<Square>
{
    const lines = string.trim().split('\n').map(s => s.trim().split(''));
    const height = lines.length;
    const width = lines[0].length;

    return createGrid<Square>(width, height, p => new Square(parseChar(lines[p.y][p.x])));
}

export function parseSequence(string : string) : Square[]
{
    return parse(string).row(0);
}

function parseChar(c : string) : State
{
    if ( c === '.' )
    {
        return State.Empty;
    }
    else if ( c === 'T')
    {
        return State.Tree;
    }
    else if ( c === 't' )
    {
        return State.Tent;
    }
    else if ( c === '?' )
    {
        return State.Unknown;
    }
    else
    {
        throw new Error(`Invalid character ${c}`);
    }
}