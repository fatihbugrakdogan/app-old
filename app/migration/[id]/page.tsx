import StatusPage from "./client";

type Params = Promise<{ id: string }>;

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  return <StatusPage id={id} />;
}
