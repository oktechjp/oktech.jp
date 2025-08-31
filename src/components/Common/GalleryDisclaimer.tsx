import { LuInfo } from "react-icons/lu";

import BigTooltip from "@/components/Common/BigTooltip";

export default function GalleryDisclaimer({ position = "top" }: { position?: "top" | "bottom" }) {
  return (
    <BigTooltip
      position={position}
      content={
        <div className="bg-base-100 rounded-box max-w-md p-6 text-left shadow-lg">
          <ul className="text-base-content list-inside list-disc space-y-3 text-sm">
            <li>
              All photos here have been taken by community members and sent in either through our{" "}
              <a
                href="https://discord.com/channels/1034792577293094972/1077517983439654962"
                className="link link-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                #event-photos
              </a>{" "}
              channel on discord or through the Meetup page.
            </li>
            <li>
              All photos are published under the{" "}
              <a
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                className="link link-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Creative Commons BY-NC-SA license
              </a>
              .
            </li>
            <li>
              If you want a photo of you removed from the page, or if you have any other issues with
              a photo on this page, please let us know through →{" "}
              <a
                href="https://github.com/oktechjp/public/issues/new"
                className="link link-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                a new GitHub issue
              </a>
              .
            </li>
            <li>
              If you use any photo of this page, we request you to follow the github repository and
              also remove any photo if a member is uncomfortable with it.
            </li>
          </ul>
        </div>
      }
    >
      <button className="btn btn-circle btn-ghost" aria-label="Gallery information">
        <LuInfo className="h-4 w-4" />
      </button>
    </BigTooltip>
  );
}
