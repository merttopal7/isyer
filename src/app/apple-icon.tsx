import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "40px",
        gap: "14px",
        paddingTop: "10px",
      }}
    >
      {/* Dot */}
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "white",
          flexShrink: 0,
        }}
      />
      {/* Stem */}
      <div
        style={{
          width: "28px",
          height: "72px",
          background: "white",
          borderRadius: "10px",
          flexShrink: 0,
        }}
      />
    </div>,
    { ...size }
  );
}
