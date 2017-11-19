import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Story} from '../../../../../models/story';
import {Series} from '../../../../../models/series';
import {debounceTime} from 'rxjs/operator/debounceTime';
import {distinctUntilChanged} from 'rxjs/operator/distinctUntilChanged';
import {_catch} from 'rxjs/operator/catch';
import {_do} from 'rxjs/operator/do';
import {switchMap} from 'rxjs/operator/switchMap';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {Issue} from '../../../../../models/issue';
import {isUndefined} from "util";
import {AutocompleteService} from "../../../../autocomplete.service";

@Component({
    selector: 'app-storyinline',
    templateUrl: './storyinline.component.html',
    styleUrls: ['./storyinline.component.css']
})
export class StoryinlineComponent implements OnInit {

    @Input()
    story: Story;

    @Input()
    idx: number;

    @Input()
    edit = false;

    @Output()
    updated = new EventEmitter<Story>();

    @Output()
    onRemoved = new EventEmitter<number>();

    @Output()
    onDetails = new EventEmitter<Issue>();

    private savedStory: Story;

    constructor(private acService: AutocompleteService) {
    }

    ngOnInit() {
        if (this.story.OriginalIssue.Title === '') {
            this.toogle();
        }
    }

    save() {
        if (this.story.OriginalIssue.Series.Title === null || isUndefined(this.story.OriginalIssue.Series.Title)
            || this.story.OriginalIssue.Series.Title === '') {
            this.remove();
            this.edit = false;
            this.savedStory = null;
            return;
        } else {
            this.story.Title = this.story.OriginalIssue.Series.Title + ' '
                + '(' + this.romanize(this.story.OriginalIssue.Series.Volume) + ') '
                + '(' + this.story.OriginalIssue.Series.Startyear + ') '
                + '#'
                + this.story.OriginalIssue.Number;

            const s = new Series();
            s.Title = this.story.OriginalIssue.Series.Title;
            s.Startyear = this.story.OriginalIssue.Series.Startyear;
            s.Volume = this.story.OriginalIssue.Series.Volume;

            this.story.OriginalIssue.Series = s;
            this.story.OriginalIssue.Title = this.story.OriginalIssue.Series.Title;
            this.story.OriginalIssue.Originalissue = 1;
            this.story.OriginalIssue.Releasedate = this.story.OriginalIssue.Series.Startyear + '-00-00';
            this.story.OriginalIssue.Format.Format = 'Heft';
            this.story.OriginalIssue.Price.Currency = 'USD';

            this.edit = false;
            this.savedStory = null;
            this.updated.emit(this.story);
        }
    }

    reset() {
        this.story = this.savedStory;
        this.edit = false;

        if (this.story.OriginalIssue.Title === null || isUndefined(this.story.OriginalIssue.Title)
            || this.story.OriginalIssue.Title === '') {
            this.remove();
        }
    }

    toogle() {
        if (!this.edit) {
            this.edit = true;
            this.savedStory = this.story;
        }
    }

    remove() {
        this.onRemoved.emit(this.idx);
    }

    details() {
        this.onDetails.emit(this.story.OriginalIssue);
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

    seriesFormatter = (result: Series) => result.Title + ' (' + this.romanize(result.Volume) + ') ('
        + result.Startyear + ') ' + '(' + result.Publisher.Name + ')';

    selectSeries(series) {
        series.preventDefault();
        this.story.OriginalIssue.Series.Title = series.item.Title;
        this.story.OriginalIssue.Series.Startyear = series.item.Startyear;
        this.story.OriginalIssue.Series.Publisher.Name = series.item.Publisher.Name;
        this.story.OriginalIssue.Series.Volume = series.item.Volume;
    }

    romanize(num) {
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
