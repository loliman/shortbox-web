import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Issue} from '../../models/issue';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import {Story} from '../../models/story';
import * as config from '../../config'
import {Observer} from "rxjs/Observer";
import {Subject} from "rxjs/Subject";
import {Request} from "../../models/Request";
import {Response} from "../../models/response";

@Injectable()
export class DetailsService {
    private options: RequestOptions;

    constructor(private http: Http) {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.options = new RequestOptions({headers: headers});
    }

    getDetails(issue: Issue): Observable<Response> {
        let req = new Request();
        req.Sessionid = localStorage.getItem('sessionid');
        req.Username = localStorage.getItem('name');
        req.Payload = issue;

        return this.http.post(config.url + '/get/issue', JSON.stringify(req), this.options)
            .map(res => res.json() || {})
            .catch(res => Observable.throw('error'));
    }

    update(issue: Issue): Observable<Response> {
        let req = new Request();
        req.Sessionid = localStorage.getItem('sessionid');
        req.Username = localStorage.getItem('name');
        req.Payload = issue;

        return this.http.post(config.url + '/update/issue', JSON.stringify(req), this.options)
            .map(res => res.json() || {})
            .catch(res => Observable.throw('error'));
    }

    updateIssues() {
        const ws = new WebSocket(config.urlws + '/update/multi/issue');

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

    updateStory(story: Story): Observable<Response> {
        let req = new Request();
        req.Sessionid = localStorage.getItem('sessionid');
        req.Username = localStorage.getItem('name');
        req.Payload = story;

        return this.http.post(config.url + '/update/story', JSON.stringify(req), this.options)
            .map(res => res.json() || {})
            .catch(res => Observable.throw('error'));
    }

    deleteIssue(issue: Issue): Observable<Response> {
        let req = new Request();
        req.Sessionid = localStorage.getItem('sessionid');
        req.Username = localStorage.getItem('name');
        req.Payload = issue;

        return this.http.post(config.url + '/delete/issue', JSON.stringify(req), this.options)
            .map(res => res.json() || {})
            .catch(res => Observable.throw('error'));
    }

    deleteIssues() {
        const ws = new WebSocket(config.urlws + '/delete/multi/issue');

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
