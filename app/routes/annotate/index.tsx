export default function NoteIndexPage() {
  return (
    <div>
      <p>
        Esta es la bienvenida del proyecto. Aqui van las instrucciones e
        importancia de hacer anotaciones
      </p>
      <a href={`/data`} target="_blank" download rel="noreferrer">
        Descargar los datos
      </a>
    </div>
  );
}
