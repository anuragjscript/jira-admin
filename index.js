import axios from "axios";
import jiraConfig from "./config.js";

// Jira credentials
const email = jiraConfig.jiraEmail;
const apiToken = jiraConfig.jiraApiToken;
const jiraDomain = jiraConfig.jiraDomain;

// Axios instance with basic authentication
const jiraApi = axios.create({
  baseURL: `${jiraDomain}/rest/api/3`,
  headers: {
    Authorization: `Basic ${Buffer.from(`${email}:${apiToken}`).toString(
      "base64"
    )}`,
    "Content-Type": "application/json",
  },
});

// Function to get the current user's account ID
async function getCurrentUserAccountId() {
  try {
    const response = await jiraApi.get("/myself");
    return response.data.accountId;
  } catch (error) {
    console.error(
      "Error fetching account ID:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
}

// Main function to find issues and reassign them to the current user
async function reassignIssuesToCurrentUser(projectKey) {
  const currentUserId = await getCurrentUserAccountId();
  if (!currentUserId) {
    console.log("Could not fetch current user account ID.");
    return;
  }

  const jql = `project = ${projectKey} AND assignee != ${currentUserId}`;

  // Search issues assigned to someone else
  try {
    const response = await jiraApi.get("/search", { params: { jql } });
    const issues = response.data.issues;

    if (issues.length === 0) {
      console.log("No issues found to update.");
      return;
    }

    // Reassign each issue to the current user
    for (const issue of issues) {
      const issueKey = issue.key;
      try {
        await jiraApi.put(`/issue/${issueKey}/assignee`, {
          accountId: currentUserId,
        });
        console.log(`Assignee updated for issue ${issueKey}`);
      } catch (error) {
        console.error(
          `Error updating issue ${issueKey}:`,
          error.response ? error.response.data : error.message
        );
      }
    }
  } catch (error) {
    console.error(
      "Error searching issues:",
      error.response ? error.response.data : error.message
    );
  }
}

// Run the reassignment process for the specified project
reassignIssuesToCurrentUser("CSM");
