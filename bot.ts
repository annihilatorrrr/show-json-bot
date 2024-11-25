import { Bot, GrammyError, HttpError, session } from "./deps.ts";
import { Context } from "./helpers/context.ts";
import { initial, storage } from "./helpers/session.ts";
import { handlers } from "./handlers/mod.ts";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN");
if (BOT_TOKEN == null) {
    throw new Error("Missing environment variable: BOT_TOKEN");
}

export const bot = new Bot<Context>(BOT_TOKEN);

bot.use(session({ initial, storage }));

bot.api.config.use((prev, method, payload) =>
    prev(method, {
        ...payload,
        parse_mode: "HTML",
        disable_web_page_preview: true,
    })
);

bot.use(handlers);

bot.catch(({ ctx, error }) => {
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    if (error instanceof GrammyError) {
        console.error("Error in request:", error.description);
    } else if (error instanceof HttpError) {
        console.error("Could not contact Telegram:");
    } else {
        console.error("Unknown error:");
    }
    console.log(error);
});
