require("dotenv").config();

const { App } = require("@slack/bolt");
const axios = require("axios");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

const kits = [
  "sword",
  "axe",
  "mace",
  "smp",
  "uhc",
  "nethpot",
  "pot",
  "crystal",
  "diamond_pot",
  "diapot",
  "vanilla",
  "spear"
];

const kitNames = {
  sword: "Sword",
  axe: "Axe",
  mace: "Mace",
  smp: "SMP",
  uhc: "UHC",
  nethpot: "NethPot",
  pot: "Pot",
  crystal: "Crystal",
  diamond_pot: "DiamondPot",
  diapot: "DiaPot",
  vanilla: "Vanilla",
  spear: "Spear"
};

const tierScore = {
  HT1: 100,
  LT1: 90,
  HT2: 80,
  LT2: 70,
  HT3: 60,
  LT3: 50,
  HT4: 40,
  LT4: 30,
  HT5: 20,
  LT5: 10
};

function normalizeTier(value) {
  if (!value) return "N/A";

  const text = String(value)
    .toUpperCase()
    .replace(/[_\-\s]+/g, "");

  if (text.includes("RETIRED")) {
    const retired = text.match(/(?:R)?(HT|LT)([1-5])/);
    if (retired) return `R${retired[1]}${retired[2]}`;
  }

  const normal = text.match(/(HT|LT)([1-5])/);
  if (normal) return `${normal[1]}${normal[2]}`;

  if (text.includes("HIGHTIER")) {
    const match = text.match(/HIGHTIER([1-5])/);
    if (match) return `HT${match[1]}`;
  }

  if (text.includes("LOWTIER")) {
    const match = text.match(/LOWTIER([1-5])/);
    if (match) return `LT${match[1]}`;
  }

  return "N/A";
}

function cleanKitName(value) {
  if (!value) return null;

  const key = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const map = {
    sword: "sword",
    axe: "axe",
    mace: "mace",
    smp: "smp",
    uhc: "uhc",
    nethpot: "nethpot",
    netheritepot: "nethpot",
    npot: "nethpot",
    pot: "pot",
    crystal: "crystal",
    cpvp: "crystal",
    diamondpot: "diamond_pot",
    diapot: "diapot",
    vanilla: "vanilla",
    spear: "spear"
  };

  return map[key] || key;
}

function findTierValue(obj) {
  if (!obj || typeof obj !== "object") return "N/A";

  const tier = obj.tier ?? obj.rank;
  const pos = obj.pos;

  if (tier === null || tier === undefined || pos === null || pos === undefined) {
    return "N/A";
  }

  const prefix = Number(pos) === 0 ? "HT" : "LT";
  return `${prefix}${tier}`;
}

function extractResults(data) {
  const result = {};
  for (const kit of kits) result[kit] = "N/A";

  const roots = [
    data,
    data?.data,
    data?.player,
    data?.profile,
    data?.rankings,
    data?.tiers,
    data?.results,
    data?.data?.rankings,
    data?.data?.tiers,
    data?.data?.results,
    data?.profile?.rankings,
    data?.profile?.tiers
  ].filter(Boolean);

  for (const root of roots) {
    if (Array.isArray(root)) {
      for (const item of root) {
        const kit =
          cleanKitName(item?.kit) ||
          cleanKitName(item?.gamemode) ||
          cleanKitName(item?.mode) ||
          cleanKitName(item?.category) ||
          cleanKitName(item?.queue);
        const tier = findTierValue(item);

        if (kit && tier !== "N/A") result[kit] = tier;
      }
    }

    if (root && typeof root === "object" && !Array.isArray(root)) {
      for (const [key, value] of Object.entries(root)) {
        const kit = cleanKitName(key);
        const tier = findTierValue(value);
        if (kit && tier !== "N/A") result[kit] = tier;
      }
    }
  }

  return result;
}

function getHighestTier(results) {
  let best = {
    kit: "N/A",
    tier: "N/A",
    score: -1
  };

  for (const [kit, tier] of Object.entries(results)) {
    const score = tierScore[tier] ?? -1;

    if (score > best.score) {
      best = {
        kit: kitNames[kit] || kit,
        tier,
        score
      };
    }
  }

  return best.score === -1 ? { kit: "N/A", tier: "N/A" } : best;
}

function pad(value, size) {
  return String(value).padEnd(size, " ");
}

function formatProfile(username, results) {
  const highest = getHighestTier(results);

  const visibleRows = Object.entries(results)
    .filter(([kit, tier]) => tier !== "N/A" || kits.includes(kit))
    .map(([kit, tier]) => ({
      kit: kitNames[kit] || kit,
      tier
    }));

  const lines = [];

  lines.push(`Server: McTiers`);
  lines.push(`Username: ${username}`);
  lines.push(`Highest Tier: ${highest.kit.toUpperCase()} | ${highest.tier}`);
  lines.push("");
  lines.push("Tiers:");
  lines.push(`${pad("KIT", 14)} | MCTIERS`);
  lines.push(`${"-".repeat(14)} | ${"-".repeat(7)}`);

  for (const row of visibleRows) {
    lines.push(`${pad(row.kit, 14)} | ${row.tier}`);
  }

  return "```" + lines.join("\n") + "```";
}

function formatPvpProfile(username, results) {
  const highest = getHighestTier(results);

  const visibleRows = Object.entries(results)
    .filter(([kit, tier]) => tier !== "N/A" || kits.includes(kit))
    .map(([kit, tier]) => ({
      kit: kitNames[kit] || kit,
      tier
    }));

  const lines = [];

  lines.push(`Server: PVPTiers`);
  lines.push(`Username: ${username}`);
  lines.push(`Highest Tier: ${highest.kit.toUpperCase()} | ${highest.tier}`);
  lines.push("");
  lines.push("Tiers:");
  lines.push(`${pad("KIT", 14)} | MCTIERS`);
  lines.push(`${"-".repeat(14)} | ${"-".repeat(7)}`);

  for (const row of visibleRows) {
    lines.push(`${pad(row.kit, 14)} | ${row.tier}`);
  }

  return "```" + lines.join("\n") + "```";
}

async function fetchMcTiers(username) {
  const url = `https://mctiers.com/api/v2/profile/by-name/${encodeURIComponent(username)}`;

  try {
    const res = await axios.get(url, {
      timeout: 10000,
      validateStatus: () => true,
      headers: {
        "User-Agent": "Mozilla/5.0 SlackMCTiersBot/1.0",
        Accept: "application/json"
      }
    });

    if (res.status === 404) {
      return {
        ok: false,
        message: `No MCTiers profile found for ${username}.`
      };
    }

    if (res.status >= 400) {
      return {
        ok: false,
        message: `MCTiers API error: HTTP ${res.status}`
      };
    }

    const results = extractResults(res.data);

    return {
      ok: true,
      username:
        res.data?.name ||
        res.data?.username ||
        res.data?.player?.name ||
        res.data?.profile?.name ||
        res.data?.data?.name ||
        username,
      results
    };
  } catch (err) {

    return {
      ok: false,
      message: `Request failed: ${err.message}`
    };
  }
}

function tierLabel(result) {
  if (!result || result.tier == null || result.pos == null) return null;

  const prefix = result.pos === 0 ? "HT" : "LT";
  return `${prefix}${result.tier}`;
}

function getHighestTierForProfile(results) {
  if (!results) return "Unknown";

  let best = null;

  for (const [mode, result] of Object.entries(results)) {
    const label = tierLabel(result);
    if (!label) continue;

    if (!best || tierScore(label) > tierScore(best.label)) {
      best = {
        mode,
        label
      };
    }
  }

  if (!best) return "Unknown";

  return `${best.label} (${best.mode})`;
}


async function fetchPVPtiers(username) {
  const url = `https://pvptiers.com/api/search_profile/${encodeURIComponent(username)}`;

  try {
    const res = await axios.get(url, {
      timeout: 10000,
      validateStatus: () => true,
      headers: {
        "User-Agent": "Mozilla/5.0 SlackMCTiersBot/1.0",
        Accept: "application/json"
      }
    });

    if (res.status === 404) {
      return {
        ok: false,
        message: `No PVPTiers profile found for ${username}.`
      };
    }

    if (res.status >= 400) {
      return {
        ok: false,
        message: `PVPTiers API error: HTTP ${res.status}`
      };
    }

    const results = extractResults(res.data);

    return {
      ok: true,
      username:
        res.data?.name ||
        res.data?.username ||
        res.data?.player?.name ||
        res.data?.profile?.name ||
        res.data?.data?.name ||
        username,
      results
    };
  } catch (err) {

    return {
      ok: false,
      message: `Request failed: ${err.message}`
    };
  }
}

async function fetchMinecraftProfile(username) {
  const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`);

  if (!res.ok) {
    return { ok: false, message: "Minecraft account not found." };
  }

  const data = await res.json();

  return {
    ok: true,
    username: data.name,
    uuid: data.id,
    dashedUuid: dashUuid(data.id),
    skinUrl: `https://crafatar.com/renders/body/${data.id}?overlay`
  };
}

function dashUuid(uuid) {
  return uuid.replace(
    /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
    "$1-$2-$3-$4-$5"
  );
}

async function fetchAccountCreationDate(username) {
  try {
    const res = await fetch(`https://api.ashcon.app/mojang/v2/user/${encodeURIComponent(username)}`);

    if (!res.ok) return null;

    const data = await res.json();

    if (!data.created_at) return null;

    return new Date(data.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return null;
  }
}


app.command("/pvptiers", async ({ command, ack, respond }) => {
  await ack();

  const username = command.text.trim();

  if (!username) {
    await respond("Usage: `/pvptiers <minecraft_username>`");
    return;
  }


  const profile2 = await fetchPVPtiers(username);

  if (!profile2.ok) {
    await respond(profile.message);
    return;
  }
  await respond(formatPvpProfile(profile2.username, profile2.results));
});

app.command("/mctiers", async ({ command, ack, respond }) => {
  await ack();

  const username = command.text.trim();

  if (!username) {
    await respond("Usage: `/mctiers <minecraft_username>`");
    return;
  }
  const profile = await fetchMcTiers(username);

  if (!profile.ok) {
    await respond(profile.message);
    return;
  }

  await respond(formatProfile(profile.username, profile.results));
});

function formatMinecraftInfo(player, createdAt, highestTier) {
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            `*Minecraft Profile*\n` +
            `*Username:* \`${player.username}\`\n` +
            `*UUID:* \`${player.dashedUuid}\`\n` +
            `*Created:* ${createdAt || "Unknown"}\n` +
            `*Highest Tier:* ${highestTier}`
        },
        accessory: {
          type: "image",
          image_url: player.skinUrl,
          alt_text: `${player.username} skin`
        }
      }
    ]
  };
}

app.command("/mc-profile", async ({ command, ack, respond }) => {
  await ack();

  const username = command.text.trim();

  if (!username) {
    await respond("Usage: `/mc-profile <minecraft_username>`");
    return;
  }

  const player = await fetchMinecraftProfile(username);

  if (!player.ok) {
    await respond(player.message);
    return;
  }

  const profile = await fetchMcTiers(player.username);
  const profile2 = await fetchPVPtiers(player.username);
  const createdAt = await fetchAccountCreationDate(player.username);

  if (!profile.ok) {
    await respond(profile.message);
    return;
  }

  const highestTier = getHighestTierForProfile(profile.results);

  await respond(formatMinecraftInfo(player, createdAt, highestTier));
  await respond(formatProfile(profile.username, profile.results));

  if (!profile2.ok) {
    await respond(profile.message);
    return;
  }
  await respond(formatPvpProfile(profile2.username, profile2.results));
});

(async () => {
  await app.start(Number(process.env.PORT) || 3000);
  console.log("Tier Slack bot running");
})();
