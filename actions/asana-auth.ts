"use server";

export async function asanaLogin(code: string) {
  // Here you would typically send the code to your FastAPI backend
  // For this example, we'll just simulate the process
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/asana`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to login with Asana");
  }
}
