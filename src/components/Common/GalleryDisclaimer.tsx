import { useRef } from "react";

import { LuInfo, LuX } from "react-icons/lu";

export default function GalleryDisclaimer() {
  const modalRef = useRef<HTMLDialogElement>(null);

  const openModal = () => modalRef.current?.showModal();
  const closeModal = () => modalRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="btn btn-outline btn-sm gap-2"
        aria-haspopup="dialog"
        aria-controls="gallery-disclaimer-modal"
      >
        <LuInfo className="h-4 w-4" />
        Notice
      </button>

      <dialog
        ref={modalRef}
        id="gallery-disclaimer-modal"
        className="modal"
        aria-labelledby="gallery-disclaimer-title"
      >
        <div className="modal-box bg-base-0 text-base-content max-w-xl text-left">
          <button
            onClick={closeModal}
            className="btn btn-circle btn-ghost btn-sm absolute top-4 right-4"
            aria-label="Close disclaimer"
            type="button"
          >
            <LuX className="h-5 w-5" />
          </button>
          <div className="flex flex-col gap-6">
            <h3 id="gallery-disclaimer-title" className="text-xl font-semibold">
              Gallery Notice
            </h3>
            <ul className="list-inside list-disc space-y-3 text-sm">
              <li>
                All photos here have been taken by community members and sent in either through our{" "}
                <a
                  href="https://discord.com/channels/1034792577293094972/1077517983439654962"
                  className="link"
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
                  className="link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Creative Commons BY-NC-SA license
                </a>
                .
              </li>
              <li>
                If you want a photo of you removed from the page, or if you have any other issues
                with a photo on this page, please let us know through →{" "}
                <a
                  href="https://github.com/oktechjp/public/issues/new"
                  className="link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  a new GitHub issue
                </a>
                .
              </li>
              <li>
                If you use any photo of this page, we request you to follow the github repository
                and also remove any photo if a member is uncomfortable with it.
              </li>
            </ul>
          </div>

          <div className="modal-action">
            <button onClick={closeModal} className="btn btn-outline btn-lg" type="button">
              Close
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={closeModal}>
          <button type="button" aria-label="Close disclaimer">
            close
          </button>
        </form>
      </dialog>
    </>
  );
}
