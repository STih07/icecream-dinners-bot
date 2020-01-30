import { HttpService } from "./http.service";
import { RequestInit } from "node-fetch";
import { Observable, timer } from "rxjs";
import { delay, repeat, filter, map, tap, switchMap, switchMapTo } from "rxjs/operators";

export class Bot {
    private apiUrl: string;
    private http: HttpService;

    private onUpdate$: Observable<any> | null = null;
    private lastUpdateId: number | null = null;  

    constructor(token: string) {
        this.apiUrl = 'https://api.telegram.org/bot' + token + '/';
        this.http = new HttpService();
    }

    request(path: string, body?: any, params?: RequestInit) {
        return this.http.post(this.apiUrl + path, body, params);
    }

    updateRequest() {        
        return this.request('getUpdates', {limit: 1, allowed_updates: ['message'], offset: this.lastUpdateId})
    }

    getUpdates() {
        if (!this.onUpdate$) {
            this.onUpdate$ = timer(0, 1000).pipe(
                switchMap(() => this.updateRequest()),
                filter(response => response.ok),
                map(response => response.result),
                tap(result => this.lastUpdateId = result[result.length-1].update_id)
            )
        }
        return this.onUpdate$; 
    }
}