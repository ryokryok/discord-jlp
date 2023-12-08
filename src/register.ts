import { KOUSEI_COMMAND } from "./commands";

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;

if (!token) {
  throw new Error("The DISCORD_TOKEN environment variable is required.");
}
if (!applicationId) {
  throw new Error("The DISCORD_APPLICATION_ID environment variable is required.");
}

async function registerCommands() {
  const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${token}`,
    },
    method: "PUT",
    body: JSON.stringify([KOUSEI_COMMAND]),
  });

  if (response.ok) {
    console.log("Registered all commands");
  } else {
    console.error("Error registering commands");
    const text = await response.text();
    console.error(text);
  }
  return response;
}

async function resetAllCommands() {
  const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${token}`,
    },
    method: "PUT",
    body: JSON.stringify([]),
  });

  if (response.ok) {
    console.log("Deleted all commands");
  } else {
    console.error("Error deleting commands");
    const text = await response.text();
    console.error(text);
  }
}

async function registerGlobalCommands() {
  await registerCommands();
}

registerGlobalCommands();
