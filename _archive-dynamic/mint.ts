import "dotenv/config";
import { SignJWT } from "jose";
const s = new TextEncoder().encode(process.env.AUTH_SECRET!);
new SignJWT({ sub: process.env.ADMIN_EMAIL! })
  .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("1h")
  .sign(s).then(t => console.log(t));
