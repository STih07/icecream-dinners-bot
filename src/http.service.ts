import { from } from "rxjs";
import fetch, { RequestInit } from "node-fetch"; 

export class HttpService {
    public get(url: string, params?: RequestInit) {
        return this.request(url, {...params, method: 'GET'});
    }

    public post(url: string, body?: any, params?: RequestInit) {
        return this.request(url, {...params, body, method: 'POST'});
    }

    private request(url: string, params?: RequestInit) {
        return from(fetch(url, params).then(res => res.json()));
    }
}