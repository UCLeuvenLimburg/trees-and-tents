import { State } from './state';


export class Square
{
    constructor(initialValue : State)
    {
        this.state = initialValue;
    }

    public state : State;

    public copy() : Square
    {
        return new Square(this.state);
    }
}