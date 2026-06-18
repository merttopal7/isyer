import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
        borderRadius: "7px",
        gap: "3px",
        paddingTop: "2px",
      }}
    >
      {/* Dot — İ harfinin üzerindeki nokta */}
      <div
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: "white",
          flexShrink: 0,
        }}
      />
      {/* Stem */}
      <div
        style={{
          width: "5px",
          height: "13px",
          background: "white",
          borderRadius: "2px",
          flexShrink: 0,
        }}
      />
    </div>,
    { ...size }
  );
}
