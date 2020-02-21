import { id } from "./id";
import { Menu } from "./menu";

export interface TodayCustomer {
    dinners: Menu[];
    message_id: id;
}