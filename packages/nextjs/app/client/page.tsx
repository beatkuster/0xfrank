"use client";

import { useState } from "react";
import { formatUnits, isAddress, parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { QrCodeScanner } from "~~/components/QrCodeScanner";

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
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const ClientPage = () => {
  const [view, setView] = useState<View>("home");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [sendAmount, setSendAmount] = useState<string>("");
  const [sendError, setSendError] = useState<string>("");

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

  const { writeContract, data: txHash, isPending: isSending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleSend = () => {
    setSendError("");

    if (!isAddress(recipientAddress)) {
      setSendError("Ungültige Ethereum-Adresse.");
      return;
    }

    const parsed = parseFloat(sendAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setSendError("Bitte einen gültigen Betrag eingeben.");
      return;
    }

    writeContract({
      address: ZCHF_ADDRESS,
      abi: ZCHF_ABI,
      functionName: "transfer",
      args: [recipientAddress as `0x${string}`, parseUnits(sendAmount, 18)],
      chainId: mainnet.id,
    });
  };

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

        <QrCodeScanner
          onScan={data => {
            // TODO next increment: call Frankencoin contract with data.address and data.amount
            console.log("Payment data:", data);
            setView("home");
          }}
        />
      </div>
    );
  }

  if (view === "senden") {
    return (
      <div className="container mx-auto px-6 py-10 max-w-2xl">
        <button
          className="btn btn-ghost mb-4"
          onClick={() => {
            setView("home");
            setRecipientAddress("");
            setSendAmount("");
            setSendError("");
          }}
        >
          ← Zurück
        </button>
        <h2 className="text-2xl font-bold mb-6">Senden</h2>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Empfänger-Adresse (0x...)"
            className="input input-bordered w-full font-mono text-sm"
            value={recipientAddress}
            onChange={e => setRecipientAddress(e.target.value)}
          />

          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="0.00"
              className="input input-bordered w-full text-xl font-bold"
              value={sendAmount}
              onChange={e => setSendAmount(e.target.value)}
              min="0"
              step="0.01"
            />
            <span className="font-mono font-bold text-sm whitespace-nowrap">ZCHF</span>
          </div>

          {sendError && <div className="alert alert-error text-sm">{sendError}</div>}

          {isSending && (
            <div className="alert alert-info text-sm">
              <span className="loading loading-spinner loading-xs" />
              Transaktion wird signiert...
            </div>
          )}

          {isConfirming && (
            <div className="alert alert-info text-sm">
              <span className="loading loading-spinner loading-xs" />
              Transaktion wird bestätigt...
            </div>
          )}

          {isConfirmed && txHash && (
            <div className="alert alert-success text-sm">
              <div>
                <p className="font-semibold">Transaktion erfolgreich!</p>
                <a
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link font-mono text-xs break-all"
                >
                  {txHash}
                </a>
              </div>
            </div>
          )}

          <button
            className="btn btn-primary w-full"
            onClick={handleSend}
            disabled={isSending || isConfirming || !isConnected}
          >
            {isSending || isConfirming ? <span className="loading loading-spinner loading-sm" /> : "Senden"}
          </button>

          {!isConnected && (
            <p className="text-sm text-center opacity-60">Bitte verbinde deine Wallet um ZCHF zu senden.</p>
          )}
        </div>
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
