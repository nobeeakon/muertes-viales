import { useState } from "react";
import { Form } from "@remix-run/react";
import { commentFieldNames } from "~/routes/notes/comment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFloppyDisk,
  faPen,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  noteId: string;
  noteObservations?: string;
};

function NoteObservations({ noteId, noteObservations }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [observations, setObservations] = useState(noteObservations ?? "");

  if (!showForm)
    return (
      <div className="mt-2">
        <span>Observaciones: </span>
        {observations ? observations : "Ninguna"}
        <button
          onClick={() => setShowForm(true)}
          title="Editar observaciones"
          className="ml-2  rounded-full border border-blue-500 py-1 px-3 text-gray-500 hover:bg-blue-600 hover:text-white focus:bg-blue-400"
        >
          <FontAwesomeIcon icon={faPen} className="blue-500" />
        </button>
      </div>
    );

  return (
    <Form
      replace
      method="post"
      action="/notes/comment"
      className="mt-2 flex flex-wrap items-baseline gap-2"
    >
      <label htmlFor="note-observations">Observaciones: </label>
      <div className="flex flex-1">
        <input
          id="note-observations"
          name={commentFieldNames.noteObservations}
          value={observations}
          onChange={(event) => setObservations(event.target.value)}
          className="flex-1 rounded border border-gray-500 px-1 py-1"
        />
        <input
          value={noteId}
          name={commentFieldNames.noteId}
          type="hidden"
          required
        />

        <button
          type="submit"
          title="Guardar"
          className="ml-2  rounded-full border border-blue-500 py-1 px-3 text-blue-500 hover:bg-blue-600 hover:text-white focus:bg-blue-400"
        >
          <FontAwesomeIcon icon={faFloppyDisk} />
        </button>
        <button
          onClick={() => setShowForm(false)}
          type="button"
          title="Cerrar"
          className="ml-2  rounded-full border border-blue-500 py-1 px-3 text-gray-500 hover:bg-blue-600 hover:text-white focus:bg-blue-400"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>
    </Form>
  );
}

export default NoteObservations;
