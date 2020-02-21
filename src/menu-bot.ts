import { Bot } from "./bot";
import { TodayCustomer } from "./types/today-customer";
import { InlineEvent } from "./types/inline-event.enum";
import { switchNill } from "./types/switchNill";
import { switchMap, tap, mergeMap, concatMap } from "rxjs/operators";
import { MenuParser } from "./menu-parser";
import { MessageChat } from "./types/message-chat";
import { SendMessageOptions } from "./types/send-message-options";
import { id } from "./types/id";
import { iif, concat, of } from "rxjs";

export class MenuBot extends Bot {

    private developer = 969198585;
    private users: Map<id, TodayCustomer> = new Map();

    constructor(token, http, private parser: MenuParser) {
        super(token, http);
    }

    public sendToDeveloper$(message: string) {
        return this.sendMessage$(this.developer, message);
    }

    public sendToAdmin$(message: string, options?: SendMessageOptions) {
        return this.sendMessage$(this.developer, message, options);
    }

    public onApproveTodayMenu$() {
        return this.onInline$(InlineEvent.APPROVE_MENU_LIST).pipe(
            switchMap(({message}) => this.isUserHaveTodayApprove(message.from.id) ? 
                            this.remakeApprove$(message) : this.makeApprove$(message)),

        )
    }

    private addUserToTodayOrder$(message) {
        const id = message.chat.id;
        const message_id = message.message_id;
        const txt = message.text.match(/ID:.*/)[0].replace('ID:', '');
        return this.parser.getByIds$(txt).pipe(
            tap(dinners => this.users.set(id, {dinners, message_id})),
        );
    }

    private makeApprove$(message) {
        console.log('oh my');
        return concat(
            this.addUserToTodayOrder$(message),
            this.sendApprovedOrder$(message.chat, message.text),
            this.changeApprovedMessage(message)
        );
    }

    private remakeApprove$(message) {
        const chat_id = message.from.id;
        const existed = this.users.get(chat_id);
        console.log('ok im in');
        return concat(
            this.updateMessageText$(chat_id, existed?.message_id, 'Сообщение удалено!')
        );
    }

    private isUserHaveTodayApprove(id: id): boolean {
        console.log(this.users, id);
        return this.users.has(id);
    }

    private changeApprovedMessage(message) {
        return this.updateMessageText$(message.chat.id, message.message_id, message.text + '\n\nПодтверждено!');
    }

    private sendApprovedOrder$(chat: MessageChat, text: string) {
        const parse_mode = 'HTML';
        const user = `<a href="tg://user?id=${chat.id}">${chat.first_name} ${chat.last_name}</a>`;
        return this.sendToAdmin$(`${user}:\n${text}`, {parse_mode});
    }
}