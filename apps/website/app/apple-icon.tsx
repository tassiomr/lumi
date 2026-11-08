import { ImageResponse } from "next/og";
import { lumiMarkDataUri } from "@/lib/brand-image";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default async function AppleIcon() {
  const src = await lumiMarkDataUri();
  return new ImageResponse(
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} width={180} height={180} alt="" style={{ transform: "scale(1.27)" }} />,
    size,
  );
}
