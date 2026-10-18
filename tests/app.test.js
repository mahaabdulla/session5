
const request = require("supertest");
const app = require("../app");

describe("App Health Check", () => {
  test("GET / should return 200 OK", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("API is running 🚀");
  });
});
