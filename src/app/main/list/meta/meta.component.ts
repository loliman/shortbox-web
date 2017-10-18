import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {List} from '../../../models/list';
import {Series} from '../../../models/series';
import {MetaDetailsComponent} from '../details/meta/meta-details.component';
import {Alert} from "../../../models/alert";

@Component({
    selector: 'app-meta-list',
    templateUrl: './meta.component.html',
    styleUrls: ['./meta.component.css']
})
export class MetaComponent implements OnInit {
    @Input()
    public list: List;

    @Output()
    public reload = new EventEmitter<any>();

    @Output()
    onAlert = new EventEmitter<Alert>();

    @ViewChild('details')
    public details: MetaDetailsComponent;

    public selected: any;

    constructor() {
        this.list = new List();
    }

    ngOnInit() {
    }

    select(o: any): any {
        if (this.list.Id === 1) {
            const s = new Series();
            s.Id = -1;
            s.Publisher.Name = o.Name;
            s.Publisher.Id = o.Id;
            return s;
        } else {
            return o;
        }
    }

    onReload(object: any) {
        this.reload.emit(object);
    }

    openDetails(o: any) {
        event.stopPropagation();

        this.selected = o;
        this.details.open(this.select(o));
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
