<p align="center">
  <img width="512" height="96" alt="PvPTiers Banner" src="https://github.com/user-attachments/assets/561fce75-564b-44cf-be64-0e78d3ecc158" />
</p>

<h1 align="center">
  <img width="24" height="24" alt="MCTiers Icon" src="https://github.com/user-attachments/assets/bdbd40cd-f8cd-4213-b863-86260a361134" />
  MCTiers / PvPTiers Slack Bot <img width="24" height="24" alt="PvPTiersLogo" src="https://github.com/user-attachments/assets/923ffb15-cf65-4fbf-a186-10d450306238" />
</h1>

<p align="center">
  A simple Slack bot that lets users look up Minecraft PvP tier data directly from Slack.
</p>

<p align="center">
  <b>/pvptiers &lt;username&gt;</b>
</p>

---

## Overview

My **MCTiers Bot** connects to the MCTiers / PvPTiers API and lets users quickly check a Minecraft player’s PvP tier results from previous matches. Instead of opening a website, searching manually, or switching tabs, users can run one command inside Slack:

```bash
/pvptiers <username>
```

The bot will fetch the player’s PvP profile and return their tier information.

---

## Commands

```bash
/pvptiers <username>
```

Example:

```bash
/pvptiers ItzRealMe
```

---

## Hosting Instructions

### 1. Install Node.js

Make sure Node.js is installed on your system

You can check by running:

```bash
node -v
npm -v
```

---

### 2. Download the Bot Files

Download or clone this repository:

```bash
git clone https://github.com/Hamidcc/slackbot.git
cd slackbot
```

Or manually download:

```text
index.js
example env
```

---

### 3. Create a Slack Bot

Create a new Slack app from the Slack API dashboard.

You will need:

```text
SLACK_BOT_TOKEN
SLACK_SIGNING_SECRET
SLACK_APP_TOKEN
```

Copy your credentials into a new `.env` file.

---

### 4. Create Your `.env` File

Create a file named:

```bash
.env
```

Copy the contents from `example env`, then fill in your own Slack credentials.

Example:

```env
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token
```

---

### 5. Install Dependencies

Run:

```bash
npm install axios dotenv @slack/bolt
```

---

### 6. Start the Bot

Run:

```bash
node index.js
```

If everything is configured correctly, the bot should start and listen for Slack commands.

---

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Hamidcc/slackbot)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Hamidcc/slackbot)
[![Run on Replit](https://replit.com/badge/github/Hamidcc/slackbot)](https://replit.com/github/Hamidcc/slackbot)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Hamidcc/slackbot)
[![Open in CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/s/github/Hamidcc/slackbot)
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Hamidcc/slackbot)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/Hamidcc/slackbot)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Hamidcc/slackbot)
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/Hamidcc/slackbot)

---

## Repository

```text
https://github.com/Hamidcc/slackbot
```
