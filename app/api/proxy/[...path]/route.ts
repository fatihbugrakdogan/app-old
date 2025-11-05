import { NextResponse } from "next/server";
import { PROTECTED_ENDPOINTS } from "@/constants/protected-endpoints";

const BACKEND_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_API_URL || "").replace(/\/$/, "");

function isAllowedPath(path: string) {
  return PROTECTED_ENDPOINTS.some((protectedEndpoint) =>
    path.startsWith(protectedEndpoint)
  );
}

async function proxy(request: Request, params: { path: string | string[] }) {
  if (!BACKEND_BASE_URL) {
    return NextResponse.json(
      { message: "Backend URL is not configured." },
      { status: 500 }
    );
  }

  const segments = Array.isArray(params.path) ? params.path : [params.path].filter(Boolean);
  const path = `/${segments.join("/")}`;

  if (!isAllowedPath(path)) {
    return NextResponse.json({ message: "Endpoint not allowed." }, { status: 403 });
  }

  const targetUrl = `${BACKEND_BASE_URL}${path}${new URL(request.url).search}`;

  const forwardHeaders = new Headers();
  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (["host", "connection", "content-length"].includes(lowerKey)) {
      return;
    }
    if (lowerKey === "cookie") {
      return;
    }
    forwardHeaders.set(key, value);
  });

  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    forwardHeaders.set("Cookie", cookieHeader);
  }

  const init: RequestInit = {
    method: request.method,
    headers: forwardHeaders,
  };

  if (!["GET", "HEAD"].includes(request.method.toUpperCase())) {
    const body = await request.arrayBuffer();
    init.body = body;
  }

  const backendResponse = await fetch(targetUrl, init);
  const responseHeaders = new Headers();

  backendResponse.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (["content-encoding", "content-length", "transfer-encoding", "connection"].includes(lowerKey)) {
      return;
    }
    if (lowerKey === "set-cookie") {
      responseHeaders.append("set-cookie", value);
      return;
    }
    responseHeaders.set(key, value);
  });

  const responseBody = await backendResponse.arrayBuffer();

  return new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: Request, context: any) {
  return proxy(request, context.params);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(request: Request, context: any) {
  return proxy(request, context.params);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(request: Request, context: any) {
  return proxy(request, context.params);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PATCH(request: Request, context: any) {
  return proxy(request, context.params);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(request: Request, context: any) {
  return proxy(request, context.params);
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
