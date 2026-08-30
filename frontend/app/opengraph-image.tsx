import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const alt = "Modeq - consensus-verified content moderation on GenLayer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  const logoBuffer = readFileSync(join(process.cwd(), "app", "icon.png"));
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  const fontData = readFileSync(join(process.cwd(), "app", "fonts", "GeneralSans-Bold.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#050608",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(60% 60% at 50% 40%, rgba(15,124,236,0.16), transparent 70%)",
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={200} height={200} alt="" />
        <div
          style={{
            marginTop: 40,
            fontSize: 72,
            fontFamily: "GeneralSans",
            color: "#ffffff",
            letterSpacing: "-0.02em",
            display: "flex",
          }}
        >
          Modeq
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 30,
            color: "#9aa0ad",
            display: "flex",
          }}
        >
          Consensus-verified content moderation on GenLayer
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "GeneralSans", data: fontData, weight: 700, style: "normal" }],
    }
  );
}
