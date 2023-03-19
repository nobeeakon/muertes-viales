import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "@remix-run/react";
import type { NoteUrl } from "@prisma/client";

type NoMoreToAnnotateProps = {
  totalNotesCount: number;
};

const NoMoreToAnnotate = ({ totalNotesCount }: NoMoreToAnnotateProps) => (
  <div>
    <p>
      No hay más notas por anotar.{" "}
      <Link to="/annotate" className="underline decoration-sky-500">
        Regresar{" "}
      </Link>
    </p>
    <p>{totalNotesCount} Anotadas </p>
  </div>
);

type Props = {
  /** Property to annotate */
  title: string;
  /** Note urls */
  noteUrls: NoteUrl[];
  /** form */
  children: ReactNode;
};

const Annotate = ({ title, noteUrls, children }: Props) => {
  const [urlIndex, setUrlIndex] = useState(0);

  return (
    <div className="h-full">
      <h3>{title}</h3>
      <fieldset>
        <legend className="float-left mr-2">Notas:</legend>
        {noteUrls.map(({ url: urlItem }, index) => (
          <label key={urlItem} className="mr-2">
            <input
              name="urls"
              type="radio"
              value={index}
              onChange={(event) => setUrlIndex(parseInt(event.target.value))}
              checked={urlIndex === index}
            />
            {new URL(urlItem).host}
          </label>
        ))}
      </fieldset>
      <div>
        Si la nota no se ve:{" "}
        <a
          href={noteUrls[urlIndex].url}
          rel="noreferrer"
          target="_blank"
          className="underline decoration-sky-500"
        >
          Ve la nota en la página
        </a>
      </div>
      <div>{children}</div>
      <div className="h-full">
        {noteUrls.map((noteUrlItem, noteUrlIndex) => (
          <iframe
            key={noteUrlItem.id}
            sandbox="true"
            width="100%"
            height="100%"
            title={`noticia-${noteUrlIndex}`}
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
