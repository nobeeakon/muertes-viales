import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "@remix-run/react";
import type { NoteUrl } from "@prisma/client";

import { blockedHosts } from "~/utils/constants";
import NoteObservations from "~/components/NoteObservations";

const NoMoreToAnnotate = () => (
  <div>
    <p>
      No hay más notas por anotar.{" "}
      <Link to="/annotate" className="underline decoration-sky-500">
        Regresar{" "}
      </Link>
    </p>
  </div>
);

type Props = {
  /** Property to annotate */
  title: string;
  /** Note urls */
  noteUrls: NoteUrl[];
  /** Note id */
  noteId: string;
  /** Note observations or comments */
  noteObservations?: string;
  /** form */
  children: ReactNode;
};

const Annotate = ({
  noteId,
  title,
  noteUrls,
  noteObservations,
  children,
}: Props) => {
  const [urlIndex, setUrlIndex] = useState(0);
  const [loadedIFrames, setLoadedIFrames] = useState<number[]>([]);

  const getHostName = (url: string) => {
    const host = new URL(url).host;
    return host.replace("www.", "");
  };

  const isCurrentUrlPossiblyBlocked = blockedHosts.includes(
    getHostName(noteUrls[urlIndex].url)
  );

  return (
    <div className="h-full">
      <div className="border-b-1 mb-2 border-solid">
        <h3 className="text-center text-lg font-bold">{title}</h3>
        <div className="mb-2 flex flex-wrap justify-between">
          <fieldset>
            <legend className="float-left mr-2">Notas:</legend>
            {noteUrls.map(({ url: urlItem }, index) => (
              <label key={urlItem} className="mr-2">
                <input
                  name="urls"
                  type="radio"
                  value={index}
                  onChange={(event) =>
                    setUrlIndex(parseInt(event.target.value))
                  }
                  checked={urlIndex === index}
                />
                {getHostName(urlItem)}
              </label>
            ))}
          </fieldset>
          <div className="flex gap-2">
            ¿No se ve la nota?:{" "}
            <a
              href={noteUrls[urlIndex].url}
              rel="noreferrer"
              target="_blank"
              className="underline decoration-sky-500"
            >
              Ve la nota en la página
            </a>
            {isCurrentUrlPossiblyBlocked && (
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500"></span>
              </span>
            )}
          </div>
        </div>

        <div>{children}</div>
        <div>
          <NoteObservations
            noteId={noteId}
            noteObservations={noteObservations}
          />
        </div>
      </div>
      <div className="h-full">
        {noteUrls.map((noteUrlItem, noteUrlIndex) => (
          <iframe
            key={noteUrlItem.id}
            sandbox="true"
            width="100%"
            height="100%"
            className={
              loadedIFrames.includes(noteUrlIndex)
                ? ""
                : "animate-pulse bg-slate-200"
            }
            title={`noticia-${noteUrlIndex}`}
            onLoad={() => setLoadedIFrames((prev) => [...prev, noteUrlIndex])}
            src={noteUrlItem.url}
            style={
              noteUrlIndex === urlIndex
                ? {}
                : {
                    position: "relative",
                    width: "1px",
                    height: "1px",
                    left: "-1000%",
                  }
            } // move the iframe so is not visible yet it loads the iframe
          ></iframe>
        ))}
      </div>
    </div>
  );
};

export { NoMoreToAnnotate };
export default Annotate;
