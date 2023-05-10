import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  return json({ });
}

export default function NotesPage() {
  const user = useUser();

  const links: Array<{ href: string; displayName: string }> = [
    { href: "date", displayName: "Fecha" },
    { href: "time", displayName: "Hora" },
    { href: "age", displayName: "Edad" },
    { href: "sex", displayName: "Sexo" },
    { href: "transport", displayName: "Transporte" },
    { href: "name", displayName: "Nombre" },
    { href: "coordinates", displayName: "Ubicación" },
    { href: "vehicle", displayName: "Vehículo" },
    { href: "victimizer", displayName: "Victimario" },
    { href: "victimizerSex", displayName: "V. Sexo" },
    { href: "victimizerAge", displayName: "V. Edad" },
    { href: "addNote", displayName: "+ Agregar" },
  ];

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Anotar</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Salir
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-40 border-r bg-gray-50">
          <ol>
            {links.map((linkItem) => (
              <li key={linkItem.href}>
                <NavLink
                  className={`block border-b p-4 text-xl `}
                  to={linkItem.href}
                >
                  {linkItem.displayName}
                </NavLink>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
