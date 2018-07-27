import { State } from './state';


export class Square
{
    constructor(public state : State) { }

    public copy() : Square
    {
        return new Square(this.state);
    }
}