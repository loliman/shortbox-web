import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Series} from '../models/series';
import {Publisher} from '../models/publisher';
import * as config from '../config'
import {Request} from "../models/Request";
import {Response} from "../models/response";

@Injectable()
export class AutocompleteService {
    private options: RequestOptions;

    constructor(private http: Http) {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.options = new RequestOptions({headers: headers});
    }

    getSeries(term: string): Observable<Series> {
        let req = new Request();
        req.Sessionid = localStorage.getItem('sessionid');
        req.Username = localStorage.getItem('name');
        req.Payload = term;

        const series: Series = new Series();
        series.Title = term;

        return this.http.post(config.url + '/get/series', JSON.stringify(req), this.options)
            .map(res => res.json().Payload || {})
            .catch(res => Observable.throw('error'));
    }

    getPublisher(term: string): Observable<Publisher> {
        let req = new Request();
        req.Sessionid = localStorage.getItem('sessionid');
        req.Username = localStorage.getItem('name');
        req.Payload = term;

        const publisher: Publisher = new Publisher();
        publisher.Name = term;

        return this.http.post(config.url + '/get/publishers', JSON.stringify(req), this.options)
            .map(res => res.json().Payload || {})
            .catch(res => Observable.throw('error'));
    }
}
