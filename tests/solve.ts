import { expect } from 'chai';
import { setTreelessSquaresToEmpty } from '../src/solve';
import { parse } from '../src/parse';
import { show } from './show-grid';
import { Grid, all } from 'js-algorithms';
import { Square } from '../src/square';



function copy(grid : Grid<Square>) : Grid<Square>
{
    return grid.map(x => x.copy());
}

function equal(xss : Grid<Square>, yss : Grid<Square>) : boolean
{
    return xss.width === yss.width && xss.height === yss.height && all(xss.positions, p => xss.at(p).state === yss.at(p).state);
}

describe('setTreelessSquaresToEmpty', () => {

    function check(before : string, after : string)
    {
        const originalGrid = parse(before);
        const expectedGrid = parse(after);        

        it(`transforms '${show(originalGrid)}' to ${show(expectedGrid)}`, () => {
            const actualGrid = copy(originalGrid);
            setTreelessSquaresToEmpty(actualGrid);

            expect( equal(actualGrid, expectedGrid) ).to.be.true;
        });
    }


    check(`.`, `.`);
    check(`?`, `.`);
    check(`T?`, `T?`);
    check(`T??`, `T?.`);
    check(`
    t??
    ???
    `, 
    `
    t..
    ...
    `);
});
