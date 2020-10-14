import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRATION_TIME = "15M";
const REFRESH_TOKEN_EXPIRATION_TIME = "7D";

export interface IUserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

const generateAccessToken = (user: IUserInfo): string | null => {
  let accessTokenSecret = process.env["ACCESS_TOKEN_SECRET"];
  if (!accessTokenSecret) return null;
  return jwt.sign({ user }, accessTokenSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
  });
};

const generateRefreshToken = (user: IUserInfo): string | null => {
  let refreshTokenSecret = process.env["REFRESH_TOKEN_SECRET"];
  if (!refreshTokenSecret) return null;
  return jwt.sign({ user }, refreshTokenSecret, {
    expiresIn: REFRESH_TOKEN_EXPIRATION_TIME,
  });
};

const decodeAccessToken = (accessToken: string): IUserInfo | null => {
  let accessTokenSecret = process.env["ACCESS_TOKEN_SECRET"];
  if (!accessTokenSecret) return null;
  try {
    const decoded = <{ user: IUserInfo }>(
      jwt.verify(accessToken, accessTokenSecret)
    );
    if (typeof decoded === "string" || !decoded.user) return null;
    const user = <IUserInfo>decoded.user;
    return user;
  } catch (err) {
    return null;
  }
};

const decodeRefreshToken = (refreshToken: string): IUserInfo | null => {
  let refreshTokenSecret = process.env["REFRESH_TOKEN_SECRET"];
  if (!refreshTokenSecret) return null;
  try {
    const decoded = <{ user: IUserInfo }>(
      jwt.verify(refreshToken, refreshTokenSecret)
    );
    if (typeof decoded === "string" || !decoded.user) return null;
    const user = <IUserInfo>decoded.user;
    return user;
  } catch (err) {
    return null;
  }
};

export { generateAccessToken };
export { generateRefreshToken };
export { decodeAccessToken };
export { decodeRefreshToken };
