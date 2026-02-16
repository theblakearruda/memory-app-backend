import express from "express";

export const authRouter = express.Router();

type User = {
  id: number;
  username: string;
  password: string;
};

const users: User[] = [];
let nextId = 1;

authRouter.get("/test", (_req, res) => {
  res.json({ message: "auth route working" });
});

authRouter.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "username and password required" });
  }

  const existing = users.find(u => u.username === username);

  if (existing) {
    return res.status(400).json({ error: "user already exists" });
  }

  const newUser: User = {
    id: nextId++,
    username,
    password
  };

  users.push(newUser);

  res.json({
    message: "user registered",
    user: {
      id: newUser.id,
      username: newUser.username
    }
  });
});

authRouter.get("/users", (_req, res) => {
  res.json(users.map(u => ({
    id: u.id,
    username: u.username
  })));
});
authRouter.get("/create-test-user", (_req, res) => {
  const newUser = {
    id: nextId++,
    username: "charlie",
    password: "1234"
  };

  users.push(newUser);

  res.json({
    message: "test user created",
    user: newUser
  });
});