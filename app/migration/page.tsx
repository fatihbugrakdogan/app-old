import /* Remove: notFound, redirect */ "next/navigation";
import MigrationPageClient from "./migration-page-client";

type Params = Promise<{ migrationId: string }>;

export default async function MigrationPage({ params }: { params: Params }) {
  const {
    /* Remove: migrationId */
  } = await params;
  /*
  const migrationData = await getMigrationData(migrationId);

  if (!migrationData) {
    notFound();
  }
  */

  return <MigrationPageClient />;
}
