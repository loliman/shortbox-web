import {Search} from './search';

export class List {
    Id: number;
    Type: string;
    Name: string;
    Sort: number;
    GroupBy: string;
    Amount: number;
    Objects: Object[];
    Search: Search;

    constructor() {
        this.Search = new Search(null);
    }
}
