require("dotenv").config();

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");

describe("Enrollment Authentication", () => {
  test("POST /api/enrollments should reject requests without JWT", async () => {
    const response = await request(app).post("/api/enrollments").send({
      course: "6ad45ced6bf94286af8f7e9c",
    });

    expect(response.statusCode).toBe(401);

    expect(response.body.status).toBe("fail");
  });

  test("POST /api/enrollments should reject invalid JWT", async () => {
    const response = await request(app)
      .post("/api/enrollments")
      .set("Authorization", "Bearer invalid-token")
      .send({
        course: "6ad45ced6bf94286af8f7e9c",
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe("fail");
  });

  test("ADMIN should not create enrollment", async () => {
    const adminToken = jwt.sign(
      {
        userId: "507f1f77bcf86cd799439011",
        role: "ADMIN",
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" },
    );

    const response = await request(app)
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        course: "6ad45ced6bf94286af8f7e9c",
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.status).toBe("fail");
  });
});
