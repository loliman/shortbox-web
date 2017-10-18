import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
    selector: 'app-inline',
    templateUrl: './inline.component.html',
    styleUrls: ['./inline.component.css']
})
export class InlineComponent implements OnInit {

    @Input()
    label: String;

    @Input()
    value: any;

    @Input()
    type: String;

    @Input()
    options: String[];

    @Input()
    edit = false;

    @Output()
    updated = new EventEmitter<string>();

    private savedValue: String;
    private datevalue: any;

    constructor() {
    }

    ngOnInit() {
        if (this.type === 'date') {
            this.datevalue = {};
            this.datevalue.year = +this.value.split('-')[0];
            this.datevalue.month = +this.value.split('-')[1];
            this.datevalue.day = +this.value.split('-')[2];
        }
    }

    save() {
        if (this.type === 'date') {
            this.value = this.datevalue.year + '-' + this.datevalue.month + '-' + this.datevalue.day;
        }

        if (this.type === 'checkbox') {
            this.value = !this.value;
        }

        this.edit = false;
        this.savedValue = '';

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
