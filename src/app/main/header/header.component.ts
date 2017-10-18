import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {List} from '../../models/list';
import {ListService} from '../list.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/Rx';
import {Observable} from 'rxjs/Observable';
import {Search} from '../../models/search';
import {User} from '../../models/user';
import {AuthService} from '../../auth/auth.service';
import {Message} from '../../models/message';
import {isUndefined} from "util";
import {Alert} from "../../models/alert";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnChanges {
    @Input()
    public search: Search;

    @Output()
    public emitList = new EventEmitter<List>();

    @Output()
    public onIsLoading = new EventEmitter<boolean>();
    private isLoading = false;

    @Output()
    onAlert = new EventEmitter<Alert>();

    public importing = false;
    private extendedSearch;

    public list: List;
    public lists: List[];
    private newList: List;

    public quickSearchTerm = '';
    private combinedLists: number[] = [];
    public currentImport: Message = null;

    constructor(private listService: ListService,
                private authService: AuthService,
                private modalService: NgbModal,
                private router: Router,
                private route: ActivatedRoute) {

        this.list = new List();

        router.events.subscribe(() => {
            this.ngOnInit();
        });
    }

    ngOnInit() {
        this.closeExtendedSearch();
        window.scrollTo(0, 0);

        this.list.Amount = -1;
        this.list.Objects = [];

        this.listService.getLists().subscribe(
            response => {
                if (response.Type === "success") {
                    this.lists = response.Payload;

                    const ids = [];
                    let type = 'issue';
                    let orgIssue = false;

                    this.route
                        .params
                        .subscribe(params => {
                            if (params['id'] === null || isUndefined(params['id'])) {
                                ids.push(0);
                            } else if (params['id'].indexOf(',') === -1) {
                                ids.push(+params['id'] || 0);
                            } else {
                                const idsAsString = params['id'].split(',');
                                for (let i = 0; i < idsAsString.length; i++) {
                                    ids.push(+idsAsString[i]);
                                }
                            }
                            type = params['type'] || 'issue';
                            orgIssue = params['oi'] === 'true' || false;
                        });

                    if (this.list.Type !== type || this.list.Id !== ids[0]) {
                        this.list = new List();
                        this.list.Type = type;
                        this.list.Id = ids[0];
                        this.list.Search.Lists = this.list.Search.Lists.concat(ids);

                        if(ids.length > 1) {
                            this.combinedLists = ids;
                        }

                        this.list.Search.OrgIssue = orgIssue;

                        if (orgIssue) {
                            this.list.Search.OrgIssueS = new Search(null);
                            this.list.Search.OrgIssueS.Lists = this.list.Search.OrgIssueS.Lists.concat(ids);
                            this.list.Search.GOne = '!s.title';
                        }

                        for(let l of this.lists) {
                            if(l.Id === this.list.Id && this.list.Id !== 0) {
                                this.list.Search.GOne = l.GroupBy;
                            }
                        }

                        this.loadList(this.list);
                    }
                } else {
                    let alert: Alert = new Alert();
                    alert.type = response.Type;
                    alert.message = response.Message;
                    this.onAlert.emit(alert);
                }
            }
        );
    }

    ngOnChanges(changes: SimpleChanges) {
        if(!isUndefined(changes.search.previousValue)) {
            const orgIssue = this.list.Search.OrgIssue;
            const lists = this.list.Search.Lists;
            const cover = this.list.Search.Cover;
            const orgIssueS = this.list.Search.OrgIssueS;

            if (this.list.Search.GOne.startsWith('!')) {
                this.list.Search = this.search;
                this.list.Search.GOne = 's.title';
            } else {
                this.list.Search = this.search;
            }

            this.list.Search.Cover = cover;
            this.list.Search.Lists = lists;
            this.list.Search.OrgIssue = orgIssue;
            this.list.Search.OrgIssueS = orgIssueS;
            this.loadList(this.list);
        }
    }

    navigate(list: List) {
        this.closeExtendedSearch();
        this.router.navigate(['list', {type: list.Type, id: list.Id}]);

        this.list.Id = list.Id;
        this.list.Type = list.Type;
        this.list.Search = new Search(null);

        if(list.Id !== 0) {
            this.list.Search.GOne = list.GroupBy;
        }

        this.list.Search.Lists.push(list.Id);
        this.quickSearchTerm = '';
        this.combinedLists = [];
    }

    loadList(list: List) {
        if (!this.isLoading) {
            this.isLoading = true;
            this.onIsLoading.emit(this.isLoading);

            const tlist = new List();
            tlist.Id = list.Id;
            tlist.Search = list.Search;
            tlist.Type = list.Type;

            this.listService.getList(tlist).subscribe(
                response => {
                    if (response.Type === "success") {
                        if (this.list.Search.Start === 0) {
                            if(response.Payload === null || isUndefined(response.Payload)) {
                                this.list = list;
                                this.list.Amount = 0;
                                this.list.Objects = [];
                            } else {
                                this.list = response.Payload;
                            }
                        } else {
                            this.list.Objects = this.list.Objects.concat(response.Payload.Objects);
                        }

                        this.search.Lists = this.list.Search.Lists;
                        this.list.Search = this.search;

                        if (this.list.Search.Start + this.list.Search.Offset === this.list.Amount) {
                            this.list.Search.Offset = 0;
                        }

                        this.emitList.emit(this.list);

                        this.isLoading = false;
                        this.onIsLoading.emit(this.isLoading);
                    } else {
                        let alert: Alert = new Alert();
                        alert.type = response.Type;
                        alert.message = response.Message;
                        this.onAlert.emit(alert);

                        this.emitList.emit(this.list);

                        this.isLoading = false;
                        this.onIsLoading.emit(this.isLoading);
                    }
                }
            )
        }
    }

    renderEdit() {
        return this.list.Type !== 'meta' && this.list.Id !== -1 && this.list.Id !== 0;
    }

    saveList() {
        this.listService.createList(this.newList).subscribe(
            response => {
                if (response.Type === "success") {
                    this.lists = response.Payload;
                    this.resetList();
                } else {
                    let alert: Alert = new Alert();
                    alert.type = response.Type;
                    alert.message = response.Message;
                    this.onAlert.emit(alert);
                }
            }
        )
    }

    resetList() {
        this.newList = null;
    }

    addListModal(content) {
        this.newList = new List;
        this.modalService.open(content);
    }

    updateListModal(content) {
        this.modalService.open(content);
    }

    deleteList() {
        this.listService.deleteList(this.list).subscribe(
            response => {
                if (response.Type === "success") {
                    this.router.navigate(['list', {type: 'issue', id: 0}]);
                    this.list.Search = new Search(null);
                } else {
                    let alert: Alert = new Alert();
                    alert.type = response.Type;
                    alert.message = response.Message;
                    this.onAlert.emit(alert);
                }
            }
        )
    }

    updateList() {
        this.listService.updateList(this.list).subscribe(
            response => {
                if (response.Type === "success") {
                    this.lists = response.Payload
                } else {
                    let alert: Alert = new Alert();
                    alert.type = response.Type;
                    alert.message = response.Message;
                    this.onAlert.emit(alert);
                }
            }
        )
    }

    quickSearch = (text$: Observable<string>) =>
        text$
            .debounceTime(200)
            .distinctUntilChanged()
            .map(term => {
                this.list.Amount = -1;
                this.list.Objects = [];
                const orgIssue = this.list.Search.OrgIssue;
                const lists = this.list.Search.Lists;
                const cover = this.list.Search.Cover;
                this.search = new Search(null);
                this.search.OrgIssue = orgIssue;
                this.search.Lists = lists;
                this.search.Cover = cover;

                term = term.toUpperCase();

                const sidx = term.indexOf('S:');
                const syidx = term.indexOf('SY:');
                const pidx = term.indexOf('P:');
                const nidx = term.indexOf('N:');

                if (sidx !== -1) {
                    let temp = term.substr(sidx + 2);

                    if (temp.indexOf('"') === 0) {
                        temp = temp.substr(1);
                        temp = temp.substr(0, temp.indexOf('"'));
                    } else if (temp.indexOf(' ') !== -1) {
                        temp = temp.substr(0, temp.indexOf(' '));
                    }

                    this.search.Issue.Series.Title = temp;
                }

                if (syidx !== -1) {
                    let temp = term.substr(syidx + 3);

                    if (temp.indexOf(' ') !== -1) {
                        temp = temp.substr(0, temp.indexOf(' '));
                    }

                    this.search.Issue.Series.Startyear = +temp;
                }

                if (pidx !== -1) {
                    let temp = term.substr(pidx + 2);

                    if (temp.indexOf('"') === 0) {
                        temp = temp.substr(1);
                        temp = temp.substr(0, temp.indexOf('"'));
                    } else if (temp.indexOf(' ') !== -1) {
                        temp = temp.substr(0, temp.indexOf(' '));
                    }

                    this.search.Issue.Series.Publisher.Name = temp;
                }

                if (nidx !== -1) {
                    let temp = term.substr(nidx + 2);

                    if (temp.indexOf(' ') !== -1) {
                        temp = temp.substr(0, temp.indexOf(' '));
                    }

                    this.search.Issue.Number = temp;
                }

                if (this.search.Issue.Number !== null && !isUndefined(this.search.Issue.Number)) {
                    term = term.replace('N:' + this.search.Issue.Number, '');
                }
                if (this.search.Issue.Series.Title !== null && !isUndefined(this.search.Issue.Series.Title)) {
                    term = term.replace('S:' + (this.search.Issue.Series.Title.indexOf(' ') !== -1 ? '"' : '')
                        + this.search.Issue.Series.Title
                        + (this.search.Issue.Series.Title.indexOf(' ') !== -1 ? '"' : ''), '');
                }
                if (this.search.Issue.Series.Startyear !== null && !isUndefined(this.search.Issue.Series.Startyear)) {
                    term = term.replace('SY:' + this.search.Issue.Series.Startyear, '');
                }
                if (this.search.Issue.Series.Publisher.Name !== null
                    && !isUndefined(this.search.Issue.Series.Publisher.Name)) {
                    term = term.replace('P:' + (this.search.Issue.Series.Publisher.Name.indexOf(' ') !== -1 ? '"' : '')
                        + this.search.Issue.Series.Publisher.Name
                        + (this.search.Issue.Series.Publisher.Name.indexOf(' ') !== -1 ? '"' : ''), '');
                }

                while (term.indexOf('  ') !== -1) {
                    term = term.replace('  ', ' ');
                }

                this.search.Issue.Title = term;

                if(this.orgIssueS !== null && !isUndefined(this.orgIssueS)) {
                    this.search.OrgIssueS = new Search(this.orgIssueS);
                }

                this.list.Search = this.search;
                this.loadList(this.list);
            });

    onSearch(search: Search) {
        this.closeExtendedSearch();

        this.list.Amount = -1;
        this.list.Objects = [];

        this.search = new Search(search);
        this.quickSearchTerm = '';
        this.list.Search = this.search;
        this.loadList(this.list);
    }

    metaList(id: number) {
        this.closeExtendedSearch();

        this.router.navigate(['list', {type: 'meta', id: id}]);
        this.quickSearchTerm = '';
        this.combinedLists = [];
    }

    logout() {
        const user: User = new User();
        user.Name = localStorage.getItem('name');

        this.authService.logout(user).subscribe(response => {
            if (response.Type === "success") {
                localStorage.removeItem('name');
                localStorage.removeItem('sessionid');
                this.router.navigate(['login']);
            } else {
                let alert: Alert = new Alert();
                alert.type = response.Type;
                alert.message = response.Message;
                this.onAlert.emit(alert);
            }
        });
    }

    extendedSearchClick(search) {
        if (!this.extendedSearch) {

            const options: NgbModalOptions = {
                size: 'lg',
                backdrop: false,
                keyboard: false,
                windowClass: 'search-div search-visible'
            };

            this.extendedSearch = this.modalService.open(search, options);
        } else {
            this.closeExtendedSearch();
        }

        this.quickSearchTerm = '';
    }

    closeExtendedSearch() {
        if (this.extendedSearch) {
            this.extendedSearch.close();
            this.extendedSearch = null;
        }
    }

    private orgIssueS: Search;
    private orgQuickSearchTerm: string;

    switchToOrgIssueView() {
        const orgIssue = !this.list.Search.OrgIssue;
        const lists = this.list.Search.Lists;

        if(orgIssue) {
            this.orgIssueS = new Search(this.list.Search);
            this.orgQuickSearchTerm = this.quickSearchTerm;

            this.quickSearchTerm = '';
            this.list.Search = new Search(null);
            this.list.Search.OrgIssueS = this.orgIssueS;
        } else {
            this.quickSearchTerm = this.orgQuickSearchTerm;
            this.list.Search = new Search(this.orgIssueS);
            this.list.Search.OrgIssueS = this.orgIssueS;

            this.orgIssueS = null;
            this.orgQuickSearchTerm = '';
        }

        this.list.Search.OrgIssue = orgIssue;
        if (orgIssue) {
            this.list.Search.GOne = '!s.title';
        }
        this.list.Search.Lists = lists;

        let ids = '';
        for (let i = 0; i < this.list.Search.Lists.length; i++) {
            ids += this.list.Search.Lists[i] + ',';
        }
        ids = ids.substr(0, ids.length - 1);

        this.router.navigate(['list', {type: 'issue', id: ids, oi: orgIssue}]);
    }

    switchToCoverView() {
        this.list.Search.Cover = !this.list.Search.Cover;
    }

    combine(content) {
        this.modalService.open(content);
        this.combinedLists = [];
    }

    select(id: number) {
        if (this.combinedLists.indexOf(id) === -1) {
            this.combinedLists.push(id);
        } else {
            this.combinedLists.splice(this.combinedLists.indexOf(id), 1);
        }
    }

    selectAll() {
        if (this.combinedLists.length === this.lists.length) {
            this.combinedLists = [];
        } else {
            for (const list of this.lists) {
                if (this.combinedLists.indexOf(list.Id) === -1) {
                    this.combinedLists.push(list.Id);
                }
            }
        }
    }

    showCombinedLists() {
        this.closeExtendedSearch();

        let ids = '';
        for (let i = 0; i < this.combinedLists.length; i++) {
            ids += this.combinedLists[i] + ',';
        }
        ids = ids.substr(0, ids.length - 1);

        this.router.navigate(['list', {type: 'issue', id: ids}]);
        this.list.Search = new Search(null);
        this.list.Search.Lists = this.list.Search.Lists.concat(this.combinedLists);
        this.quickSearchTerm = '';
    }

    moveList(l: List) {
        const list = new List();
        list.Id = this.list.Id;
        list.Name = this.list.Name;
        list.Type = this.list.Type;
        list.Search.Lists = [];
        list.Search.Lists.push(l.Id);

        this.listService.moveList(list).subscribe(
            response => {
                if (response.Type === "success") {
                    this.list.Search = new Search(null);
                } else {
                    let alert: Alert = new Alert();
                    alert.type = response.Type;
                    alert.message = response.Message;
                    this.onAlert.emit(alert);
                }
            }
        )
    }

    import() {
        this.importing = true;
        const socket = this.listService.import();

        socket.subscribe(response => {
            response = JSON.parse(response);

            if (response.Type === "success") {
                if (response.Payload.Type) {
                    this.currentImport = response.Payload;
                } else if (!response.Payload.Type && response.Payload.indexOf('Hello there!') === 0) {
                    socket.next("Go!");
                } else {
                    this.importing = false;
                    this.currentImport = null;
                    socket.unsubscribe();
                    if (response.Payload !== '') {
                        const a = document.createElement('a');
                        document.body.appendChild(a);
                        a.setAttribute('style', 'display: none');

                        const blob = new Blob([response.Payload], {type: 'text/csv'});
                        const url = window.URL.createObjectURL(blob);
                        const filename = 'originalissue_import_errors.csv';

                        a.href = url;
                        a.download = filename;
                        a.click();
                        window.URL.revokeObjectURL(url);
                    }
                }
            } else {
                let alert: Alert = new Alert();
                alert.type = response.Type;
                alert.message = response.Message;
                this.onAlert.emit(alert);
            }
        });
    }
}
