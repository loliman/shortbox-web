import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import {Headers, Http, RequestOptions} from '@angular/http';
import {List} from '../models/list';
import * as config from '../config'
import {Subject} from 'rxjs/Subject';
import {Observer} from 'rxjs/Observer';
import {Request} from "../models/Request";
import {Response} from "../models/response";

@Injectable()
export class ListService {
    private options: RequestOptions;

    constructor(private http: Http) {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.options = new RequestOptions({headers: headers});
    }

    getList(list: List): Observable<Response> {
        let req = new Request();
        req.Sessionid = localStorage.getItem('sessionid');
        req.Username = localStorage.getItem('name');
        req.Payload = list;

        return this.http.post(config.url + '/get/list', JSON.stringify(req), this.options)
            .map(res => res.json() || {})
            .catch(res => Observable.throw('error'));
    }

    getLists(): Observable<Response> {
        let req = new Request();
        req.Sessionid = localStorage.getItem('sessionid');
        req.Username = localStorage.getItem('name');

        return this.http.post(config.url + '/get/lists', JSON.stringify(req), this.options)
            .map(res => res.json() || {})
            .catch(res => Observable.throw('error'));
    }

    createList(list: List): Observable<Response> {
        let req = new Request();
        req.Sessionid = localStorage.getItem('sessionid');
        req.Username = localStorage.getItem('name');
        req.Payload = list;

        return this.http.post(config.url + '/create/list', JSON.stringify(req), this.options)
            .map(res => res.json() || {})
            .catch(res => Observable.throw('error'));
    }

    deleteList(list: List): Observable<Response> {
        let req = new Request();
        req.Sessionid = localStorage.getItem('sessionid');
        req.Username = localStorage.getItem('name');
        req.Payload = list;

        return this.http.post(config.url + '/delete/list', JSON.stringify(req), this.options)
            .map(res => res.json() || {})
            .catch(res => Observable.throw('error'));
    }

    updateList(list: List): Observable<Response> {
        let req = new Request();
        req.Sessionid = localStorage.getItem('sessionid');
        req.Username = localStorage.getItem('name');
        req.Payload = list;

        return this.http.post(config.url + '/update/list', JSON.stringify(req), this.options)
            .map(res => res.json() || {})
            .catch(res => Observable.throw('error'));
    }

    moveList(list: List): Observable<Response> {
        let req = new Request();
        req.Sessionid = localStorage.getItem('sessionid');
        req.Username = localStorage.getItem('name');
        req.Payload = list;

        return this.http.post(config.url + '/move/list', JSON.stringify(req), this.options)
            .map(res => res.json() || {})
            .catch(res => Observable.throw('error'));
    }

    download(list: List): Observable<Response> {
        let req = new Request();
        req.Sessionid = localStorage.getItem('sessionid');
        req.Username = localStorage.getItem('name');
        req.Payload = list;

        return this.http.post(config.url + '/export', JSON.stringify(req), this.options)
            .map(res => res.json())
            .catch(res => Observable.throw('error'));
    }

    import() {
        const ws = new WebSocket(config.urlws + '/import/oi');

        const observable = Observable.create(
            (obs: Observer<MessageEvent>) => {
                ws.onmessage = obs.next.bind(obs);
                ws.onerror = obs.error.bind(obs);
                ws.onclose = obs.complete.bind(obs);
                return ws.close.bind(ws);
            });

        const observer = {
            next: (data: Object) => {
                let req = new Request();
                req.Sessionid = localStorage.getItem('sessionid');
                req.Username = localStorage.getItem('name');
                req.Payload = data;

                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(req));
                }
            }
        };

        return <Subject<any>> Subject
            .create(observer, observable)
            .map((response: MessageEvent): String => {
                return response.data
            });
    }
}
