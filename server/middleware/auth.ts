import { NextFunction, Request, Response } from "express";
import RefreshToken from "../models/refreshToken.model";
import { extractJWTTokens } from "../util/cookieExtractor";
import {
  generateAccessToken,
  decodeAccessToken,
  decodeRefreshToken,
} from "../util/jwtTokens";

async function refreshAccessToken(refreshToken: string) {
  const decoded = decodeRefreshToken(refreshToken);
  if (!decoded) return { newAccessToken: null, decoded: null };
  const docRefreshToken = await RefreshToken.findOne({
    token: refreshToken,
  }).exec();
  if (!docRefreshToken) return { newAccessToken: null, decoded: null };
  let newAccessToken = null;
  if (decoded.id === docRefreshToken.user_id)
    newAccessToken = generateAccessToken(decoded);
  return { newAccessToken, decoded };
}

export async function auth(req: Request, res: Response, next: NextFunction) {
  const { accessToken, refreshToken } = extractJWTTokens(req);

  // Check for token
  if (!accessToken || !refreshToken)
    return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    // Verify token
    const decoded = decodeAccessToken(accessToken);

    // Add user from payload
    req.body.user = decoded;
    req.cookies["access-token"] = accessToken;
    req.cookies["refresh-token"] = refreshToken;
    next();
  } catch (e) {
    if (!refreshToken) {
      return res
        .status(400)
        .clearCookie("refresh-token")
        .clearCookie("access-token")
        .json({ msg: "Token is not valid" });
    }
    const { newAccessToken, decoded } = await refreshAccessToken(refreshToken);
    if (!newAccessToken || !decoded) {
      RefreshToken.findOneAndDelete({ token: refreshToken }).exec();
      return res
        .status(400)
        .clearCookie("refresh-token")
        .clearCookie("access-token")
        .json({ msg: "Refresh token is not valid" });
    }
    req.body.user = decoded;
    req.cookies["access-token"] = newAccessToken;
    req.cookies["refresh-token"] = refreshToken;
    res.cookie("access-token", newAccessToken, { httpOnly: true });
    next();
  }
}
