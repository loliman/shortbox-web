import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {List} from '../../../models/list';
import {Issue} from '../../../models/issue';
import {Story} from '../../../models/story';
import {CreateService} from './create.service';
import {Observable} from 'rxjs/Observable';
import {Series} from '../../../models/series';
import {Publisher} from '../../../models/publisher';
import {debounceTime} from 'rxjs/operator/debounceTime';
import {distinctUntilChanged} from 'rxjs/operator/distinctUntilChanged';
import {_catch} from 'rxjs/operator/catch';
import {_do} from 'rxjs/operator/do';
import {switchMap} from 'rxjs/operator/switchMap';
import {of} from 'rxjs/observable/of';
import {AutocompleteService} from '../../autocomplete.service';
import {MetaService} from '../../list/meta.service';
import {Price} from '../../../models/price';
import {isUndefined} from "util";
import {Alert} from "../../../models/alert";


@Component({
    selector: 'app-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
    @Input()
    list: List;

    @Input()
    multiedit: boolean = false;

    @Output()
    created = new EventEmitter<Issue>();

    @Output()
    onAlert = new EventEmitter<Alert>();

    public issue = new Issue();
    private error: string;
    public importUrl = '';

    currencies: string[];

    public formats: string[];
    public languages: string[];
    public qualities: string[];

    public storyPublisher: Publisher;

    public importing = false;

    constructor(private service: CreateService,
                private acService: AutocompleteService,
                private metaService: MetaService) {
        this.formats = metaService.formats;
        this.languages = metaService.languages;
        this.qualities = metaService.qualities;
        this.storyPublisher = new Publisher();
        this.currencies = new Price().CURRENCIES;
    }

    ngOnInit() {
        this.issue = new Issue();
        this.issue.Stories = [];
        const s = new Story();
        s.OriginalIssue.Releasedate = '';
        this.issue.Stories.push(s);
    }

    searchSeries = (text$: Observable<string>) =>
        _do.call(
            switchMap.call(
                _do.call(
                    distinctUntilChanged.call(
                        debounceTime.call(text$, 100))),
                term =>
                    _catch.call(
                        _do.call(this.acService.getSeries(term)),
                        () => {
                            return of.call([]);
                        }
                    )
            ));

    seriesFormatter = (result: Series) => result.Title + ' (' + this.romanize(result.Volume) + ') (' +
        result.Startyear + ') ' + '(' + result.Publisher.Name + ')';

    searchPublisher = (text$: Observable<string>) =>
        _do.call(
            switchMap.call(
                _do.call(
                    distinctUntilChanged.call(
                        debounceTime.call(text$, 100))),
                term =>
                    _catch.call(
                        _do.call(this.acService.getPublisher(term)),
                        () => {
                            return of.call([]);
                        }
                    )
            ));

    selectSeries(series) {
        series.preventDefault();
        this.issue.Series.Title = series.item.Title;
        this.issue.Series.Startyear = series.item.Startyear;
        this.issue.Series.Volume = series.item.Volume;
        this.issue.Series.Publisher.Name = series.item.Publisher.Name;
    }

    selectSeriesOriginalIssue(series, idx) {
        series.preventDefault();
        this.issue.Stories[idx].OriginalIssue.Series.Title = series.item.Title;
        this.issue.Stories[idx].OriginalIssue.Series.Startyear = series.item.Startyear;
        this.issue.Stories[idx].OriginalIssue.Series.Volume = series.item.Volume;
        this.issue.Stories[idx].OriginalIssue.Series.Publisher.Name = series.item.Publisher.Name;
    }

    selectPublisher(publisher) {
        publisher.preventDefault();
        this.issue.Series.Publisher.Name = publisher.item.Name;
    }

    selectStoryPublisher(publisher) {
        publisher.preventDefault();
        this.storyPublisher.Name = publisher.item.Name;
    }

    publisherFormatter = (result: Publisher) => result.Name;

    addStory() {
        const s = new Story();
        s.OriginalIssue.Releasedate = '';
        this.issue.Stories.push(s);
    }

    remove(idx: number) {
        this.issue.Stories.splice(idx, 1);
    }

    save() {
        const date: any = this.issue.Releasedate;
        if(isUndefined(date.year) || isUndefined(date.month) || isUndefined(date.day)) {
            this.issue.Releasedate = "";
        } else {
            this.issue.Releasedate = date.year + '-' + date.month + '-' + date.day;
        }
        this.issue.Originalissue = (this.issue.Originalissue ? 1 : 0);
        this.issue.Read = (this.issue.Read ? 1 : 0);

        if(!this.multiedit) {
            for (let i = 0; i < this.issue.Stories.length; i++) {
                this.issue.Stories[i].Title = this.issue.Stories[i].OriginalIssue.Series.Title + ' '
                    + '(' + this.romanize(this.issue.Stories[i].OriginalIssue.Series.Volume) + ') '
                    + '(' + this.issue.Stories[i].OriginalIssue.Series.Startyear + ') '
                    + '#'
                    + this.issue.Stories[i].OriginalIssue.Number;

                const s = new Series();
                const p = new Publisher();
                if (this.issue.Originalissue) {
                    s.Title = this.issue.Series.Title;
                    s.Startyear = this.issue.Series.Startyear;

                    p.Name = this.issue.Series.Publisher.Name;
                } else {
                    s.Title = this.issue.Stories[i].OriginalIssue.Series.Title;
                    s.Startyear = this.issue.Stories[i].OriginalIssue.Series.Startyear;
                    s.Volume = this.issue.Stories[i].OriginalIssue.Series.Volume;

                    if (this.storyPublisher.Name === '') {
                        p.Name = 'Original Publisher';
                    } else {
                        p.Name = this.storyPublisher.Name;
                    }
                }
                s.Publisher = p;

                this.issue.Stories[i].OriginalIssue.Title = this.issue.Stories[i].OriginalIssue.Series.Title;
                this.issue.Stories[i].OriginalIssue.Series = s;
                this.issue.Stories[i].OriginalIssue.Originalissue = 1;
                this.issue.Stories[i].OriginalIssue.Releasedate = this.issue.Stories[i].OriginalIssue.Series.Startyear + '-00-00';
                this.issue.Stories[i].OriginalIssue.Format = 'Heft';
                this.issue.Stories[i].OriginalIssue.Price.Currency = 'USD';
            }

            if (this.list.Id !== 0) {
                this.issue.Lists = [];
                this.issue.Lists.push(this.list);
            }

            this.service.save(this.issue).subscribe(
                response => {
                    if(response.Type === "success") {
                        this.issue = response.Payload;
                        this.created.emit(this.issue);
                    } else {
                        let alert: Alert = new Alert();
                        alert.type = response.Type;
                        alert.message = response.Message;
                        this.onAlert.emit(alert);
                    }
                },
                error => this.error = <any>error
            )
        } else {
            this.created.emit(this.issue);
        }
    }

    import() {
        this.importing = true;
        this.service.import(this.importUrl).subscribe(
            response => {
                if(response.Type === "success") {
                    this.issue = response.Payload;
                    const date = this.issue.Releasedate.split('-');
                    this.issue.Releasedate = {};
                    this.issue.Releasedate.year = +date[0];
                    this.issue.Releasedate.month = +date[1];
                    this.issue.Releasedate.day = +date[2];
                    this.importing = false;
                } else {
                    let alert: Alert = new Alert();
                    alert.type = response.Type;
                    alert.message = response.Message;
                    this.onAlert.emit(alert);
                }
            },
            error => {
                this.importing = false;
                this.error = <any>error;
            }
        )
    }

    romanize(num) {
        if (!+num) {
            return false;
        }
        let digits = String(+num).split(''),
            key = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
                '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
                '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'],
            roman = '',
            i = 3;
        while (i--) {
            roman = (key[+digits.pop() + (i * 10)] || '') + roman;
        }
        return Array(+digits.join('') + 1).join('M') + roman;
    }
}
