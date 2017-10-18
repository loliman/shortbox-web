import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {MetaService} from '../../meta.service';
import {Series} from '../../../../models/series';
import {NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import {Alert} from "../../../../models/alert";

@Component({
    selector: 'app-meta-details',
    templateUrl: './meta-details.component.html',
    styleUrls: ['./meta-details.component.css']
})
export class MetaDetailsComponent {
    public series: Series = new Series();

    @Input()
    private type: number;

    @Output()
    reload = new EventEmitter<Object>();

    @Output()
    onAlert = new EventEmitter<Alert>();

    @ViewChild('details')
    public details;

    constructor(private metaService: MetaService,
                private modalService: NgbModal) {
    }

    update() {
        if (this.type !== 1) {
            this.metaService.updateSeries(this.series).subscribe(
                response => {
                    if (response.Type === "success") {
                        this.reload.emit(this.series);
                    } else {
                        let alert: Alert = new Alert();
                        alert.type = response.Type;
                        alert.message = response.Message;
                        this.onAlert.emit(alert);
                    }
                }
            );
        } else {
            this.metaService.updatePublisher(this.series.Publisher).subscribe(
                response => {
                    if (response.Type === "success") {
                        this.reload.emit(this.series);
                    } else {
                        let alert: Alert = new Alert();
                        alert.type = response.Type;
                        alert.message = response.Message;
                        this.onAlert.emit(alert);
                    }
                }
            );
        }
    }

    open(series: Series) {
        this.series = series;

        const options: NgbModalOptions = {
            size: 'lg'
        };

        this.modalService.open(this.details, options);
    }

    reset() {
        this.series = new Series();
    }

    isSeries(): boolean {
        return this.series.Id !== -1;
    }
}
