import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AutocompleteService} from '../../../../autocomplete.service';
import {debounceTime} from 'rxjs/operator/debounceTime';
import {distinctUntilChanged} from 'rxjs/operator/distinctUntilChanged';
import {_catch} from 'rxjs/operator/catch';
import {_do} from 'rxjs/operator/do';
import {switchMap} from 'rxjs/operator/switchMap';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {Series} from '../../../../../models/series';
import {Publisher} from '../../../../../models/publisher';

@Component({
    selector: 'app-metainline',
    templateUrl: './metainline.component.html',
    styleUrls: ['./metainline.component.css']
})
export class MetainlineComponent implements OnInit {
    @Input()
    value: Series;
    workingValue: Series;

    @Input()
    edit = false;

    @Input()
    label = true;

    @Output()
    updated = new EventEmitter<Series>();

    private savedValue: Series;

    constructor(private acService: AutocompleteService) {
        this.workingValue = new Series();
        this.workingValue.Publisher = new Publisher();
    }

    ngOnInit() {
        this.workingValue.Id = this.value.Id;
        this.workingValue.Title = this.value.Title;
        this.workingValue.Startyear = this.value.Startyear;
        this.workingValue.Volume = this.value.Volume;
        this.workingValue.Publisher.Id = this.value.Publisher.Id;
        this.workingValue.Publisher.Name = this.value.Publisher.Name;
    }

    save() {
        this.edit = false;
        this.savedValue = null;

        this.updated.emit(this.workingValue);
    }

    isSeries(): boolean {
        return this.value.Id !== -1;
    }

    reset() {
        this.workingValue = this.savedValue;
        this.edit = false;
    }

    toogle() {
        if (!this.edit) {
            this.edit = true;
            this.savedValue = this.workingValue;
        }
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
        this.workingValue.Title = series.item.Title;
        this.workingValue.Startyear = series.item.Startyear;
        this.workingValue.Publisher.Name = series.item.Publisher.Name;
        this.workingValue.Volume = series.item.Volume;
    }

    selectPublisher(publisher) {
        publisher.preventDefault();
        this.workingValue.Publisher.Id = publisher.item.Id;
        this.workingValue.Publisher.Name = publisher.item.Name;
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
