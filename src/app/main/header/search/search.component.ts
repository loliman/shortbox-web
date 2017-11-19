import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Search} from '../../../models/search';
import {debounceTime} from 'rxjs/operator/debounceTime';
import {distinctUntilChanged} from 'rxjs/operator/distinctUntilChanged';
import {_catch} from 'rxjs/operator/catch';
import {_do} from 'rxjs/operator/do';
import {switchMap} from 'rxjs/operator/switchMap';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {Publisher} from '../../../models/publisher';
import {AutocompleteService} from '../../autocomplete.service';
import {MetaService} from '../../list/meta.service';
import {isUndefined} from "util";
import {Series} from "../../../models/series";
import {Format} from "../../../models/format";

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
    @Input()
    public search: Search;

    @Output()
    onSearch = new EventEmitter<Search>();

    public formats: string[];
    public languages: string[];
    public qualities: string[];
    public date1: any;
    public date2: any;

    constructor(private acService: AutocompleteService,
                private metaService: MetaService) {
        this.formats = new Format().FORMATS;
        this.languages = metaService.languages;
        this.qualities = metaService.qualities;
    }

    ngOnInit() {
    }

    searchClick() {
        window.scrollTo(0, 0);

        this.search.Start = 0;
        this.search.Offset = new Search(null).Offset;

        if (this.date1 != null) {
            this.search.Issue.Releasedate = this.date1.year + '-' + this.date1.month + '-' + this.date1.day;
        }
        if (this.date2 != null) {
            this.search.Issue2.Releasedate = this.date2.year + '-' + this.date2.month + '-' + this.date2.day;
        }

        this.onSearch.emit(this.search);
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

    seriesFormatter = (result: Series) => result.Title + ' (' + this.romanize(result.Volume)
        + ') (' +  result.Startyear + ') ' + '(' + result.Publisher.Name + ')';

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

    publisherFormatter = (result: Publisher) => result.Name;

    selectSeries(series) {
        series.preventDefault();
        this.search.Issue.Series.Title = series.item.Title;
        this.search.Issue.Series.Startyear = series.item.Startyear;
        this.search.Issue.Series.Publisher.Name = series.item.Publisher.Name;
    }

    selectPublisher(publisher) {
        publisher.preventDefault();
        this.search.Issue.Series.Publisher.Name = publisher.item.Name;
    }

    reset() {
        if(this.search.OrgIssueS != null && !isUndefined(this.search.OrgIssueS)) {
            let orgIssueS = this.search.OrgIssueS;
            this.search = new Search(null);
            this.search.OrgIssueS = orgIssueS;
        } else {
            let lists = this.search.Lists;
            this.search = new Search(null);
            this.search.Lists = lists;
        }
        this.date1 = null;
        this.date2 = null;
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
