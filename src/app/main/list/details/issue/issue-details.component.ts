import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import {DetailsService} from '../../issue.service';
import {Issue} from '../../../../models/issue';
import {Story} from '../../../../models/story';
import {Series} from '../../../../models/series';
import {MetaService} from '../../meta.service';
import {Alert} from "../../../../models/alert";

@Component({
    selector: 'app-issue-details',
    templateUrl: './issue-details.component.html',
    styleUrls: ['./issue-details.component.css']
})
export class DetailsComponent {
    isOriginalIssueView: boolean;

    @Output()
    reload = new EventEmitter<Issue>();

    @Output()
    onAlert = new EventEmitter<Alert>();

    @ViewChild('details')
    public details;

    public issue: Issue;

    public languages: string[];
    public qualities: string[];

    public storyPublisher: Series;
    public loading = true;

    constructor(private detailsService: DetailsService,
                private modalService: NgbModal,
                private metaService: MetaService) {
        this.languages = metaService.languages;
        this.qualities = metaService.qualities;
        this.storyPublisher = new Series();
        this.storyPublisher.Id = -1;
    }

    open(issue: Issue, isOriginalIssueView: boolean) {
        this.isOriginalIssueView = isOriginalIssueView;
        this.issue = new Issue();
        this.loadDetails(issue);

        const options: NgbModalOptions = {
            size: 'lg'
        };

        this.modalService.open(this.details, options);
    }

    loadDetails(issue: Issue) {
        this.detailsService.getDetails(issue).subscribe(
            response => {
                if (response.Type === "success") {
                    this.issue = response.Payload;
                    this.issue.Originalissue = this.issue.Originalissue === 1;
                    this.issue.Read = this.issue.Read === 1;

                    if (this.issue.Stories.length > 0) {
                        this.storyPublisher = this.issue.Stories[0].OriginalIssue.Series;
                        this.storyPublisher.Id = -1;
                    }

                    this.loading = false;
                } else {
                    let alert: Alert = new Alert();
                    alert.type = response.Type;
                    alert.message = response.Message;
                    this.onAlert.emit(alert);
                }
            }
        )
    }

    addStory() {
        const s = new Story();
        s.OriginalIssue.Releasedate = '';
        this.issue.Stories.push(s);
    }

    removeStory(idx: number) {
        this.issue.Stories.splice(idx, 1);
        this.update();
    }

    updateSeries(series: Series) {
        series.Id = 0;
        series.Publisher.Id = 0;
        this.issue.Series = series;
    }

    update() {
        this.issue.Read = (this.issue.Read ? 1 : 0);
        this.issue.Originalissue = (this.issue.Originalissue ? 1 : 0);

        for (let i = 0; i < this.issue.Stories.length; i++) {
            if (this.issue.Stories[i].OriginalIssue.Series.Publisher.Name == '') {
                this.issue.Stories[i].OriginalIssue.Series.Publisher.Name = this.storyPublisher.Publisher.Name;
            }
        }

        this.loading = true;

        this.detailsService.update(this.issue).subscribe(
            response => {
                if (response.Type === "success") {
                    this.loadDetails(this.issue);
                    this.reload.emit(this.issue);
                } else {
                    let alert: Alert = new Alert();
                    alert.type = response.Type;
                    alert.message = response.Message;
                    this.onAlert.emit(alert);
                }
            }
        )
    }

    updateStorypublisher(publisher) {
        for (let i = 0; i < this.issue.Stories.length; i++) {
            if (this.issue.Stories[i].OriginalIssue.Series.Publisher.Name == '') {
                this.issue.Stories[i].OriginalIssue.Series.Id = -1;
                this.issue.Stories[i].OriginalIssue.Series.Publisher.Id = 0;
                this.issue.Stories[i].OriginalIssue.Series.Publisher.Name = publisher.Publisher.Name;
            }
        }
    }

    viewOriginalIssue(issue: Issue) {
        this.isOriginalIssueView = !this.isOriginalIssueView;
        this.issue = new Issue();
        this.loadDetails(issue);
    }

    updateStory(s: Story) {
        this.issue.Title = null;

        this.loading = true;
        this.detailsService.updateStory(s).subscribe(
            response => {
                if (response.Type === "success") {
                    this.loadDetails(this.issue);
                    this.reload.emit(this.issue);
                } else {
                    let alert: Alert = new Alert();
                    alert.type = response.Type;
                    alert.message = response.Message;
                    this.onAlert.emit(alert);
                }
            }
        )
    }

    reset() {
        this.issue = new Issue();
    }

    sTitle(s: Story) {
        const name = s.OriginalIssue.Title + ' '
            + '(' + this.romanize(s.OriginalIssue.Series.Volume) + ') '
            + '(' + s.OriginalIssue.Series.Startyear + ') '
            + '#'
            + s.OriginalIssue.Number;

        let title = (name === s.Title ? 'Untitled' : s.Title);
        title += (s.AdditionalInfo == '' ? '' : ' (' + s.AdditionalInfo + ')');

        return title;
    }

    getTitle(i: Issue) {
        let title = i.Series.Title + ' (' + this.romanize(i.Series.Volume) + ') (' + i.Series.Startyear + ') #' + i.Number;

        if (i.Format.Variant) {
            title += ' (Variant Cover ' + i.Format.Variant + ')';
        }

        if (i.Title && !this.isOriginalIssueView) {
            title += ' (' + i.Title + ')';
        }

        return title;
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
