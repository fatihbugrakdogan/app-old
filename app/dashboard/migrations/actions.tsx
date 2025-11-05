export async function createMigration() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/migration`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Ensure this fetch is not cached and runs on every request
      cache: "no-store",
      // Add a unique key to prevent duplicate requests
      next: { tags: ["migration-init"] },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to create migration");
  }

  const newMigration = await res.json();

  return newMigration;
}
