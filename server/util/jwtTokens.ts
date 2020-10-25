import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRATION_TIME = "15M";
const REFRESH_TOKEN_EXPIRATION_TIME = "7D";
const RESET_PASSWORD_TOKEN_EXPIRATION_TIME = "15M";

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

const generateResetPasswordToken = (email: string): string | null => {
  let resetPasswordToken = process.env["RESET_PASSWORD_SECRET"];
  if (!resetPasswordToken) return null;
  return jwt.sign({ email }, resetPasswordToken, {
    expiresIn: RESET_PASSWORD_TOKEN_EXPIRATION_TIME,
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

const decodeResetPasswordToken = (refreshToken: string): string | null => {
  let resetPasswordTokenSecret = process.env["RESET_PASSWORD_SECRET"];
  if (!resetPasswordTokenSecret) return null;
  try {
    const decoded = <{ email: string }>(
      jwt.verify(refreshToken, resetPasswordTokenSecret)
    );
    if (typeof decoded === "string" || !decoded.email) return null;
    const email = <string>decoded.email;
    return email;
  } catch (err) {
    return null;
  }
};

export { generateAccessToken };
export { generateRefreshToken };
export { generateResetPasswordToken };
export { decodeAccessToken };
export { decodeRefreshToken };
export { decodeResetPasswordToken };
