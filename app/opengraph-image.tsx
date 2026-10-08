import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          backgroundColor: "#ff6f7d",
          color: "#111114",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, display: "flex" }}>
          squish.to
        </div>
        <div
          style={{
            fontSize: 36,
            marginTop: 24,
            color: "#3a1a1e",
            display: "flex",
          }}
        >
          Make your links as small as possible.
        </div>
      </div>
    ),
    { ...size },
  );
}
