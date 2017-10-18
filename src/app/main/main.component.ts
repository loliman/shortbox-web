import {Component} from '@angular/core';
import {List} from '../models/list';
import {Search} from '../models/search';
import {Alert} from "app/models/alert";
import {Router} from "@angular/router";

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.css']
})
export class MainComponent {
    public list: List;
    public isLoading = false;

    public alerts: Array<Alert> = [];

    constructor(private router: Router) {
        this.list = new List();
    }

    setList(list: List) {
        this.list = list;
    }

    onAlert(alert: Alert) {
        if(alert.message === 'INVALID SESSIONID') {
            this.router.navigate(['login']);
        }

        this.alerts.push(alert);
    }

    onScroll() {
        if (this.list.Search.Offset !== 0 && !this.isLoading) {
            const search = new Search(this.list.Search);

            let start = search.Start;
            let offset = search.Offset;

            if (start + offset < this.list.Amount) {
                start += offset;
            }

            if (start + offset > this.list.Amount) {
                offset = this.list.Amount - start;
            }

            search.Start = start;
            search.Offset = offset;

            if (search.Start <= this.list.Amount && offset !== 0) {
                this.list.Search = search;
            }
        }
    }

    onIsLoading(isLoading: boolean) {
       this.isLoading = isLoading;
    }

    reload() {
        const search = new Search(this.list.Search);
        search.Start = 0;
        search.Offset = new Search(null).Offset;
        this.list.Search = search;
    }

    public closeAlert(alert: Alert) {
        const index: number = this.alerts.indexOf(alert);
        this.alerts.splice(index, 1);
    }
}
