import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import {List} from '../../models/list';
import {ListService} from '../list.service';
import {Issue} from 'app/models/issue';
import {isUndefined} from "util";
import {Alert} from "../../models/alert";

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css']
})
export class FooterComponent {
    @Input()
    public list: List;

    @Output()
    reload = new EventEmitter<Issue>();

    @Output()
    onAlert = new EventEmitter<Alert>();

    createIssueModal;

    constructor(private modalService: NgbModal,
                private listService: ListService) {
    }

    renderAdd(): boolean {
        return (this.list.Type !== 'meta' && !this.list.Search.OrgIssue && this.list.Id !== -1
            && this.list.Search.Lists.length === 1)
    }

    download() {
        this.listService.download(this.list).subscribe(response => {
            if (response.Type === "success") {
                const a = document.createElement('a');
                document.body.appendChild(a);
                a.setAttribute('style', 'display: none');

                const blob = new Blob([response.Payload], {type: 'text/csv'});
                const url = window.URL.createObjectURL(blob);
                const date = new Date();
                const filename: string = ((this.list.Name == null || isUndefined(this.list.Name))
                    ? 'Regal' : this.list.Name)
                    + '_' + date.getUTCDay() + '/' + date.getUTCMonth() + '/' + date.getFullYear() + '_'
                    + date.getHours()
                    + ':' + date.getMinutes() + ':' + date.getSeconds() + '.csv';

                a.href = url;
                a.download = filename;
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                let alert: Alert = new Alert();
                alert.type = response.Type;
                alert.message = response.Message;
                this.onAlert.emit(alert);
            }
        });
    }

    scrollToTop() {
        window.scrollTo(0, 0);
    }

    createIssue(content) {
        const options: NgbModalOptions = {
            size: 'lg'
        };

        this.createIssueModal = content;

        this.modalService.open(content, options);
    }

    onCreate(issue: Issue) {
        this.reload.emit(issue);
    }

    easteregg(content) {
        this.modalService.open(content);
    }
}
