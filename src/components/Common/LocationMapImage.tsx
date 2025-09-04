import { LuMapPin } from "react-icons/lu";

import type { ResponsiveImageData } from "@/utils/responsiveImage";

interface Props {
  mapImage?: ResponsiveImageData;
  mapDarkImage?: ResponsiveImageData;
  marker?: boolean | string;
  className?: string;
  class?: string;
}

export default function LocationMapImage({ mapImage, mapDarkImage, marker, className }: Props) {
  return (
    <figure className={`relative h-full w-full ${className}`}>
      {mapImage || mapDarkImage ? (
        <>
          {/* Light mode map */}
          {mapImage && (
            <img
              src={mapImage.src}
              srcSet={mapImage.srcSet}
              sizes={mapImage.sizes}
              alt="Venue location map"
              loading="eager"
              fetchPriority="high"
              className="h-full w-full scale-105 object-cover transition-transform duration-300 group-hover:scale-110 dark:hidden"
              width={1024}
              height={1024}
            />
          )}
          {/* Dark mode map */}
          {mapDarkImage && (
            <img
              src={mapDarkImage.src}
              srcSet={mapDarkImage.srcSet}
              sizes={mapDarkImage.sizes}
              alt="Venue location map"
              loading="eager"
              fetchPriority="high"
              className="hidden h-full w-full scale-105 object-cover transition-transform duration-300 group-hover:scale-110 dark:block"
              width={1024}
              height={1024}
            />
          )}
        </>
      ) : (
        <div className="from-primary/20 to-secondary/20 flex h-full min-h-[200px] w-full items-center justify-center bg-gradient-to-br">
          <LuMapPin className="text-base-content/20 h-16 w-16" />
        </div>
      )}
      {marker && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {typeof marker === "string" && (
              <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform">
                <div className="bg-base-100/90 rounded-box max-w-[200px] px-3 py-1 shadow-md">
                  <span className="text-base-content block truncate text-base font-medium">
                    {marker}
                  </span>
                </div>
              </div>
            )}
            <div className="text-primary-dark bg-base-100/70 rounded-field p-2">
              <LuMapPin className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}
    </figure>
  );
}
