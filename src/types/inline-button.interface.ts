import { InlineEvent } from "./inline-event.enum";

export interface IInlineButton {
    text: string;
    callback_data: InlineEvent;
}