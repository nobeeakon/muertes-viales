import type { ReactNode } from "react";
import { Link, Form, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import { useOptionalUser } from "~/utils";
import { GithubIcon, Twitter } from "~/components/icons";
import { getContributors } from "~/models/annotations.server";
import Biker from "~/assets/biker.png";
import GirlInComputer from "~/assets/girlInComputer.png";
import NUMV from "~/assets/NUMV.png";

export async function loader({ request }: LoaderArgs) {
  const contributors = await getContributors();

  const displayUsernames = contributors.map(
    (usernameItem) => usernameItem || "Anónimo"
  );

  return json({ userNames: displayUsernames });
}

export default function Index() {
  const user = useOptionalUser();
  const { userNames } = useLoaderData<typeof loader>();

  const navigation = [
    {
      displayName: "Proyecto",
      url: `https://niunamuertevial.mx/`,
    },
  ];

  const FAQS = [
    {
      question: "¿Por qué surge este proyecto?",
      answer: `En noviembre de 2018 un camión de transporte público atropelló y mató en Puebla a Manu, activista y servidor público de movilidad. Al día siguiente, nació este proyecto. Decidimos que para honrar la memoria de todas las víctimas de siniestros de tránsito, nos abocaríamos a reconocer y visibilizar a los peatones y ciclistas atropellados en el país.`,
    },
    {
      question: "¿Qué impacto ha tenido?",
      answer: ``,
    },
    {
      question: "¿Puedo reutilizar los datos?",
      answer: `Sí, por favor. Los datos son abiertos, lo que pedimos es que se de el reconocimiento al proyecto y nos ayudes a difundirlo.`,
    },
  ];

  return (
    <main>
      <div className="w-full">
        <nav className="container relative mx-auto flex flex-wrap items-center justify-between p-8 lg:justify-between xl:px-0">
          <>
            <div className="flex w-full flex-wrap items-center justify-between lg:w-auto">
              <Link to="/">
                <span className="flex items-center space-x-2 text-2xl font-medium text-indigo-500 dark:text-gray-100">
                  <span>
                    <img
                      src={NUMV}
                      alt="Ni una muerte vial"
                      width="300"
                      height="130"
                      className="w-36"
                    />
                  </span>
                </span>
              </Link>
            </div>
          </>

          <div className="text-center lg:flex lg:items-center">
            <ul className="flex flex-1 list-none items-center justify-end pt-6 lg:pt-0">
              {navigation.map((menu) => (
                <li className="mr-3" key={menu.displayName}>
                  <a
                    href={menu.url}
                    className="inline-block rounded-md px-4 py-2 text-lg font-normal text-gray-800 no-underline hover:text-indigo-500 focus:bg-indigo-100 focus:text-indigo-500 focus:outline-none dark:text-gray-200 dark:focus:bg-gray-800"
                  >
                    {menu.displayName}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mr-3 hidden space-x-4 lg:flex">
            {user ? (
              <Form action="/logout" method="post">
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-6 py-2 text-white md:ml-5"
                >
                  Cerrar sesión
                </button>
              </Form>
            ) : (
              <Link
                to="/login"
                className="rounded-md bg-indigo-600 px-6 py-2 text-white md:ml-5"
              >
                Ingresar
              </Link>
            )}
          </div>
        </nav>
      </div>

      <div className="container mx-auto">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-11 flex flex-wrap">
            <div className="flex w-full items-center lg:w-1/2">
              <div className="mb-8 max-w-2xl">
                <h1 className="text-4xl font-bold leading-snug tracking-tight text-gray-800 dark:text-white lg:text-4xl lg:leading-tight xl:text-6xl xl:leading-tight">
                  Las calles son de todos
                </h1>
                <p className="py-5 text-xl leading-normal text-gray-500 dark:text-gray-300 lg:text-xl xl:text-2xl">
                  Visibilizar a las víctimas es la mejor estrategia para
                  convencer a todos de que lo que sucede no es normal ni
                  aceptable. ¡No lo normalicemos!
                </p>

                <div className="flex flex-col items-start space-y-3 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                  {user ? (
                    <Link
                      to="/annotate"
                      className="rounded-md bg-indigo-600 px-8 py-4 text-center text-lg font-medium text-white "
                    >
                      Mis contribuciones
                    </Link>
                  ) : (
                    <Link
                      to="/join"
                      className="rounded-md bg-indigo-600 px-8 py-4 text-center text-lg font-medium text-white "
                    >
                      Regístrate
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <div className="flex  grow items-center justify-center">
              <div className="max-w-sm">
                <img
                  src={Biker}
                  width="616"
                  height="617"
                  className={"object-cover"}
                  alt="Ciclista"
                  loading="eager"
                  placeholder="blur"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto mt-4 flex w-full flex-col items-center justify-center p-8 text-center xl:px-0">
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-snug tracking-tight text-gray-800 dark:text-white lg:text-4xl lg:leading-tight">
            Ayúdanos a visibilizar estos casos
          </h2>
          <p className="max-w-2xl py-4 text-lg leading-normal text-gray-500 dark:text-gray-300 lg:text-xl xl:text-xl">
            Llevamos más de 4 años colectando datos sobre accidentes viales, en
            este tiempo hemos reunido información sobre cerca de 15000 casos.
            Obtenemos esta información a partir de notas periodísticas, esto nos
            lleva tiempo y recursos por lo que te pedimos tu apoyo
          </p>
        </div>

        <div className="container mx-auto mb-20 flex flex-wrap p-8 lg:flex-nowrap lg:gap-10 xl:px-0 ">
          <div className="flex w-full items-center justify-center lg:w-1/2 ">
            <div>
              <img
                src={GirlInComputer}
                alt="Contibuir"
                loading="lazy"
                decoding="async"
                className="object-cover"
                style={{ color: "transparent" }}
                width="521"
                height="548"
              />
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center lg:w-1/2 ">
            <div>
              <div className="mt-4 flex w-full flex-col">
                <h3 className="mt-3 max-w-2xl text-3xl font-bold leading-snug tracking-tight text-gray-800 dark:text-white lg:text-4xl lg:leading-tight">
                  ¿Cómo colaborar?
                </h3>
                <p className="max-w-2xl py-4 text-lg leading-normal text-gray-500 dark:text-gray-300 lg:text-xl xl:text-xl">
                  Este proyecto nace para honrar la memoria de todas las
                  víctimas de siniestros de tránsito. Nuestro método es simple y
                  se basa en reunir notas periodísticas y extraer información de
                  estas.{" "}
                </p>
              </div>
              <div className="mt-5 w-full">
                <div className="mt-8 flex items-start space-x-3">
                  <div className="mt-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-indigo-500 ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-7 w-7 text-indigo-50"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 01-.189-.866c0-.298.059-.605.189-.866zm2.023 6.828a.75.75 0 10-1.06-1.06 3.75 3.75 0 01-5.304 0 .75.75 0 00-1.06 1.06 5.25 5.25 0 007.424 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-medium text-gray-800 dark:text-gray-200">
                      Registrate en esta página
                    </h4>
                    <p className="mt-1 text-gray-500 dark:text-gray-400"></p>
                  </div>
                </div>
                <div className="mt-8 flex items-start space-x-3">
                  <div className="mt-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-indigo-500 ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-7 w-7 text-indigo-50"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm4.5 7.5a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zm3.75-1.5a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0V12zm2.25-3a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0V9.75A.75.75 0 0113.5 9zm3.75-1.5a.75.75 0 00-1.5 0v9a.75.75 0 001.5 0v-9z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-medium text-gray-800 dark:text-gray-200">
                      Ayúdanos a obtener la información
                    </h4>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                      Ayúdanos extraer la información de las notas periodísticas
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex items-start space-x-3">
                  <div className="mt-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-indigo-500 ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-7 w-7 text-indigo-50"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 1.5a.75.75 0 01.75.75V4.5a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zM5.636 4.136a.75.75 0 011.06 0l1.592 1.591a.75.75 0 01-1.061 1.06l-1.591-1.59a.75.75 0 010-1.061zm12.728 0a.75.75 0 010 1.06l-1.591 1.592a.75.75 0 01-1.06-1.061l1.59-1.591a.75.75 0 011.061 0zm-6.816 4.496a.75.75 0 01.82.311l5.228 7.917a.75.75 0 01-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 01-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 01-1.247-.606l.569-9.47a.75.75 0 01.554-.68zM3 10.5a.75.75 0 01.75-.75H6a.75.75 0 010 1.5H3.75A.75.75 0 013 10.5zm14.25 0a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H18a.75.75 0 01-.75-.75zm-8.962 3.712a.75.75 0 010 1.061l-1.591 1.591a.75.75 0 11-1.061-1.06l1.591-1.592a.75.75 0 011.06 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-medium text-gray-800 dark:text-gray-200">
                      Ayúdanos a colectar notas periodísticas
                    </h4>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                      Toda la información que generamos parte de notas
                      periodísticas, ayúdanos a renunirlas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Section
          title="Agradecimientos"
          header="Muchas gracias a todos los que han contribuido a obtener la
          información"
        >
          <p>
            {userNames.length === 0
              ? "Nombres de colaboradores"
              : userNames.join(", ")}
          </p>
        </Section>

        <Section title="FAQs" header="Preguntas frecuentes">
          {FAQS.map(({ question, answer }) => (
            <div key={question}>
              <p className="px-4 py-3 text-left text-lg text-gray-800">
                {question}
              </p>
              <p className="px-4 pb-2 text-left text-gray-500 dark:text-gray-300">
                {answer}
              </p>
            </div>
          ))}
        </Section>
      </div>
      <footer className="container relative mx-auto sm:pb-16 sm:pt-8">
        <div>
          <div className="flex justify-center">
            <div className="mt-5 flex space-x-5 text-gray-400 dark:text-gray-500">
              <a
                href="https://twitter.com/niunamuertevial"
                target="_blank"
                rel="noreferrer"
              >
                <span className="sr-only">Twitter</span>
                <Twitter />
              </a>
            </div>
          </div>
          <div className="mt-10 text-center text-sm text-gray-600 dark:text-gray-400">
            Hecho por{" "}
            <a
              href="https://twitter.com/nobeeakon"
              target="_blank"
              rel="noreferrer"
            >
              Daniel Torres.
            </a>{" "}
            Con Remix y Tailwind :){" "}
            <a
              href="https://github.com/nobeeakon/muertes-viales"
              target="_blank"
              rel="noreferrer"
              className=" text-gray-500 dark:text-gray-400"
            >
              <GithubIcon size={20} />
            </a>
            .
          </div>

          <div className="my-5 text-center text-sm text-gray-600 dark:text-gray-400">
            Ilustraciones de{" "}
            <a
              href="https://www.glazestock.com/"
              target="_blank"
              rel="noreferrer "
            >
              Glazestock
            </a>
            , template adaptado de{" "}
            <a
              href="https://web3templates.com/"
              target="_blank"
              rel="noreferrer "
            >
              web3templates
            </a>
            .
          </div>
        </div>
      </footer>
    </main>
  );
}

function Section({
  title,
  header,
  children,
}: {
  title: string;
  header: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto mt-4 flex w-full flex-col items-center justify-center p-8 text-center xl:px-0">
      <div className="text-sm font-bold uppercase tracking-wider text-indigo-600">
        {title}
      </div>
      <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-snug tracking-tight text-gray-800 dark:text-white lg:text-4xl lg:leading-tight">
        {header}
      </h2>
      <div className="max-w-2xl py-4 text-lg leading-normal text-gray-500 dark:text-gray-300 lg:text-xl xl:text-xl">
        {children}
      </div>
    </div>
  );
}
