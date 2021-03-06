import {Publisher} from './publisher';

export class Series {
    Id: number;
    Title: string;
    Startyear: number;
    Endyear: number;
    Volume: number;
    Issuecount: number;
    Original: number;
    Publisher: Publisher = new Publisher;
}
