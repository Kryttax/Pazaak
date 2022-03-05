
export const Hold = Symbol("hold")
export const PlayCard = Symbol("play")
export const Pass = Symbol("pass")

export function Decide(AIPoints)
{
    let difference = 20 - AIPoints;
    if(difference > 6)
    {
        return Pass;
    }
    else
        return Hold;
}