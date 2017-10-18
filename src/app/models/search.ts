import {Issue} from './issue';
import {isUndefined} from "util";

export class Search {
    EQUALS: string[] = ['===', 'EQ'];
    GREATER: string[] = ['<', 'GR'];
    GREATER_EQUAL: string[] = ['<=', 'GQ'];
    LESS: string[] = ['>', 'LE'];
    LESS_EQUAL: string[] = ['>=', 'LQ'];
    BETWEEN: string[] = ['<>', 'BT'];
    YES: string[] = ['Ja', 'YE'];
    NO: string[] = ['Nein', 'NO'];
    BOTH: string[] = ['Alles', 'BO'];
    COMPLETE: string[] = ['Komplett', 'CO'];

    groupOne: string[][] = [['Titel', 'i.title'], ['Serie', 's.title'], ['Jahr', 's.startyear'], ['Verlag', 'p.name'],
        ['Erscheinungstag', 'i.releasedate.day'], ['Erscheinungsmonat', 'i.releasedate.month'],
        ['Erscheinungsjahr', 'i.releasedate.year']];
    groupTwo: string[][] = [['Titel', 'i.title'], ['Nummer', 'i.number'], ['Serie', 's.title'],
        ['Jahr', 's.startyear']];
    groupDir: string[][] = [['aufsteigend', 'ASC'], ['absteigend', 'DESC']];

    Lists: number[] = [];

    Start = 0;
    Offset = 50;

    Issue: Issue = new Issue();
    Issue2: Issue = new Issue();

    STitle: String = '';
    SPublisher: String = '';
    SSeries: String = '';
    SReleasedate: String = this.EQUALS[1];
    SNumber: String = this.EQUALS[1];
    SOriginalissue: String = this.BOTH[1];
    SPages: String = this.EQUALS[1];
    SPrice: String = this.EQUALS[1];
    SAmount: String = this.EQUALS[1];
    SCoverurl: String = this.BOTH[1];
    SRead: String = this.BOTH[1];
    SDuplicateIn: String = this.BOTH[1];

    GOne = 's.title';
    GOneDir = 'ASC';
    GTwo = 's.startyear';
    GTwoDir = 'ASC';

    IsExport = false;

    OrgIssue = false;
    OrgIssueS: Search;
    Cover = false;

    constructor(s: Search) {
        if (s === null || isUndefined(s)) {
            return;
        }

        this.Lists = s.Lists;

        this.Start = s.Start;
        this.Offset = s.Offset;

        this.Issue = s.Issue;
        this.Issue2 = s.Issue2;

        this.STitle = s.STitle;
        this.SPublisher = s.SPublisher;
        this.SSeries = s.SSeries;
        this.SReleasedate = s.SReleasedate;
        this.SNumber = s.SNumber;
        this.SOriginalissue = s.SOriginalissue;
        this.SPages = s.SPages;
        this.SPrice = s.SPrice;
        this.SAmount = s.SAmount;
        this.SCoverurl = s.SCoverurl;
        this.SRead = s.SRead;
        this.SDuplicateIn = s.SDuplicateIn;

        this.GOne = s.GOne;
        this.GOneDir = s.GOneDir;
        this.GTwo = s.GTwo;
        this.GTwoDir = s.GTwoDir;

        this.IsExport = s.IsExport;

        this.OrgIssue = s.OrgIssue;
        if(s.OrgIssueS !== null && !isUndefined(s.OrgIssueS)) {
            this.OrgIssueS = new Search(s.OrgIssueS);
        }
        this.Cover = s.Cover;
    }
}
