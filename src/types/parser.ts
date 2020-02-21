import { Menu } from "./menu";
import { Observable } from "rxjs";

export interface Parser {
    getlist$(): Observable<Menu[]>;
    getById$(id: number): Observable<Menu>;
}