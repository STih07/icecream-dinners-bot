import { id } from "./id";

export interface GetUpdateRequestParams {
    offset?: id;
    limit: number;
    timeout: number;
    allowed_updates: string[];
}