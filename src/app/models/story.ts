import {Issue} from './issue';

export class Story {
    Id: number;
    Title: string;
    Number: number;
    AdditionalInfo: string;
    OriginalIssue: Issue;
    Issues: Issue[];

    constructor() {
        this.OriginalIssue = new Issue();
    }
}
