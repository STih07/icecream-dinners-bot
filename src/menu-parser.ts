import { Menu } from "./types/menu";
import { Weekdays } from "./types/weekdays.enum";
import { Parser } from "./types/parser";
import { Observable, of, throwError } from "rxjs";
import { HttpService } from "./http.service";
import { map, tap, switchMap } from "rxjs/operators";
import { JSDOM } from 'jsdom';
import { id } from "./types/id";
import { WorkBook, read } from 'xlsx';

export class MenuParser implements Parser {

    private today = new Date();
    private list: Menu[] = [];

    constructor(private http: HttpService) {}

    public getById$(id: id) {
        return this.getlist$().pipe(
            map(list => list.find(menu => menu.id === id)),
            switchMap(menu => menu ? of(menu) : throwError(404))
        );
    }

    public getByIds$(message: string): Observable<Menu[]> {
        const ids = this.mapMessageToIds(message);
        return this.getlist$().pipe(
            map(list => ids.map(id => list.find(menu => menu.id === id)).filter(menu => !!menu)),
        ) as Observable<Menu[]>;
    }

    public getlist$(): Observable<Menu[]> {
        const today = new Date();
        if (today.getDate === this.today.getDate && this.list.length) {
            return of(this.list);
        } else {
            return this.fetchTodayList$()
        }
    }

    private fetchTodayList$(): Observable<Menu[]> {
        const responseType = 'ARRAYBUFFER';
        return this.http.get('https://obed.in.ua/menu/ponedelnik/uploads/1.xls', {responseType})
        .pipe(
            map(html => this.parseTable(html)),
            tap(list => this.list = list)
        );
    }


    // It will be painfull if here will be more columns than alphabet
    private parseTable = (data: ArrayBuffer) => {
        const xls = new Uint8Array(data);
        const table = read(xls, {type: 'array', codepage: 1251});
        const sheet = table.Sheets.Sheet1;
        const [first, last] = sheet["!ref"]?.split(':') || [];
        const [firstLetter, ...firstIndex] = first.split('');
        const [lastLetter, ...lastIndex] = last.split('');
        const c = (letter: string) => letter.charCodeAt(0);
        const e = (index: string[]) => +(index.join(''));
        const lettersArray = Array.from({length: c(lastLetter) - c(firstLetter)}, (v, i) => i + c(firstLetter))
            .map(char => String.fromCharCode(char));
        const indexArray = Array.from({length: e(lastIndex) - e(firstIndex) + 1}, (v, i) => i + e(firstIndex));
        const menus: Menu[] = indexArray.map(i => {
            const [id,, name,, price] = lettersArray.map(l => sheet[`${l}${i}`].v);
            return {id: +id, name, price};
        });
        menus.shift();

        return menus;
    }


    getSum = (menus: Menu[]) => menus.reduce((s, e) => s + e.price, 0);


    menuToString = (menus: Menu[]) => menus.map(({id, name, price}) => `[${id}] ${name}, ${price}грн.`).join('\n');


    mapMessageToIds = (message: string) => message.replace(/\s+/g, '').split(',').map(x => +x);
}