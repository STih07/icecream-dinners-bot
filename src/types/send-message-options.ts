import { id } from "./id";

export interface SendMessageOptions {
    parse_mode?: 'Markdown' | 'HTML';
    disable_web_page_preview?: boolean;
    disable_notification?: boolean;
    reply_to_message_id?: id;
    // reply_markup?: {text: string, callback_data: string};
    reply_markup?: any;
}