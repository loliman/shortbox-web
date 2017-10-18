import {Story} from './story';
import {Series} from './series';
import {List} from './list';
import {Price} from 'app/models/price';

export class Issue {
    Id: number;
    Title = '';
    Series: Series = new Series;
    Number: string;
    Stories: Story[];
    Lists: List[] = [];
    Format: string;
    Language: string;
    Pages: number;
    Releasedate: any = '0000-00-00';
    Price: Price;
    Coverurl = '';
    Quality: string;
    QualityAdditional: string;
    Amount: number;
    Read: any;
    Originalissue: any;

    constructor() {
        this.Stories = [];
        this.Price = new Price();
    }
}
