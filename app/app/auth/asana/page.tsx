import { redirect } from "next/navigation";
import { AsanaAuthClient } from "./client";
import { asanaLogin } from "@/actions/asana-auth";
import { cookies } from "next/headers";

export default async function AsanaAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { code, state } = await searchParams;

  const cookieStore = await cookies();

  if (!code || !state) {
    console.log("no code or state");
    redirect("/"); // Redirect to home if code or state is missing
  }

  // Verify the state (you should implement this securely)
  const storedState = cookieStore.get("asanaAppAuthState");

  console.log("storedState", storedState);
  if (state !== storedState?.value) {
    console.log("invalid state");
    throw new Error("Invalid state parameter");
  }

  console.log("valid state");

  try {
    await asanaLogin(code as string);
    // If successful, render the client component
    return <AsanaAuthClient />;
  } catch (error) {
    // Handle error (e.g., show error message or redirect)
    console.error("Asana login failed:", error);
    redirect("/");
  }
}
