"use client";

import { useState } from "react";
import { formatUnits } from "viem";
import { mainnet } from "viem/chains";
import { useAccount, useReadContract } from "wagmi";

type View = "home" | "transfer" | "zahlen" | "senden";

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

const ClientPage = () => {
  const [view, setView] = useState<View>("home");

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

  if (view === "zahlen") {
    return (
      <div className="container mx-auto px-6 py-10 max-w-2xl">
        <button className="btn btn-ghost mb-4" onClick={() => setView("home")}>
          ← Zurück
        </button>
        <h2 className="text-2xl font-bold mb-6">Zahlen via QR-Code</h2>

        <div className="border-2 border-dashed rounded-xl p-8 text-center text-base-content/50">
          QR-Code Scanner — coming soon
        </div>
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
      <h1 className="text-3xl font-bold mb-8">0xFrank — Client App</h1>

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
              <p className="text-5xl font-bold mt-1">{zchfBalance}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="badge badge-primary">ZCHF · Frankencoin</span>
                <span className="text-base-content/50 text-xs font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
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

      {/* Actions Section */}
      <h2 className="text-xs font-semibold tracking-widest text-base-content/50 mb-3">AKTIONEN</h2>

      <div className="flex gap-3">
        <button className="btn btn-primary flex-1" onClick={() => setView("zahlen")}>
          Zahlen
        </button>
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

export default ClientPage;
