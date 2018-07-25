import { State } from './state';


export class Square
{
    constructor(initialValue : State)
    {
        this.state = initialValue;
    }

    state : State;

    copy() : Square
    {
        return new Square(this.state);
    }
}