export let Normal = Symbol("normalCard");
export let PlusMinus = Symbol("plusMinusCard");


export class Card
{
    imgSrc;
    back;
    value;
    type;

    constructor(value, imgSrc, back, cardType)
    {
        this.value = value;
        this.imgSrc = imgSrc;
        this.back = back;
        this.type = cardType;
    }
}