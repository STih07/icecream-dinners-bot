import { InlineEvent } from "./inline-event.enum";

export class InlineButton {
    constructor(
        private text: string, 
        private callback_data: InlineEvent
    ) {}
}