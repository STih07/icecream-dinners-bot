import { id } from "./id";

export interface MessageChat {
    id: id;
    first_name: string;
    last_name: string;
    username?: string;
    type: string;
}