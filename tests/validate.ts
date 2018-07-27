import { expect } from 'chai';
import { sequenceSatisfiesConstraint, containsTouchingTents, containsLoneTent, containsLoneTree, tentTreeBijectionExists } from '../src/validate';
import { parse, parseSequence } from '../src/parse';
import { show } from '../src/show';




describe('sequenceSatisfiesConstraint', () => {

    function satisfies(string : string, constraint : number)
    {
        const sequence = parseSequence(string);

        it(`'${string}' satisfies constraint ${constraint}`, () => {
            expect( sequenceSatisfiesConstraint(sequence, constraint) ).to.be.true;
        });
    }

    function doesNotSatisfy(string : string, constraint : number)
    {
        const sequence = parseSequence(string);

        it(`'${string}' satisfies constraint ${constraint}`, () => {
            expect( sequenceSatisfiesConstraint(sequence, constraint) ).to.be.false;
        });
    }

    satisfies('t', 1);
    satisfies('t.', 1);
    satisfies('.t', 1);
    satisfies('?', 1);
    satisfies('??', 1);
    satisfies('t??t', 3);

    doesNotSatisfy('.', 1);
    doesNotSatisfy('.tt.', 1);
    doesNotSatisfy('?', 2);
    doesNotSatisfy('T', 1);
});

describe('containsTouchingTents', () => {
    function touching(string : string)
    {
        const grid = parse(string);

        it(`${show(grid)} contains touching tents`, () => {
            expect(containsTouchingTents(grid)).to.be.true;
        });
    }

    function noTouching(string : string)
    {
        const grid = parse(string);

        it(`${show(grid)} does not contain touching tents`, () => {
            expect(containsTouchingTents(grid)).to.be.false;
        });
    }


    touching(`
    tt
    `);

    touching(`
    t.t
    .t.
    ...
    `)

    noTouching(`
    ..
    `);

    noTouching(`
    t.t
    `);

    noTouching(`
    t.t
    ...
    .t.
    `);

    noTouching(`
    TtT
    `);

    noTouching(`
    t?t
    `);
});

describe('containsLoneTent', () => {
    function contains(string : string)
    {
        const grid = parse(string);

        it(`${show(grid)} contains a lone tent`, () => {
            expect(containsLoneTent(grid)).to.be.true;
        });
    }

    function doesNotContain(string : string)
    {
        const grid = parse(string);

        it(`${show(grid)} does not contain a lone tent`, () => {
            expect(containsLoneTent(grid)).to.be.false;
        });
    }


    contains(`
    t
    `);

    contains(`
    t.T
    `);

    doesNotContain(`
    tT
    `);

    doesNotContain(`
    tTTt
    `);

    doesNotContain(`
    tTtT
    `);
});

describe('containsLoneTree', () => {
    function contains(string : string)
    {
        const grid = parse(string);

        it(`${show(grid)} contains a lone tree`, () => {
            expect(containsLoneTree(grid)).to.be.true;
        });
    }

    function doesNotContain(string : string)
    {
        const grid = parse(string);

        it(`${show(grid)} does not contain a lone tree`, () => {
            expect(containsLoneTree(grid)).to.be.false;
        });
    }


    contains(`
    T
    `);

    contains(`
    t.T
    `);

    doesNotContain(`
    tT
    `);

    doesNotContain(`
    tTTt
    `);

    doesNotContain(`
    tTtT
    `);
});

describe('tentTreeBijectionExists', () => {
    function exists(string : string)
    {
        const grid = parse(string);

        it(`${show(grid)} has a tent-tree bijection`, () => {
            expect(tentTreeBijectionExists(grid)).to.be.true;
        });
    }

    function doesNotExist(string : string)
    {
        const grid = parse(string);

        it(`${show(grid)} does not have a tent-tree bijection`, () => {
            expect(tentTreeBijectionExists(grid)).to.be.false;
        });
    }


    exists(`
    tT
    `);

    exists(`
    tTTt
    `);

    exists(`
    Tt
    tT
    `);

    exists(`
    .tT
    .T.
    .t.
    `);

    doesNotExist(`
    T
    `);

    doesNotExist(`
    t
    `);

    doesNotExist(`
    TtT
    `);

    doesNotExist(`
    .T.
    TtT
    `);
});
