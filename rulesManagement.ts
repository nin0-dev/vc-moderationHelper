/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ChannelStore, GuildStore, RestAPI } from "@webpack/common";

import { RULES_CHANNEL_ID, VENCORD_SERVER_ID } from "./constants";

export const rules: Map<number, {
    raw: string;
    readable: string;
}> = new Map();

export async function populateRules() {
    const rulesMessage = JSON.parse((await RestAPI.get({
        url: `/channels/${RULES_CHANNEL_ID}/messages`
    })).text)[0].content;

    let i = 0;
    const rulesMessagesLines: string[] = rulesMessage.split("\n");
    let hasEncounteredRuleYet = false;
    for (const line of rulesMessagesLines) {
        const loopi = i;
        i++;

        if (line === "") {
            rulesMessagesLines[loopi] = "";
            continue;
        }
        const isLineRuleStart = !Number.isNaN(parseInt(line.split(".")[0]));
        if (!hasEncounteredRuleYet && !isLineRuleStart) {
            rulesMessagesLines[loopi] = "";
            continue;
        }

        hasEncounteredRuleYet = true;
    }

    let workingRule = "";
    let currentRule = 0;
    const dumpRule = () => {
        rules.set(currentRule + 1, (() => {
            const a = workingRule.trim().split(/[0-9]\. /);
            return {
                raw: a.slice(1, a.length).join(""),
                readable: (() => {
                    return a
                        .slice(1, a.length).join("").replace(/<(@&|#)(\d+)>/g, (substring, type, id) => {
                            return type === "#" ? `#${ChannelStore.getChannel(id).name}` : `@${GuildStore.getRole(VENCORD_SERVER_ID, id).name}`;
                        });
                })()
            };
        })());
        workingRule = "";
        currentRule++;
    };
    for (const line of rulesMessagesLines.filter(l => l !== "")) {
        const isLineRuleStart = !Number.isNaN(parseInt(line.split(".")[0]));
        if (isLineRuleStart && workingRule !== "") dumpRule();
        workingRule += `${line}\n`;
    }
    dumpRule();

    return rules;
}
