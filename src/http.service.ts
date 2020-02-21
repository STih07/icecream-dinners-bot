import { from } from "rxjs";
import fetch, { RequestInit, Response } from "node-fetch"; 

interface RequestParams extends RequestInit {
    responseType?: 'JSON' | 'ARRAYBUFFER'
};
export class HttpService {
    public get(url: string, params?: RequestParams) {
        return this.request(url, {...params, method: 'GET'});
    }

    public post(url: string, body?: any, params?: RequestParams) {
        return this.request(url, {...params, body, method: 'POST'});
    }

    private request(url: string, params?: RequestParams) {
        return from(fetch(url, {...params}).then(res => this.transform(res, params)));
    }

    private transform(res: Response, params?: RequestParams) {
        if (params?.responseType === 'ARRAYBUFFER') {
            return res.arrayBuffer();
        } else {
            return res.json();
        }
    }
}