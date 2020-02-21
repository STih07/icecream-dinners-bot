import { HttpService } from "./http.service";
import { RequestInit } from "node-fetch";
import { Observable, timer, of, from } from "rxjs";
import { URLSearchParams } from 'url';
import { delay, repeat, filter, map, tap, switchMap, switchMapTo, share } from "rxjs/operators";
import { id } from "./types/id";
import { SendMessageOptions } from "./types/send-message-options";
import { TelegramMessage } from "./types/telegram-message";
import { InlineEvent } from "./types/inline-event.enum";
import { ReplyMarkup } from "./types/reply-markup";
import { UpdateMessageOptions } from "./types/update-message-options";


export class Bot {
    private apiUrl: string;

    private onUpdate$: Observable<any> = timer(0, 1000).pipe(
        switchMap(() => this.updateRequest()),
        tap(response => !response.ok && console.error('FATAL ERROR!', response)),
        filter(response => response.ok),
        map(response => response.result),
        filter(result => result.length),
        tap(result => this.lastUpdateId = result[result.length-1].update_id + 1),
        switchMap(messages => from(messages)),
        share()
    );


    private lastUpdateId: number | null = null;
    private allowedUpdates: Set<string> = new Set();
    

    constructor(token: string, private http: HttpService) {
        this.apiUrl = 'https://api.telegram.org/bot' + token + '/';
    }

    request(path: string, body?: any, params?: RequestInit) {
        return this.http.post(this.apiUrl + path + '?' + this.parseParams(body));
    }

    private parseParams = (params: Record<string, string>) => new URLSearchParams(params).toString();


    private updateRequest() {        
        return this.request('getUpdates', {allowed_updates: Array.from(this.allowedUpdates), offset: this.lastUpdateId})
    }

    public onMessage$() {
        this.allowedUpdates.add('message');
        return this.onUpdate$.pipe(
            filter(answer => answer.message),
            map(answer => answer.message),
        );
    }

    private inline$() {
        return this.onUpdate$.pipe(
            filter(answer => answer.callback_query),
            map(answer => answer.callback_query)
        )
    }

    public onInline$(event: InlineEvent) {
        return this.inline$().pipe(
            filter(answer => answer.data === event),
        )
    }

    /**
     * @description
     * Use for subscribing message event.
     * @see Bot.onInline$ for subscribing inline event.
     * @todo use String.indexOf if command is String
     */
    public on(command: string | RegExp) {
        return this.onMessage$().pipe(
            filter((message) => message?.text.match(command))
        );
    }

    public sendMessage$(chat_id: id, text: string, options?: SendMessageOptions) {
        return this.request('sendMessage', {chat_id, text, ...options})
    }

    public replyToMessage$(message: TelegramMessage, text: string, options?: SendMessageOptions) {
        return this.sendMessage$(message.chat.id, text, {reply_to_message_id: message.message_id, ...options});
    }

    public sendAction$(chat_id: id, action: string) {
        return this.request('sendChatAction', {chat_id, action});
    }

    public updateMessageMarkup$(chat_id: id, message_id: id, options?: SendMessageOptions) {
        return this.request('editMessageReplyMarkup', {chat_id, message_id, ...options});
    }

    public updateMessageText$(chat_id, message_id, text, options?: UpdateMessageOptions) {
        return this.request('editMessageText', {chat_id, message_id, text, ...options});
    }

    public clearMarkup$(chat_id: id, message_id: id) {
        return this.updateMessageMarkup$(chat_id, message_id, {reply_markup: JSON.stringify({inline_keyboard:[[]]})});
    }
}