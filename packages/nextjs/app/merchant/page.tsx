"use client";

import { useState } from "react";
import SendenView from "../_components/SendenView";
import TransferView from "../_components/TransferView";
import { QRCodeSVG } from "qrcode.react";
import { formatUnits, isAddress, parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

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

type View = "home" | "qr" | "transfer" | "senden";

const PRESETS = ["0.1", "0.2", "0.5", "1"];

// Converts preset display strings like "0.1" or "0.5" to plain decimal strings
function presetToAmount(preset: string): string {
  return preset.replace(".—", "");
}

const MerchantPage = () => {
  const [view, setView] = useState<View>("home");
  const [selectedAmount, setSelectedAmount] = useState<string>("0.5");
  const [customInput, setCustomInput] = useState<string>("");
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

  const handleCustomInput = (raw: string) => {
    const normalized = raw.replace(",", ".").replace(/[^0-9.]/g, "");
    const [integer, ...decimals] = normalized.split(".");
    let cleaned = decimals.length ? `${integer}.${decimals.join("")}` : integer;
    if (cleaned.includes(".")) {
      const [intPart, decPart] = cleaned.split(".");
      cleaned = `${intPart}.${decPart.slice(0, 2)}`;
    }
    setCustomInput(cleaned);
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num > 0) setSelectedAmount(cleaned);
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const passthrough = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      ".",
      ",",
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Enter",
    ];
    if (!passthrough.includes(e.key)) {
      e.preventDefault();
      return;
    }
    if (/^[0-9]$/.test(e.key)) {
      const input = e.currentTarget;
      const selStart = input.selectionStart ?? input.value.length;
      const selEnd = input.selectionEnd ?? input.value.length;
      const newValue = input.value.slice(0, selStart) + e.key + input.value.slice(selEnd);
      const dotIndex = newValue.indexOf(".");
      if (dotIndex !== -1 && newValue.length - dotIndex - 1 > 2) e.preventDefault();
    }
  };

  if (view === "qr") {
    return (
      <div className="container mx-auto px-6 py-10 max-w-2xl">
        <button className="btn btn-ghost mb-4" onClick={() => setView("home")}>
          ← Zurück
        </button>
        <h2 className="text-2xl font-bold mb-6">QR-Code · {selectedAmount} ZCHF</h2>

        {!isConnected || !address ? (
          <div role="alert" className="alert alert-warning">
            <span>Bitte verbinde deine Wallet um einen QR-Code zu generieren.</span>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <QRCodeSVG value={`frankencoin:${address}?amount=${presetToAmount(selectedAmount)}`} size={192} />
              </div>
            </div>

            <p className="text-center text-base-content/50 mb-2">⏳ Warte auf Zahlung...</p>
            <p className="text-center font-mono text-sm">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </>
        )}
      </div>
    );
  }

  if (view === "transfer") {
    return <TransferView onBack={() => setView("home")} zchfBalance={zchfBalance} isLoading={isLoading} />;
  }

  if (view === "senden") {
    return (
      <SendenView
        onBack={() => {
          setView("home");
          setRecipientAddress("");
          setSendAmount("");
          setSendError("");
        }}
        isConnected={isConnected}
        isSending={isSending}
        isConfirming={isConfirming}
        isConfirmed={isConfirmed}
        txHash={txHash}
        recipientAddress={recipientAddress}
        sendAmount={sendAmount}
        sendError={sendError}
        onRecipientChange={setRecipientAddress}
        onAmountChange={setSendAmount}
        onSend={handleSend}
      />
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
            className={`btn btn-sm btn-outline ${selectedAmount === preset && !customInput ? "btn-active" : ""}`}
            onClick={() => {
              setSelectedAmount(preset);
              setCustomInput("");
            }}
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="join w-full mb-4">
        <input
          type="text"
          inputMode="decimal"
          className="input input-bordered join-item flex-1"
          placeholder="oder Betrag eingeben..."
          value={customInput}
          onChange={e => handleCustomInput(e.target.value)}
          onKeyDown={handleAmountKeyDown}
        />
        <span className="join-item flex items-center px-4 bg-base-200 border border-base-300 rounded-r-lg text-sm font-semibold">
          ZCHF
        </span>
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
