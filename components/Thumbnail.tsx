import React from "react";
import Image from "next/image";
import { cn, getFileIcon } from "@/lib/utils";

interface Props {
  file?: FileDocument;
  type?: string;
  extension?: string;
  url?: string;
  imageClassName?: string;
  className?: string;
}

export const Thumbnail = ({
  file,
  type,
  extension,
  url = "",
  imageClassName,
  className,
}: Props) => {
  // Use file props if provided, otherwise use individual props
  const fileType = file?.type || type || "";
  const fileExtension = file?.extension || extension || "";
  const fileUrl = file?.url || url || "";

  const isImage = fileType === "image" && fileExtension !== "svg";

  return (
    <figure className={cn("thumbnail", className)}>
      <Image
        src={isImage ? fileUrl : getFileIcon(fileExtension, fileType)}
        alt="thumbnail"
        width={100}
        height={100}
        className={cn(
          "size-8 object-contain",
          imageClassName,
          isImage && "thumbnail-image",
        )}
      />
    </figure>
  );
};
export default Thumbnail;
