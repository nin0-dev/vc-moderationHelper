/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 nin0dev
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {
    ApplicationCommandInputType,
    ApplicationCommandOptionType,
} from "@api/Commands";
import { Devs } from "@utils/constants";
import { getCurrentChannel, getCurrentGuild } from "@utils/discord";
import definePlugin from "@utils/types";
import { RestAPI } from "@webpack/common";

enum SpecialMessageActions {
    IGNORE = "__MODERATIONHELPER__IGNORE"
}

const VENCORD_SERVER_ID = "1015060230222131221";
const RULES_CHANNEL_ID = "1015074670963335219";

export default definePlugin({
    name: "ModerationHelper",
    description: "Helps you moderate the Vencord Server",
    authors: [Devs.nin0dev],
    commands: [{
        name: "rule",
        description: "Send a Vencord Server rule [ideally it should be valid]",
        inputType: ApplicationCommandInputType.BUILT_IN_TEXT,
        options: [{
            name: "number",
            description: "Rule number",
            required: true,
            type: ApplicationCommandOptionType.NUMBER
        }],
        predicate: ctx => {
            try {
                return (getCurrentGuild()?.id === VENCORD_SERVER_ID || getCurrentChannel()?.isDM()) || true;
            }
            catch {
                return true;
            }
        },
        execute: async (args, ctx) => {
            const ruleNumber = args[0].value;
            const rulesMessage = JSON.parse((await RestAPI.get({
                url: `/channels/${RULES_CHANNEL_ID}/messages`
            })).text)[0].content;

            const rule = rulesMessage
                .substring(
                    rulesMessage.indexOf(`${ruleNumber}. `),
                    rulesMessage.indexOf(`${parseInt(ruleNumber) + 1}. `) !== -1
                        ? rulesMessage.indexOf(`${parseInt(ruleNumber) + 1}. `)
                        : rulesMessage.length
                )
                .trim()
                .replace(`${ruleNumber}. `, "");
            if (!rule || rulesMessage.indexOf(`${ruleNumber}. `) === -1) return {
                content: SpecialMessageActions.IGNORE
            };

            return {
                content: `-# <#${RULES_CHANNEL_ID}>
            ### Rule ${ruleNumber}
            > ${rule.replace("\n", "\n> ")}`
            };
        }
    }]
});
