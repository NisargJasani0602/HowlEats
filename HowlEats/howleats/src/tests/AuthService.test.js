/* eslint-env jest, node */
import axios from "axios";

// IMPORTANT: mock axios before importing the module under test
jest.mock("axios");

const OLD_ENV = process.env;

describe("authService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...OLD_ENV };
    // Simulate Vite-style env exposure if your build injects it at compile time.
    // For tests, we can just set import.meta.env via a shim:
    global.importMeta = { env: { VITE_API_URL: "http://localhost:8080/api" } };
    // If your test runner doesn't support import.meta, we’ll fall back to default in code.
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test("registerUser posts to /register and returns the response", async () => {
    const mockResponse = { status: 201, data: { id: "u1" } };
    axios.post.mockResolvedValueOnce(mockResponse);

    const { registerUser } = await import("../service/authService.js"); // dynamic import after mock
    const body = { name: "Nisarg", email: "wolf@ncsu.edu", password: "Secr3t!" };

    const res = await registerUser(body);

    expect(axios.post).toHaveBeenCalledWith("http://localhost:8080/api/register", body);
    expect(res).toBe(mockResponse); // if you switch to response.data, update this assertion
  });

  test("loginUser posts to /login and returns the response", async () => {
    const mockResponse = { status: 200, data: { token: "jwt-abc" } };
    axios.post.mockResolvedValueOnce(mockResponse);

    const { loginUser } = await import("../service/authService.js");
    const body = { email: "wolf@ncsu.edu", password: "Secr3t!" };

    const res = await loginUser(body);

    expect(axios.post).toHaveBeenCalledWith("http://localhost:8080/api/login", body);
    expect(res).toBe(mockResponse);
  });

  test("propagates axios errors (register)", async () => {
    const err = Object.assign(new Error("bad request"), { response: { status: 400 } });
    axios.post.mockRejectedValueOnce(err);

    const { registerUser } = await import("../service/authService.js");

    await expect(registerUser({})).rejects.toThrow("bad request");
  });

  test("propagates axios errors (login)", async () => {
    const err = Object.assign(new Error("unauthorized"), { response: { status: 401 } });
    axios.post.mockRejectedValueOnce(err);

    const { loginUser } = await import("../service/authService.js");

    await expect(loginUser({})).rejects.toThrow("unauthorized");
  });
});
