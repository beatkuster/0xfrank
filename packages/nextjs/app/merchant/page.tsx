"use client";

import { useState } from "react";
import { formatUnits } from "viem";
import { mainnet } from "viem/chains";
import { useAccount, useReadContract } from "wagmi";

const ZCHF_ADDRESS = "0xB58E61C3098d85632Df34EecfB899A1Ed80921cB" as const;

const ZCHF_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

type View = "home" | "qr" | "transfer" | "senden";

const PRESETS = ["5.—", "10.—", "15.50", "20.—", "50.—"];

const QrPlaceholder = () => (
  <svg viewBox="0 0 100 100" width="160" height="160" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="white" />
    {/* Top-left corner */}
    <rect x="5" y="5" width="30" height="30" rx="3" fill="#000" />
    <rect x="9" y="9" width="22" height="22" rx="2" fill="white" />
    <rect x="13" y="13" width="14" height="14" rx="1" fill="#000" />
    {/* Top-right corner */}
    <rect x="65" y="5" width="30" height="30" rx="3" fill="#000" />
    <rect x="69" y="9" width="22" height="22" rx="2" fill="white" />
    <rect x="73" y="13" width="14" height="14" rx="1" fill="#000" />
    {/* Bottom-left corner */}
    <rect x="5" y="65" width="30" height="30" rx="3" fill="#000" />
    <rect x="9" y="69" width="22" height="22" rx="2" fill="white" />
    <rect x="13" y="73" width="14" height="14" rx="1" fill="#000" />
    {/* Scattered data dots */}
    <rect x="42" y="5" width="5" height="5" fill="#000" />
    <rect x="50" y="5" width="5" height="5" fill="#000" />
    <rect x="42" y="12" width="5" height="5" fill="#000" />
    <rect x="57" y="12" width="5" height="5" fill="#000" />
    <rect x="5" y="42" width="5" height="5" fill="#000" />
    <rect x="5" y="50" width="5" height="5" fill="#000" />
    <rect x="12" y="57" width="5" height="5" fill="#000" />
    <rect x="42" y="42" width="5" height="5" fill="#000" />
    <rect x="50" y="42" width="5" height="5" fill="#000" />
    <rect x="57" y="50" width="5" height="5" fill="#000" />
    <rect x="42" y="57" width="5" height="5" fill="#000" />
    <rect x="65" y="42" width="5" height="5" fill="#000" />
    <rect x="72" y="50" width="5" height="5" fill="#000" />
    <rect x="65" y="57" width="5" height="5" fill="#000" />
    <rect x="80" y="42" width="5" height="5" fill="#000" />
    <rect x="42" y="65" width="5" height="5" fill="#000" />
    <rect x="50" y="72" width="5" height="5" fill="#000" />
    <rect x="57" y="65" width="5" height="5" fill="#000" />
    <rect x="42" y="80" width="5" height="5" fill="#000" />
    <rect x="57" y="80" width="5" height="5" fill="#000" />
    <rect x="72" y="65" width="5" height="5" fill="#000" />
    <rect x="80" y="72" width="5" height="5" fill="#000" />
    <rect x="87" y="65" width="5" height="5" fill="#000" />
    {/* Center dot */}
    <rect x="46" y="46" width="8" height="8" rx="2" fill="#000" />
  </svg>
);

const MerchantPage = () => {
  const [view, setView] = useState<View>("home");
  const [selectedAmount, setSelectedAmount] = useState<string>("15.50");

  const { address, isConnected } = useAccount();

  const { data: rawBalance, isLoading } = useReadContract({
    address: ZCHF_ADDRESS,
    abi: ZCHF_ABI,
    functionName: "balanceOf",
    args: [address!],
    chainId: mainnet.id,
    query: { enabled: !!address },
  });

  const zchfBalance = rawBalance
    ? parseFloat(formatUnits(rawBalance, 18)).toLocaleString("de-CH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

  if (view === "qr") {
    return (
      <div className="container mx-auto px-6 py-10 max-w-2xl">
        <button className="btn btn-ghost mb-4" onClick={() => setView("home")}>
          ← Zurück
        </button>
        <h2 className="text-2xl font-bold mb-6">QR-Code · {selectedAmount} ZCHF</h2>

        <div className="flex justify-center mb-6">
          <div className="bg-white w-48 h-48 flex items-center justify-center rounded-lg shadow">
            <QrPlaceholder />
          </div>
        </div>

        <p className="text-center text-base-content/50 mb-2">⏳ Warte auf Zahlung...</p>
        <p className="text-center font-mono text-sm">0x4d2e...f881</p>
      </div>
    );
  }

  if (view === "transfer") {
    return (
      <div className="container mx-auto px-6 py-10 max-w-2xl">
        <button className="btn btn-ghost mb-4" onClick={() => setView("home")}>
          ← Zurück
        </button>
        <h2 className="text-2xl font-bold mb-6">Transfer</h2>

        <div className="card bg-base-100 shadow">
          <div className="card-body flex-row justify-between items-center">
            <span className="font-semibold">Privatkonto</span>
            {isLoading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <span className="font-bold">{zchfBalance} ZCHF</span>
            )}
          </div>
        </div>

        <div className="flex justify-center my-4 text-2xl">⇅</div>

        <div className="card bg-base-100 shadow">
          <div className="card-body flex-row justify-between items-center">
            <span className="font-semibold">Sparkonto</span>
            <span className="font-bold">1&#39;000.00 ZCHF</span>
          </div>
        </div>

        <div className="mt-6">
          <label className="label">
            <span className="label-text">Betrag (ZCHF)</span>
          </label>
          <input type="text" className="input input-bordered w-full" placeholder="0.00" />
        </div>

        <button className="btn btn-primary w-full mt-4">Transfer ausführen</button>
      </div>
    );
  }

  if (view === "senden") {
    return (
      <div className="container mx-auto px-6 py-10 max-w-2xl">
        <button className="btn btn-ghost mb-4" onClick={() => setView("home")}>
          ← Zurück
        </button>
        <h2 className="text-2xl font-bold mb-6">Senden</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="label">
              <span className="label-text">Empfänger-Adresse (0x...)</span>
            </label>
            <input type="text" className="input input-bordered w-full" placeholder="0x..." />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Betrag (ZCHF)</span>
            </label>
            <input type="number" className="input input-bordered w-full" placeholder="0.00" />
          </div>
        </div>

        <button className="btn btn-primary w-full mt-6">Senden →</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">0xFrank — Merchant App</h1>

      {/* Balance Card */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          {!isConnected ? (
            <div className="alert alert-warning">
              <span>Bitte verbinde deine Wallet um dein Guthaben zu sehen.</span>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : (
            <>
              <p className="text-base-content/60 text-sm">Gesamtguthaben</p>
              <p className="text-5xl font-bold mt-1">{zchfBalance} ZCHF</p>
              <span className="text-base-content/50 text-xs font-mono mt-2">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Accounts Section */}
      <h2 className="text-xs font-semibold tracking-widest text-base-content/50 mb-3">MEINE KONTEN</h2>

      <div className="card bg-base-100 shadow">
        <div className="card-body flex-row justify-between items-center py-4">
          <span className="font-semibold">Privatkonto</span>
          {isLoading ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <span className="font-bold">{isConnected ? zchfBalance : "0.00"} ZCHF</span>
          )}
        </div>
      </div>

      <div className="flex justify-center my-3">
        <button className="btn btn-sm btn-outline" onClick={() => setView("transfer")}>
          ⇅ Transfer
        </button>
      </div>

      <div className="card bg-base-100 shadow mb-8">
        <div className="card-body flex-row justify-between items-center py-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Sparkonto</span>
            <span className="badge badge-success badge-sm">3.2% APY</span>
          </div>
          <span className="font-bold">1&#39;000.00 ZCHF</span>
        </div>
      </div>

      {/* QR Section */}
      <h2 className="text-xs font-semibold tracking-widest text-base-content/50 mb-3">BETRAG EINGEBEN</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map(preset => (
          <button
            key={preset}
            className={`btn btn-sm btn-outline ${selectedAmount === preset ? "btn-active" : ""}`}
            onClick={() => setSelectedAmount(preset)}
          >
            {preset}
          </button>
        ))}
      </div>

      <p className="text-3xl font-bold mb-4">{selectedAmount} ZCHF</p>

      <button className="btn btn-primary w-full mb-8" onClick={() => setView("qr")}>
        QR-Code generieren →
      </button>

      {/* Actions Section */}
      <h2 className="text-xs font-semibold tracking-widest text-base-content/50 mb-3">AKTIONEN</h2>

      <div className="flex gap-3">
        <button className="btn btn-secondary flex-1" onClick={() => setView("transfer")}>
          Transfer
        </button>
        <button className="btn btn-accent flex-1" onClick={() => setView("senden")}>
          Senden
        </button>
      </div>
    </div>
  );
};

export default MerchantPage;
