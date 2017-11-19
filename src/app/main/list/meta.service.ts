import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import * as config from '../../config'
import {Headers, Http, RequestOptions} from '@angular/http';
import {Series} from '../../models/series';
import {Publisher} from '../../models/publisher';
import {Request} from "../../models/Request";
import {Response} from "../../models/response";

@Injectable()
export class MetaService {
    private options: RequestOptions;

    public languages: string[];
    public qualities: string[];

    constructor(private http: Http) {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.options = new RequestOptions({headers: headers});

        this.languages = [];
        this.languages.push('Deutsch');
        this.languages.push('Englisch');
        this.languages.push('Japanisch');

        this.qualities = [];
        this.qualities.push('Z0');
        this.qualities.push('Z0-1');
        this.qualities.push('Z1');
        this.qualities.push('Z2');
        this.qualities.push('Z3');
    }

    updateSeries(series: Series): Observable<Response> {
        let req = new Request();
        req.Sessionid = localStorage.getItem('sessionid');
        req.Username = localStorage.getItem('name');
        req.Payload = series;

        return this.http.post(config.url + '/update/series', JSON.stringify(req), this.options)
            .map(res => res.json() || {})
            .catch(res => Observable.throw('error'));
    }

    updatePublisher(publisher: Publisher): Observable<Response> {
        let req = new Request();
        req.Sessionid = localStorage.getItem('sessionid');
        req.Username = localStorage.getItem('name');
        req.Payload = publisher;

        return this.http.post(config.url + '/update/publisher', JSON.stringify(req), this.options)
            .map(res => res.json() || {})
            .catch(res => Observable.throw('error'));
    }
}
