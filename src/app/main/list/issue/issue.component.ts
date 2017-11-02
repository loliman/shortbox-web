import {Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild} from '@angular/core';
import {NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import {List} from '../../../models/list';
import {ListService} from '../../list.service';
import {Issue} from '../../../models/issue';
import {DetailsService} from '../issue.service';
import {DetailsComponent} from '../details/issue/issue-details.component';
import {Observable} from 'rxjs/Observable';
import {Router} from "@angular/router";
import {Message} from "../../../models/message";
import {isUndefined} from "util";
import {Alert} from "../../../models/alert";
import {Search} from "../../../models/search";

@Component({
    selector: 'app-issue-list',
    templateUrl: './issue.component.html',
    styleUrls: ['./issue.component.css']
})
export class ListComponent implements OnInit, OnChanges {
    @Input()
    public list: List;

    @Output()
    public reload = new EventEmitter<Issue>();

    @Output()
    onAlert = new EventEmitter<Alert>();

    @ViewChild('details')
    public details: DetailsComponent;

    public lists: List[];

    public selectedIssue: Issue;
    public selectedIssues: Issue[];
    private deletedIssue: Issue;

    private _mouseEnterStream: EventEmitter<any> = new EventEmitter();
    private _mouseLeaveStream: EventEmitter<any> = new EventEmitter();
    public zoomedCoverUrl = '';

    public working = false;
    public currentWork: Message = new Message();

    public selectedAll: boolean = false;

    constructor(private modalService: NgbModal,
                private listService: ListService,
                private router: Router,
                private detailsService: DetailsService) {
        this.list = new List();

        router.events.subscribe(() => {
            this.selectedIssues = [];
            this.selectedIssue = null;
        });
    }

    ngOnInit() {
        this.selectedIssues = [];
        this.selectedIssue = null;

        this.listService.getLists().subscribe(
            response => this.lists = response.Payload
        );

        this._mouseEnterStream.flatMap((e) => {
            return Observable
                .of(e)
                .delay(1500)
                .takeUntil(this._mouseLeaveStream);
        }).subscribe(
            (e) => {
                this.zoomedCoverUrl = e;
            }
        );

        this._mouseLeaveStream.subscribe(() => {
            this.zoomedCoverUrl = '';
        });
    }

    ngOnChanges() {
        if (this.selectedAll) {
            this.selectedAll = false;

            this.selectedIssues = [];
            this.addToSelectedMulti(0);
        }
    }

    addToSelectedMulti(idx: number) {
        if(isUndefined(this.list.Objects[idx])) {
            this.working = false;
            return;
        }

        if(!this.list.Objects[idx].Header) {
            this.detailsService.getDetails(this.list.Objects[idx]).subscribe(
                response => {
                    if (response.Type === "success") {
                        this.selectedIssues.push(response.Payload);
                        this.addToSelectedMulti(idx+1);
                    } else {
                        let alert: Alert = new Alert();
                        alert.type = response.Type;
                        alert.message = response.Message;
                        this.onAlert.emit(alert);
                    }
                }
            );
        } else {
            this.addToSelectedMulti(idx+1);
        }
    }

    openDelete(content, i: Issue) {
        event.stopPropagation();

        this.deletedIssue = i;
        this.modalService.open(content);
    }

    deleteIssue() {
        if(this.selectedIssues != null && this.selectedIssues.length != 0) {
            this.working = true;
            this.currentWork = new Message();

            for (let i = 0; i < this.selectedIssues.length; i++) {
                this.selectedIssues[i].Lists = [];
                let list = new List();
                list.Id = this.list.Id;
                this.selectedIssues[i].Lists.push(list);
            }

            const socket = this.detailsService.deleteIssues();
            socket.subscribe(response => {
                response = JSON.parse(response);

                if (response.Type !== "error") {
                    if (!response.Payload.Type && response.Payload.indexOf('done') === 0) {
                        this.working = false;
                        this.currentWork = null;
                        this.selectedIssues = [];
                        this.reload.emit(null);
                    } else if (!response.Payload.Type && response.Payload.indexOf('Hello there!') === 0) {
                        socket.next(this.selectedIssues);
                    } else {
                        this.currentWork = response.Payload;
                    }
                } else {
                    let alert: Alert = new Alert();
                    alert.type = response.Type;
                    alert.message = response.Message;
                    this.onAlert.emit(alert);
                }
            });
        } else {
            this.deletedIssue.Lists = [];
            let list = new List();
            list.Id = this.list.Id;
            this.deletedIssue.Lists.push(list);

            this.detailsService.deleteIssue(this.deletedIssue).subscribe(
                response => {
                    if (response.Type === "success") {
                        this.deletedIssue = null;
                        this.reload.emit(null);
                    } else {
                        let alert: Alert = new Alert();
                        alert.type = response.Type;
                        alert.message = response.Message;
                        this.onAlert.emit(alert);
                    }
                }
            )
        }
    }

    addTo(list: List, issue: Issue) {
        if(this.selectedIssues != null && this.selectedIssues.length != 0) {
            this.working = true;
            this.currentWork = new Message();

            for (let i = 0; i < this.selectedIssues.length; i++) {
                if(this.selectedIssues[i].Lists == null || isUndefined(this.selectedIssues[i].Lists)) {
                    this.selectedIssues[i].Lists = [];
                }

                this.selectedIssues[i].Lists.push(list);
            }

            const socket = this.detailsService.updateIssues();
            socket.subscribe(response => {
                response = JSON.parse(response);

                if (response.Type !== "error") {
                    if (!response.Payload.Type && response.Payload.indexOf('done') === 0) {
                        this.working = false;
                        this.currentWork = null;
                        this.selectedIssues = [];
                        this.reload.emit(null);
                    } else if (!response.Payload.Type && response.Payload.indexOf('Hello there!') === 0) {
                        socket.next(this.selectedIssues);
                    } else {
                        this.currentWork = response.Payload;
                    }
                } else {
                    let alert: Alert = new Alert();
                    alert.type = response.Type;
                    alert.message = response.Message;
                    this.onAlert.emit(alert);
                }
            });
        } else {
            event.stopPropagation();

            this.detailsService.getDetails(issue).subscribe(
                response => {
                    // indicator for movement
                    list.Search.Offset = -1;

                    response.Payload.Lists.push(list);

                    this.detailsService.update(response.Payload).subscribe(
                        response => {
                            if (response.Type === "success") {
                                this.reload.emit(response.Payload)
                            } else {
                                let alert: Alert = new Alert();
                                alert.type = response.Type;
                                alert.message = response.Message;
                                this.onAlert.emit(alert);
                            }
                        }
                    )
                }
            );
        }
    }

    indexInSelectedIssues(i: Issue) {
        return this.selectedIssues.map(function(e) { return e.Id; }).indexOf(i.Id);
    }

    onReload(issue: Issue) {
        this.reload.emit(issue);
    }

    showCover(url: string, event) {
        if(!event.ctrlKey && !event.metaKey && this.selectedIssues.length == 0) {
            this._mouseEnterStream.emit(url);
        }
    }

    hideCover() {
        this._mouseLeaveStream.emit();
    }

    openDetails(i: Issue, event) {
        if(event.ctrlKey || event.metaKey) {
            this.addToSelected(i);
        } else {
            this.selectedIssue = i;
            this.details.open(i, this.list.Search.OrgIssue)
        }
    }

    addToSelected(i: Issue) {
        if(this.indexInSelectedIssues(i) == -1) {
            this.detailsService.getDetails(i).subscribe(
                response => {
                    if (response.Type === "success") {
                        this.selectedIssues.push(response.Payload)
                    } else {
                        let alert: Alert = new Alert();
                        alert.type = response.Type;
                        alert.message = response.Message;
                        this.onAlert.emit(alert);
                    }
                }
            );
        } else {
            this.selectedIssues.splice(this.indexInSelectedIssues(i),this.indexInSelectedIssues(i)+1);
        }
    }

    openMultiEdit(content) {
        const options: NgbModalOptions = {
            size: 'lg'
        };

        this.modalService.open(content, options);
    }

    multiEdit(e: Issue) {
        this.working = true;
        this.currentWork = new Message();

        for (let i = 0; i < this.selectedIssues.length; i++) {
            if(e.Title !== null && !isUndefined(e.Title) && e.Title !== '') {
                this.selectedIssues[i].Title = e.Title;
            }

            if(e.Series != null && !isUndefined(e.Series)) {
                if(e.Series.Title !== null && !isUndefined(e.Series.Title) && e.Series.Title !== '') {
                    this.selectedIssues[i].Series.Title = e.Series.Title;
                }
                if(e.Series.Volume !== null && !isUndefined(e.Series.Volume) && e.Series.Volume !== 0) {
                    this.selectedIssues[i].Series.Volume = e.Series.Volume;
                }
                if(e.Series.Startyear !== null && !isUndefined(e.Series.Startyear)
                    && e.Series.Startyear !== 0) {
                    this.selectedIssues[i].Series.Startyear = e.Series.Startyear;
                }
                if(e.Series.Publisher.Name !== null && !isUndefined(e.Series.Publisher.Name)
                    && e.Series.Publisher.Name !== '') {
                    this.selectedIssues[i].Series.Publisher.Name = e.Series.Publisher.Name;
                }
            }

            if(e.Format !== null && !isUndefined(e.Format) && e.Format !== '') {
                this.selectedIssues[i].Format = e.Format;
            }
            if(e.Language !== null && !isUndefined(e.Language) && e.Language !== '') {
                this.selectedIssues[i].Language = e.Language;
            }
            if(e.Pages !== null && !isUndefined(e.Pages) && e.Pages !== 0) {
                this.selectedIssues[i].Pages = e.Pages;
            }
            if(e.Releasedate !== null && !isUndefined(e.Releasedate) && e.Releasedate !== '') {
                this.selectedIssues[i].Releasedate = e.Releasedate;
            }

            if(e.Price != null && !isUndefined(e.Price)) {
                if (e.Price.Price !== null && !isUndefined(e.Price.Price) && e.Price.Price !== 0) {
                    this.selectedIssues[i].Price.Price = e.Price.Price;
                }
                if (e.Price.Currency !== null && !isUndefined(e.Price.Currency) && e.Price.Currency !== '') {
                    this.selectedIssues[i].Price.Currency = e.Price.Currency;
                }
            }

            if(e.Quality !== null && !isUndefined(e.Quality) && e.Quality !== '') {
                this.selectedIssues[i].Quality = e.Quality;
            }
            if(e.QualityAdditional !== null && !isUndefined(e.QualityAdditional)
                && e.QualityAdditional !== '') {
                this.selectedIssues[i].QualityAdditional = e.QualityAdditional;
            }
            if(e.Amount !== null && !isUndefined(e.Amount) && e.Amount >= 1) {
                this.selectedIssues[i].Amount = e.Amount;
            }
            if(e.Read !== null && !isUndefined(e.Read) && e.Read !== 0) {
                this.selectedIssues[i].Read = e.Read;
            }
        }

        const socket = this.detailsService.updateIssues();
        socket.subscribe(response => {
            response = JSON.parse(response);

            if (response.Type !== "error") {
                if (!response.Payload.Type && response.Payload.indexOf('done') === 0) {
                    this.working = false;
                    this.currentWork = null;
                    this.reload.emit(null);
                } else if (!response.Payload.Type && response.Payload.indexOf('Hello there!') === 0) {
                    socket.next(this.selectedIssues);
                } else {
                    this.currentWork = response.Payload;
                }
            } else {
                let alert: Alert = new Alert();
                alert.type = response.Type;
                alert.message = response.Message;
                this.onAlert.emit(alert);
            }
        });
    }

    resetMultiSelect() {
        this.selectedIssues = [];
    }

    getTitle(i: Issue) {
        let title = i.Series.Title + ' (' + this.romanize(i.Series.Volume) + ') (' + i.Series.Startyear + ') #' + i.Number;

        if (i.Title && !this.list.Search.OrgIssue) {
            title += ' (' + i.Title + ')';
        }

        return title;
    }

    selectAll() {
        this.selectedAll = true;
        this.working = true;
        this.currentWork = new Message();
        this.currentWork.Type = "SelectAll";

        const search = new Search(this.list.Search);
        search.Start = 0;
        search.Offset = this.list.Amount;
        this.list.Search = search;
    }

    showMoveToDropdown(idx) {
        event.stopPropagation();

        const dds = document.getElementsByClassName('dropdown-menu');
        for (let i = 0; i < dds.length; i++) {
            if (i !== idx + 1) {
                dds.item(i).classList.remove('show');
            }
        }

        const dd = document.getElementsByClassName('dropdown-menu').item(idx + 1);
        if (dd.classList.contains('show')) {
            dd.classList.remove('show');
        } else {
            dd.classList.add('show');
        }
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

    stringToNumber(n: string) {
        return parseInt(n.replace(/[^0-9]+/ig,""));
    }

    checkIfComplete(idx: number) {
        while(!this.list.Objects[idx].Header) {
            idx--;
        }

        return  this.list.Objects[idx].Amount == this.list.Objects[idx+1].Series.Issuecount;
    }
}
