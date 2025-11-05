"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAPI } from "@/hooks/use-api";
import { useAtomValue, useAtom } from "jotai";
import { sourceProviderAtom, sourceAccessTokenAtom } from "../atom";
import { Loader2, Check, ExternalLink } from "lucide-react";

export function AccessTokenInput() {
  const [{ accessToken, isSaved, isDisabled }, setAccessToken] = useAtom(
    sourceAccessTokenAtom
  );
  const sourceProvider = useAtomValue(sourceProviderAtom);

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const { callAPI, loading } = useAPI();

  useEffect(() => {
    setMessage(null);
  }, [sourceProvider, setAccessToken]);

  const handleSaveToken = async () => {
    if (!accessToken.trim()) return;
    setMessage(null);

    try {
      const response = await callAPI("/migration-token-check", {
        method: "POST",
        body: {
          token: accessToken,
          source_provider: sourceProvider.id,
        },
        headers: {
          "Content-Type": "application/json",
        },
        requiresAuth: true,
      });

      if (response) {
        setMessage({ text: "Token saved successfully!", type: "success" });
        setAccessToken((prev) => ({
          ...prev,
          isSaved: true,
          isDisabled: true,
        }));
      } else {
        setMessage({ text: "Invalid token. Please try again.", type: "error" });
      }
    } catch (error) {
      console.error("Error saving token:", error);
      setMessage({
        text: "An error occurred while saving the token.",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="accessToken">Access Token</Label>
        {sourceProvider.accessTokenDocumentation && (
          <a
            href={sourceProvider.accessTokenDocumentation}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline flex items-center"
          >
            How to get access token for {sourceProvider.name}?{" "}
            <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        )}
      </div>
      <div className="flex gap-2">
        <div className="flex flex-col gap-2 w-full">
          <Input
            id="accessToken"
            value={accessToken}
            onChange={(e) => {
              setAccessToken((prev) => ({
                ...prev,
                accessToken: e.target.value,
              }));
            }}
            placeholder="Enter your access token"
            className="flex-grow"
            disabled={!sourceProvider.id || isDisabled}
          />
          {message && (
            <p
              className={`text-sm mt-1 ${
                message.type === "success" ? "text-green-500" : "text-red-500"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
        <Button
          onClick={handleSaveToken}
          disabled={
            !sourceProvider.id || !accessToken.trim() || loading || isDisabled
          }
          className={isSaved ? "bg-green-500 text-white" : ""}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isSaved ? (
            <>
              <Check className="mr-2 h-4 w-4 text-white" />
              Saved
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </div>
  );
}
