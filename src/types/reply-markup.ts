import { InlineButton } from "./inline-button";
import { ReplyButton } from "./reply-button";
import { ReplyKeyboardOptions } from "./reply-keyboard-options";
import { InlineEvent } from "./inline-event.enum";
import { IInlineButton } from "./inline-button.interface";

export class ReplyMarkup {
    constructor(
        private inline_keyboard?: IInlineButton[][],
        private keyboard?: ReplyButton[][],
        private options?: ReplyKeyboardOptions
    ) {}

    public json() {
        const {inline_keyboard, keyboard} = this;
        return JSON.stringify({inline_keyboard, keyboard, ...this.options});
    }

    static inline(text: string, data: InlineEvent) {
        return new ReplyMarkup([[{text, callback_data: data}]]).json();
    }
}