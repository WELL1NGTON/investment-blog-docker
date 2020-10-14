import { Request } from "express";

const extractJWTTokens = (req: Request) => {
  let accessToken = null;
  let refreshToken = null;
  if (req && req.cookies) {
    accessToken = <string>req.cookies["access-token"];
    refreshToken = <string>req.cookies["refresh-token"];
  }
  return { accessToken, refreshToken };
};

export { extractJWTTokens };
