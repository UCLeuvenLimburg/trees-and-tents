import { Grid, Position, all, find, count, createArray, repeat, indices, any, range, filter } from "js-algorithms";
import { Maybe } from "maybe";
import { Square } from "./square";
import { State } from "./state";
import { isSolved, isValid } from "./validate";
import { hasTreeAround, isUnknownAt, isTreeAt, hasTentAround, unknownCount, noUnknownsLeft, countEmptyAround, unknownsAround, copy, copySequence, showSequence, show } from "./util";


export function* generateSolutions(grid : Grid<Square>, rowConstraints : number[], columnConstraints : number[]) : Iterable<Grid<Square>>
{
    if ( noUnknownsLeft(grid) )
    {
        if ( isSolved(grid, rowConstraints, columnConstraints) )
        {
            yield grid;
        }
    }
    else
    {
        setTreelessSquaresToEmpty(grid);

        if ( simplifyGrid(grid, rowConstraints, columnConstraints) )
        {
            if ( noUnknownsLeft(grid) )
            {
                if ( isSolved(grid, rowConstraints, columnConstraints) )
                {
                    yield grid;
                }
            }
            else
            {
                yield* guess(grid, rowConstraints, columnConstraints);
            }
        }
    }
}

function simplifyGrid(grid : Grid<Square>, rowConstraints : number[], columnConstraints : number[]) : boolean
{
    let lastCount = Number.POSITIVE_INFINITY;
    let simplifiers = [
        () => placeTentNextToTreesSurroundedByThreeEmptySquares(grid),
        () => fillInUnambiguousSquares(grid, rowConstraints, columnConstraints),
        () => addPossibilityIntersections(grid, rowConstraints, columnConstraints)
    ];

    let i = 0;
    while ( i < simplifiers.length )
    {
        // console.log(`Simplifier ${i}`);
        const simplifier = simplifiers[i];
        simplifier();
        const currentMetric = unknownCount(grid);

        if ( currentMetric < lastCount )
        {
             i = 0;
        }
        else
        {
            i++;
        }

        lastCount = currentMetric;
    }

    return isValid(grid, rowConstraints, columnConstraints);
}


function* guess(grid : Grid<Square>, rowConstraints : number[], columnConstraints : number[]) : Iterable<Grid<Square>>
{
    const maybeUnknownPosition = findUnknownPosition(grid);

    if ( maybeUnknownPosition.isJust() )
    {
        const unknownPosition = maybeUnknownPosition.value;

        const copied1 = copy(grid);
        copied1.at(unknownPosition).state = State.Empty;
        yield* generateSolutions(copied1, rowConstraints, columnConstraints);

        const copied2 = copy(grid);
        copied2.at(unknownPosition).state = State.Tent;
        yield* generateSolutions(copied2, rowConstraints, columnConstraints);
    }
    else
    {
        throw new Error(`Bug: there should be at least one unknown`);
    }
}

export function setTreelessSquaresToEmpty(grid : Grid<Square>)
{
    for ( let position of grid.positions )
    {
        if ( isTreeLessSquare(position) )
        {
            grid.at(position).state = State.Empty;
        }
    }

    function isTreeLessSquare(position : Position) : boolean
    {
        return isUnknownAt(grid, position) && !hasTreeAround(grid, position);
    }
}


export function intersectionOfPossibilities(combinations : Iterable<Square[]>) : Maybe<{ common : Square[], emptyNeighbors : boolean[] }>
{
    const iterator = combinations[Symbol.iterator]();
    const first = iterator.next();

    if ( first.done )
    {
        return Maybe.nothing();
    }
    else
    {
        const common = first.value;
        const emptyNeighbors = repeat<boolean>(common.length, true);
        updateEmptyNeighbors(emptyNeighbors, first.value);

        let current = iterator.next();

        while ( !current.done && (any(common, x => x.state !== State.Unknown) || any(emptyNeighbors, x => x)) )
        {
            const sequence = current.value;

            for ( let i = 0; i !== sequence.length; ++i )
            {
                if ( common[i].state !== sequence[i].state )
                {
                    common[i].state = State.Unknown;
                }
            }

            updateEmptyNeighbors(emptyNeighbors, sequence);

            current = iterator.next();
        }

        return Maybe.just( { common, emptyNeighbors } );
    }


    function tentInProximity(sequence : Square[], i : number) : boolean
    {
        let result = false;

        result = result || (i > 0 && sequence[i-1].state === State.Tent);
        result = result || sequence[i].state === State.Tent;
        result = result || (i + 1 < sequence.length && sequence[i+1].state === State.Tent);

        return result;
    }

    function updateEmptyNeighbors(emptyNeighbors : boolean[], sequence : Square[])
    {
        for ( let i = 0; i !== sequence.length; ++i )
        {
            if ( !tentInProximity(sequence, i) )
            {
                emptyNeighbors[i] = false;
            }
        }
    }
}

export function addPossibilityIntersections(grid : Grid<Square>, rowConstraints : number[], columnConstraints : number[]) : boolean
{
    if ( any(range(0, grid.height), y => !addPossibilityIntersectionToRow(grid, y, rowConstraints[y])) )
    {
        return false;
    }

    if ( any(range(0, grid.width), x => !addPossibilityIntersectionToColumn(grid, x, columnConstraints[x])) )
    {
        return false;
    }

    return true;
}

export function addPossibilityIntersectionToRow(grid : Grid<Square>, rowIndex : number, rowConstraint : number) : boolean
{
    return addPossibilityIntersectionsToSequence(grid.row(rowIndex), rowConstraint, x => isTentAllowedAt(grid, new Position(x, rowIndex)), neighboringRows(grid, rowIndex));
}

export function addPossibilityIntersectionToColumn(grid : Grid<Square>, columnIndex : number, columnConstraint : number) : boolean
{
    return addPossibilityIntersectionsToSequence(grid.column(columnIndex), columnConstraint, y => isTentAllowedAt(grid, new Position(columnIndex, y)), neighboringColumns(grid, columnIndex));
}

function addPossibilityIntersectionsToSequence(sequence : Square[], constraint : number, tentAllowed : (i : number) => boolean, neighbors : Square[][]) : boolean
{
    const combinations = generatePossibilities(sequence, constraint, tentAllowed);
    const result = intersectionOfPossibilities(combinations);

    if ( result.isJust() )
    {
        const { common, emptyNeighbors } = result.value;

        for ( let i of indices(common) )
        {
            if ( sequence[i].state === State.Unknown )
            {
                sequence[i].state = common[i].state;
            }

            if ( emptyNeighbors[i] )
            {
                for ( let neighbor of neighbors )
                {
                    if ( neighbor[i].state === State.Unknown )
                    {
                        neighbor[i].state = State.Empty;
                    }
                    else if ( neighbor[i].state === State.Tent )
                    {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    else
    {
        return false;
    }
}

function neighboringRows(grid : Grid<Square>, y : number) : Square[][]
{
    const result = [];

    if ( y > 0 )
    {
        result.push(grid.row(y - 1));
    }

    if ( y + 1 < grid.height )
    {
        result.push(grid.row(y + 1));
    }

    return result;
}

function neighboringColumns(grid : Grid<Square>, x : number) : Square[][]
{
    const result = [];

    if ( x > 0 )
    {
        result.push(grid.column(x - 1));
    }

    if ( x + 1 < grid.width )
    {
        result.push(grid.column(x + 1));
    }

    return result;
}

export function isTentAllowedAt(grid : Grid<Square>, position : Position) : boolean
{
    return grid.at(position).state === State.Unknown && !hasTentAround(grid, position) && hasTreeAround(grid, position);
}

export function generatePossibilities(sequence : Square[], constraint : number, tentAllowed : (i : number) => boolean) : Iterable<Square[]>
{
    const nTents = count(sequence, s => s.state === State.Tent);
    const nTentsLeftToPlace = constraint - nTents;

    return generate(copySequence(sequence), 0, nTentsLeftToPlace);


    function* generate(sequence : Square[], i : number, nTentsLeftToPlace : number) : Iterable<Square[]>
    {
        while ( i !== sequence.length && sequence[i].state !== State.Unknown )
        {
            ++i;
        }

        if ( i === sequence.length )
        {
            if ( nTentsLeftToPlace === 0 )
            {
                yield sequence;
            }
        }
        else
        {
            if ( nTentsLeftToPlace > 0 && (i === 0 || sequence[i-1].state !== State.Tent) && tentAllowed(i) )
            {
                const copy = copySequence(sequence);
                copy[i].state = State.Tent;

                yield* generate(copy, i + 1, nTentsLeftToPlace - 1);
            }

            const copy = copySequence(sequence);
            copy[i].state = State.Empty;

            yield* generate(copy, i + 1, nTentsLeftToPlace);
        }
    }
}

function findUnknownPosition(grid : Grid<Square>) : Maybe<Position>
{
    return find( grid.positions, p => isUnknownAt(grid, p) );
}

function placeTentNextToTreesSurroundedByThreeEmptySquares(grid : Grid<Square>) : boolean
{
    for ( let y = 0;  y !== grid.height; ++y )
    {
        for ( let x = 0; x !== grid.width; ++x )
        {
            const position = new Position(x, y);

            placeTentNextToTreesSurroundedByThreeEmptySquaresAt(grid, position);
        }
    }

    return true;
}

function placeTentNextToTreesSurroundedByThreeEmptySquaresAt(grid : Grid<Square>, position : Position)
{
    if ( grid.at(position).state === State.Tree )
    {
        const unknowns = unknownsAround(grid, position);
        const nEmpty = countEmptyAround(grid, position);

        if ( unknowns.length === 1 && nEmpty === 3 )
        {
            const unknownPosition = unknowns[0];

            grid.at(unknownPosition).state = State.Tent;
        }
    }
}

function fillInUnambiguousSquares(grid : Grid<Square>, rowConstraints : number[], columnConstraints : number[]) : boolean
{
    return processRows() && processColumns();


    function processRows()
    {
        return all(range(0, grid.height), y => processSequence(grid.row(y), rowConstraints[y]));
    }

    function processColumns()
    {
        return all(range(0, grid.width), x => processSequence(grid.column(x), columnConstraints[x]));
    }

    function processSequence(sequence : Square[], constraint : number) : boolean
    {
        const unknowns = filter(sequence, s => s.state == State.Unknown);
        const nTents = count(sequence, s => s.state == State.Tent);

        if ( nTents === constraint )
        {
            for ( let unknown of unknowns )
            {
                unknown.state = State.Empty;
            }

            return true;
        }
        else if ( nTents + unknowns.length === constraint )
        {
            for ( let unknown of unknowns )
            {
                unknown.state = State.Tent;
            }

            return true;
        }
        else if ( nTents + unknowns.length < constraint )
        {
            return false;
        }
        else
        {
            return true;
        }
    }
}