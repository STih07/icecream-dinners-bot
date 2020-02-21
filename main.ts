
import { Bot } from "./src/bot";

import { map, filter, tap, switchMap, delayWhen, switchMapTo } from "rxjs/operators";
import { NEVER, of, merge } from "rxjs";
import { MenuParser } from "./src/menu-parser";
import { HttpService } from "./src/http.service";
import { Menu } from "./src/types/menu";
import { switchNill } from "./src/types/switchNill";
import { ReplyMarkup } from "./src/types/reply-markup";
import { InlineButton } from "./src/types/inline-button";
import { InlineEvent } from "./src/types/inline-event.enum";
import { id } from "./src/types/id";
import { MenuBot } from "./src/menu-bot";

const token = process.env.TELEGRAM_BOT_TOKEN || '';

if (!token) {
    throw ReferenceError('No telegram token provided!');
}

const http = new HttpService();
const parser = new MenuParser(http);
const bot = new MenuBot(token, http, parser);
console.log('Bot started!');

const users = new Set<id>();

bot.onMessage$().pipe(
    // tap(console.log)
).subscribe();

bot.on('/start').pipe(
    switchNill((data) => bot.replyToMessage$(data, 'ok!')),
    switchNill((data) => bot.sendToDeveloper$(`@${data.from.username}\ (${data.from.id}) добавился в бота!`))
).subscribe()

bot.on('/list').pipe(
    switchMap(({from}) => parser.getlist$().pipe(
        switchMap(list => bot.sendMessage$(from.id, parser.menuToString(list)))
    ))
).subscribe();

bot.on(/^\d+(,\s*\d+)*$/g).pipe(
    switchMap((message) => parser.getByIds$(message.text).pipe(
        map(menus => parser.menuToString(menus) + '\n\n' + `ID: ${message.text}\n` + `Всего:  ${parser.getSum(menus)}грн.`),
        switchMap((menus) => bot.sendMessage$(message.from.id, menus, 
            {reply_markup: ReplyMarkup.inline('Подтвердить!', InlineEvent.APPROVE_MENU_LIST)}))
    ))
).subscribe();

bot.onApproveTodayMenu$().subscribe()
