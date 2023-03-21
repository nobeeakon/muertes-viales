export function csv(content: string, fileName: string) {
  const headers = new Headers();

  headers.set("Content-Type", "text/csv");
  headers.set("Content-Disposition", `attachment;filename=${fileName}.csv`);

  return new Response(content, {
    status: 200,
    headers,
  });
}
