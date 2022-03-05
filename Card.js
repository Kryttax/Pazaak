export let Normal = Symbol("normalCard");
export let PlusMinus = Symbol("plusMinusCard");


export class Card
{
    imgSrc;
    value;
    type;

    constructor(value, imgSrc, cardType)
    {
        this.value = value;
        this.imgSrc = imgSrc;
        this.type = cardType;
    }
}