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
import definePlugin from "@utils/types";

import { RULES_CHANNEL_ID, SpecialMessageActions, VENCORD_SERVER_ID } from "./constants";
import { populateRules, rules } from "./rulesManagement";

export default definePlugin({
    name: "ModerationHelper",
    description: "Helps you moderate the Vencord Server",
    authors: [Devs.nin0dev],
    async start() {
        populateRules();
        setInterval(populateRules, 60 * 60 * 1000);
    },
    onBeforeMessageSend(_c, msg) {
        if (msg.content === SpecialMessageActions.IGNORE) {
            msg.content = "";
            return;
        }
    },
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
                return (ctx.guild?.id === VENCORD_SERVER_ID || ctx.channel.isDM()) || true;
            }
            catch {
                return true;
            }
        },
        execute: async (args, ctx) => {
            const ruleNumber = parseInt(args[0].value);
            if (Number.isNaN(ruleNumber)) return { content: SpecialMessageActions.IGNORE };
            const rule = rules.get(ruleNumber)!;
            if (!rule) return { content: SpecialMessageActions.IGNORE };

            return {
                content: `-# <#${RULES_CHANNEL_ID}>\n### Rule ${ruleNumber}\n> ${rule.raw.replace("\n", "\n> ")}`
            };
        }
    }]
});
