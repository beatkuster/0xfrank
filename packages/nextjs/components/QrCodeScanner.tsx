"use client";

import { useCallback, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { isAddress } from "viem";

type ScanResult = {
  address: string;
  amount: string;
};

type QrCodeScannerProps = {
  onScan: (data: ScanResult) => void;
};

function parseQrPayload(raw: string): ScanResult | null {
  if (!raw.startsWith("frankencoin:")) return null;
  const withoutScheme = raw.slice("frankencoin:".length);
  const [addressPart, queryPart] = withoutScheme.split("?");
  if (!addressPart || !queryPart) return null;
  const amount = new URLSearchParams(queryPart).get("amount") ?? "";
  if (!isAddress(addressPart) || !amount) return null;
  return { address: addressPart, amount };
}

export const QrCodeScanner = ({ onScan }: QrCodeScannerProps) => {
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleScan = useCallback(
    (results: Array<{ rawValue: string }>) => {
      for (const result of results) {
        console.log("QR raw:", result.rawValue);
        const parsed = parseQrPayload(result.rawValue);
        if (parsed) {
          onScan(parsed);
          return;
        }
      }
    },
    [onScan],
  );

  const handleError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      if (error.name === "NotAllowedError") {
        setCameraError(
          "Kamera-Zugriff verweigert. Bitte erlauben Sie den Kamera-Zugriff in Ihren Browser-Einstellungen.",
        );
      } else if (error.name === "NotFoundError") {
        setCameraError("Keine Kamera auf diesem Gerät gefunden.");
      } else {
        setCameraError("Kamera konnte nicht gestartet werden. Bitte versuchen Sie es erneut.");
      }
    }
  }, []);

  if (cameraError) {
    return (
      <div role="alert" className="alert alert-error">
        <span>{cameraError}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full rounded-xl overflow-hidden">
        <Scanner onScan={handleScan} onError={handleError} />
      </div>
      <p className="text-sm text-base-content/60 text-center">Kamera auf den QR-Code des Händlers richten</p>
    </div>
  );
};
