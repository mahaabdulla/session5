
require("dotenv").config();

const BASE_URL = "http://localhost:3000";

const TOKEN = process.env.TEST_USER_TOKEN;
const COURSE_ID = "6ad45ced6bf94286af8f7e9c";

const createEnrollment = async () => {
  const response = await fetch(`${BASE_URL}/api/enrollments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      course: COURSE_ID,
    }),
  });

  return {
    status: response.status,
    data: await response.json(),
  };
};

const testConcurrency = async () => {
  if (!TOKEN) {
    throw new Error("TEST_USER_TOKEN is required");
  }

  const results = await Promise.all([
    createEnrollment(),
    createEnrollment(),
  ]);

  console.log("Concurrency Test Results:");
  console.log(JSON.stringify(results, null, 2));

  const statuses = results.map((result) => result.status).sort();

  if (JSON.stringify(statuses) === JSON.stringify([201, 409])) {
    console.log("PASS: One enrollment created, duplicate rejected");
  } else {
    console.log("FAIL: Unexpected response statuses");
  }
};

testConcurrency().catch((error) => {
  console.error("Test failed:", error.message);
  process.exitCode = 1;
});
