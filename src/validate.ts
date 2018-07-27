import { count, Grid, all, range, any, Position, filter, indices } from "js-algorithms";
import { Square } from "./square";
import { State } from "./state";
import { hasTreeAround, isTentAt, hasTentAround8, isTreeAt, noUnknownsLeft, isUnknownAt } from "./util";


export function sequenceSatisfiesConstraint(sequence : Square[], constraint : number) : boolean
{
    const nTents = count(sequence, s => s.state === State.Tent);
    const nUnknowns = count(sequence, s => s.state === State.Unknown);

    return nTents <= constraint && nTents + nUnknowns >= constraint;
}

export function gridSatisfiesConstraints(grid : Grid<Square>, rowConstraints : number[], columnConstraints : number[]) : boolean
{
    return rowsSatisfyConstraints(grid, rowConstraints) && columnsSatisfyConstraints(grid, columnConstraints);
}

function rowsSatisfyConstraints(grid : Grid<Square>, rowConstraints : number[]) : boolean
{
    return all( range(0, grid.height), y => sequenceSatisfiesConstraint(grid.row(y), rowConstraints[y]) );
}

function columnsSatisfyConstraints(grid : Grid<Square>, columnConstraints : number[]) : boolean
{
    return all( range(0, grid.width), x => sequenceSatisfiesConstraint(grid.column(x), columnConstraints[x]) );
}

export function containsTouchingTents(grid : Grid<Square>) : boolean
{
    return any( grid.positions, p => tentsTouchAt(grid, p) );
}

function tentsTouchAt(grid : Grid<Square>, position : Position) : boolean
{
    return isTentAt(grid, position) && hasTentAround8(grid, position);    
}

export function containsLoneTree(grid : Grid<Square>) : boolean
{
    return any(grid.positions, p => isLoneTree(grid, p));
}

function isLoneTree(grid : Grid<Square>, position : Position) : boolean
{
    if ( isTreeAt(grid, position) )
    {
        return all( grid.around4(position), p => noTent(p) );
    }
    else
    {
        return false;
    }

    function noTent(p : Position) : boolean
    {
        const state = grid.at(p).state;

        return state !== State.Unknown && state !== State.Tent;
    }
}

export function containsLoneTent(grid : Grid<Square>) : boolean
{
    return any(grid.positions, p => isLoneTent(grid, p));
}

function isLoneTent(grid : Grid<Square>, position : Position) : boolean
{
    return isTentAt(grid, position) && !hasTreeAround(grid, position);    
}

export function tentTreeBijectionExists(grid : Grid<Square>) : boolean
{
    const trees = filter( grid.positions, p => grid.at(p).state === State.Tree );
    const tents = filter( grid.positions, p => grid.at(p).state === State.Tent );

    if ( trees.length === tents.length )
    {
        return associate(trees, tents);
    }
    else
    {
        return false;
    }


    function associate(trees : Position[], tents : Position[]) : boolean
    {
        lonePruningFixedPoint(trees, tents);

        if ( trees.length === 0 )
        {
            return true;
        }
        else
        {
            const tree = trees[0];
            const neighbors = filter(indices(tents), p => tree.touches4(tents[p]) );

            return any( neighbors, neighbor => {
                const treesRest = trees.slice(1);

                const tentsRest = tents.slice();
                tentsRest.splice(neighbor, 1);

                return associate(treesRest, tentsRest);
            } );
        }
    }

    function lonePruningFixedPoint(trees : Position[], tents : Position[]) : boolean
    {
        let before : number;
        let after : number;

        do
        {
            before = trees.length;
            
            if ( !pruneLoneNeighbors(trees, tents) )
            {
                return false;
            }

            if ( !pruneLoneNeighbors(tents, trees) )
            {
                return false;
            }

            after = trees.length;
        } while ( after < before );

        return true;
    }

    function pruneLoneNeighbors(ps : Position[], qs : Position[]) : boolean
    {
        let i = 0;

        while ( i < ps.length )
        {
            const p = ps[i];
            const neighbors = filter(indices(qs), i => p.touches4(qs[i]));

            if ( neighbors.length === 0 )
            {
                return false;
            }
            else if ( neighbors.length === 1 )
            {
                ps.splice(i, 1);
                qs.splice(neighbors[0], 1);
            }
            else
            {
                i++;
            }
        }

        return true;
    }
}

export function isValid(grid : Grid<Square>, rowConstraints : number[], columnConstraints : number[]) : boolean
{
    return gridSatisfiesConstraints(grid, rowConstraints, columnConstraints) && !containsTouchingTents(grid);
}

export function isSolved(grid : Grid<Square>, rowConstraints : number[], columnConstraints : number[]) : boolean
{
    return noUnknownsLeft(grid) && gridSatisfiesConstraints(grid, rowConstraints, columnConstraints) && !containsTouchingTents(grid) && tentTreeBijectionExists(grid);
}
