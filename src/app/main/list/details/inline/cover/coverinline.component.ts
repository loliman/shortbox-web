import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
    selector: 'app-coverinline',
    templateUrl: './coverinline.component.html',
    styleUrls: ['./coverinline.component.css']
})
export class CoverinlineComponent implements OnInit {
    @Input()
    edit: boolean;

    @Input()
    value: any;

    @Output()
    updated = new EventEmitter<string>();

    private savedValue: string;

    constructor() {
    }

    ngOnInit() {
    }

    toogle() {
        if (!this.edit) {
            this.edit = true;
            this.savedValue = this.value;
        }
    }

    save() {
        this.edit = false;
        this.savedValue = '';
        this.updated.emit(this.value);
    }

    reset() {
        this.value = this.savedValue;
        this.edit = false;
    }
}
