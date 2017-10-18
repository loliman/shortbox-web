import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Price} from '../../../../../models/price';

@Component({
    selector: 'app-priceinline',
    templateUrl: './priceinline.component.html',
    styleUrls: ['./priceinline.component.css']
})
export class PriceComponent {
    @Input()
    value: Price;

    @Input()
    edit = false;

    @Output()
    updated = new EventEmitter<Price>();

    currencies: string[];

    private savedValue: Price;

    constructor() {
        this.currencies = new Price().CURRENCIES;
    }

    save() {
        this.edit = false;
        this.savedValue = new Price();
        this.updated.emit(this.value);
    }

    reset() {
        this.value = this.savedValue;
        this.edit = false;
    }

    toogle() {
        if (!this.edit) {
            this.edit = true;
            this.savedValue = this.value;
        }
    }
}
