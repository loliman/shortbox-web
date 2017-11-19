import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Format} from "../../../../../models/format";

@Component({
    selector: 'app-formatinline',
    templateUrl: './formatinline.component.html',
    styleUrls: ['./formatinline.component.css']
})
export class FormatComponent {
    @Input()
    value: Format;

    @Input()
    edit = false;

    @Output()
    updated = new EventEmitter<Format>();

    formats: string[];

    private savedValue: Format;

    constructor() {
        this.formats = new Format().FORMATS;
    }

    save() {
        this.edit = false;
        this.savedValue = new Format();

        if(this.value.Format.indexOf('Variant') == -1) {
            this.value.Variant = '';
        }

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
