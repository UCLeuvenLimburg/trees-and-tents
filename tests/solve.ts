import { expect } from 'chai';
import { setTreelessSquaresToEmpty, generateSolutions, generatePossibilities, intersectionOfPossibilities, addPossibilityIntersections, addPossibilityIntersectionToRow } from '../src/solve';
import { parse, parseSequence } from '../src/parse';
import { Square } from '../src/square';
import { State } from '../src/state';
import { copy, show, showSequence } from '../src/util';
import { deriveColumnConstraints, deriveRowConstraints } from '../src/constraints';


describe('setTreelessSquaresToEmpty', () => {
    function check(before : string, after : string)
    {
        const originalGrid = parse(before);
        const expectedGrid = parse(after);

        it(`transforms '${show(originalGrid)}' to ${show(expectedGrid)}`, () => {
            const actualGrid = copy(originalGrid);
            setTreelessSquaresToEmpty(actualGrid);

            expect(actualGrid).to.be.deep.equal(expectedGrid);
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

describe('generateSolutions', () => {
    function check(string : string)
    {
        const solvedGrid = parse(string);
        const rowConstraints = deriveRowConstraints(solvedGrid);
        const columnConstraints = deriveColumnConstraints(solvedGrid);
        const unsolvedGrid = solvedGrid.map( (s : Square) => (s.state === State.Tent || s.state === State.Empty) ? new Square(State.Unknown) : s );

        const before = new Date().getTime();
        const actual = Array.from( generateSolutions(unsolvedGrid, rowConstraints, columnConstraints) );
        const after = new Date().getTime();

        console.log(`Solved in ${(after-before) / 1000}s`);

        describe(`${show(solvedGrid)}`, () => {
            it(`has only one solution`, () => {
                expect(actual.length).to.be.equal(1);
            });

            it(`has solution ${show(solvedGrid)}`, () => {
                expect(actual[0]).to.be.deep.equal(solvedGrid);
            });
        });
    }


    check(`
    tT
    `);

    check(`
    Tt
    `);

    check(`
    tT.
    .Tt
    tT.
    `);

    check(`
    ....
    .T..
    .t..
    ....
    `);

    check(`
    .....
    .....
    .....
    .tTT.
    ...t.
    `);

    check(`
    T.t..
    t.TT.
    ...t.
    .tTT.
    ...t.
    `);

    check(`
    ..t.t
    tTT.T
    ...tT
    tT...
    ..tT.
    `);

    check(`
    ..........
    .....T....
    .....t....
    ..........
    ..........
    `);

    check(`
    tT......
    ..t.tTt.
    tTT...T.
    ....tTTt
    ...T...T
    ...t...t
    .T...tTT
    .t.tT..t
    `)

    check(`
    Tt.tTtT.Tt...tT.
    ......Tt......Tt
    .T.tTt....t.tT..
    .t...T..t.T.T.tT
    ...Tt.t.T...t...
    ......T...tT....
    .tT..t..t...t.Tt
    ...t.T..T...T...
    ...T............
    tTtTtTtTtTt.t.tT
    ...TT.......T...
    tT.t..tT....t.Tt
    ........t.t.T...
    tTt...tTT.T.tTTt
    TT.............T
    .t..tTtTtTtT.tTt
    `);

    // check(`
    // ..t...............Tt
    // tTTTt.tTt.tT.tTt.t..
    // ......T.......TT.T.t
    // .tT....tTT..t.t.tT.T
    // T..Tt....t..T....Tt.
    // t.t.......Tt...Tt...
    // ..TTtTt..tT..Tt...tT
    // tTt.........tT.Tt..T
    // T.T........T.......t
    // t...tT.tTt.t..tT.t..
    // ..tT..TT.........T..
    // tT..T.tTt.tTtTTt..t.
    // .Tt.t.T...........T.
    // ......t.t.tTt..T...t
    // t.......TTT....t.tTT
    // T..t..t..t.Tt..T..Tt
    // T..T..T........tTt..
    // t..TTt.tTtTTt......t
    // ...t.T......T.TtTt.T
    // Tt...tTtTt..t.....Tt
    // `);
});


describe('generatePossibilities', () => {
    function check(original : string, constraint : number, tentsAllowed : string, expected : string[])
    {
        const originalSequence = parseSequence(original);
        const isTentAllowed = (i : number) => tentsAllowed[i] !== 'x';
        const actualSequences = Array.from(generatePossibilities(originalSequence, constraint, isTentAllowed));
        const actualStrings = actualSequences.map(showSequence);

        describe(`Possibilities for ${original}, constraint ${constraint}, allowed tents ${tentsAllowed}`, () => {
            it(`has ${expected.length} possibilities`, () => {
                expect(actualSequences.length).to.be.equal(expected.length);
            });

            for ( let e of expected )
            {
                it(`produces ${e}`, () => {
                    expect(actualStrings).to.include(e);
                });
            }
        });
    }


    check('?', 1, '.', [ 't' ]);
    check('?', 0, '.', [ '.' ]);
    check('??', 0, '..', [ '..' ]);
    check('??', 1, '..', [ 't.', '.t' ]);
    check('??', 2, '..', [ ]);
    check('??', 1, 'x.', [ '.t' ]);
    check('t??', 2, '...', [ 't.t' ]);
    check('?T?', 1, '...', [ 'tT.', '.Tt' ]);
    check('????', 1, '....', [ 't...', '.t..', '..t.', '...t' ]);
});


describe('intersectionOfPossibilities', () => {
    function check(original : string, constraint : number, tentsAllowed : string, expectedCommon : string, expectedEmptyNeighbors : string)
    {
        const originalSequence = parseSequence(original);
        const isTentAllowed = (i : number) => tentsAllowed[i] !== 'x';
        const possibilities = Array.from(generatePossibilities(originalSequence, constraint, isTentAllowed));
        const result = intersectionOfPossibilities(possibilities);

        describe(`Intersection for ${original}, constraint ${constraint}, allowed tents ${tentsAllowed}`, () => {
            it(`succeeds`, () => {
                expect(result.isJust()).to.be.true;
            });

            if ( result.isJust() )
            {
                const { common: actualCommon, emptyNeighbors: actualEmptyNeighbors } = result.value;

                it(`common == ${expectedCommon}`, () => {
                    expect(showSequence(actualCommon)).to.be.equal(expectedCommon);
                });

                it(`emptyNeighbors == ${expectedEmptyNeighbors}`, () => {
                    const str = actualEmptyNeighbors.map(x => x ? '.' : '?').join('');
                    expect(str).to.be.equal(expectedEmptyNeighbors);
                });
            }
            else
            {
                expect.fail();
            }
        });
    }


    check('?', 1, '.', 't', '.');
    check('??', 1, '..', '??', '..');
    check('???', 1, '...', '???', '?.?');
    check('?T?', 1, '...', '?T?', '?.?');
    check('?T?', 2, '...', 'tTt', '...');
    check('????', 1, '....', '????', '????');
    check('????', 1, 'x...', '.???', '??.?');
});

describe(`addPossibilityIntersectionToRow`, () => {
    function success(originalGridString : string, rowIndex : number, rowConstraint : number, expectedGridString : string)
    {
        const originalGrid = parse(originalGridString);
        const expectedGrid = parse(expectedGridString);
        const actualGrid = copy(originalGrid);

        describe(`${show(originalGrid)}, row ${rowIndex}, constraint ${rowConstraint}`, () => {
            it(`succeeds`, () => {
                expect(addPossibilityIntersectionToRow(actualGrid, rowIndex, rowConstraint)).to.be.true;
            });

            it(`transforms grid to ${show(expectedGrid)}`, () => {
                expect(actualGrid).to.be.deep.equal(expectedGrid);
            });
        });
    }

    function failure(originalGridString : string, rowIndex : number, rowConstraint : number, expectedGridString : string)
    {
        const originalGrid = parse(originalGridString);
        const expectedGrid = parse(expectedGridString);
        const actualGrid = copy(originalGrid);

        describe(`${show(originalGrid)}, row ${rowIndex}, constraint ${rowConstraint}`, () => {
            it(`fails`, () => {
                expect(addPossibilityIntersectionToRow(actualGrid, rowIndex, rowConstraint)).to.be.false;
            });
        });
    }

    success(`???`, 0, 0, '...');
    success(`
    ?T?
    ???
    `, 0, 1,
    `
    ?T?
    ?.?
    `);
    success(`
    ???
    ?T?
    ???
    `, 1, 2,
    `
    ...
    tTt
    ...
    `);
});

describe(`addPossibilityIntersections`, () => {
    function success(originalGridString : string, rowConstraints : number[], columnConstraints : number[], expectedGridString : string)
    {
        const originalGrid = parse(originalGridString);
        const expectedGrid = parse(expectedGridString);
        const actualGrid = copy(originalGrid);

        if ( originalGrid.width != columnConstraints.length || originalGrid.height != rowConstraints.length )
        {
            throw new Error(`Test bug: Incompatible constraints`);
        }

        describe(`${show(originalGrid)} with constraints ${rowConstraints.join()} and ${columnConstraints.join()}`, () => {
            it(`succeeds`, () => {
                expect(addPossibilityIntersections(actualGrid, rowConstraints,columnConstraints)).to.be.true;
            });

            it(`transforms grid to ${show(expectedGrid)}`, () => {
                expect(actualGrid).to.be.deep.equal(expectedGrid);
            });
        });
    }

    function failure(originalGridString : string, rowConstraints : number[], columnConstraints : number[], expectedGridString : string)
    {
        const originalGrid = parse(originalGridString);
        const expectedGrid = parse(expectedGridString);
        const actualGrid = copy(originalGrid);

        if ( originalGrid.width != columnConstraints.length || originalGrid.height != rowConstraints.length )
        {
            throw new Error(`Test bug: Incompatible constraints`);
        }

        describe(`${show(originalGrid)} with constraints ${rowConstraints.join()} and ${columnConstraints.join()}`, () => {
            it(`fails`, () => {
                expect(addPossibilityIntersections(actualGrid, rowConstraints,columnConstraints)).to.be.false;
            });
        });
    }

    success(`???`, [0], [0,0,0], '...');
    success(`?T?`, [1], [0,0,1], '.Tt');
    success(`?T?T?T`, [3], [1,0,1,0,1,0], 'tTtTtT');

    failure(`tTtTtT`, [1], [1,0,1,0,1,0], 'tTtTtT');
});