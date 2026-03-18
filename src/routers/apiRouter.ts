import router from "express";

const authRouter = router();

authRouter.post("/login", (req, res) => {});
authRouter.post("/register", (req, res) => {});
authRouter.get("/refresh-token");
authRouter.post("/logout", (req, res) => {});

export default authRouter;
