"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type View = "home" | "qr" | "transfer" | "senden";

const PRESETS = ["5.—", "10.—", "15.50", "20.—", "50.—"];

const MERCHANT_ADDRESS = "0xC4ac634fdA42bCbB030F7fA7Eb7ddd42eEf3A9AB";

// Converts preset display strings like "5.—" or "15.50" to plain decimal strings
function presetToAmount(preset: string): string {
  return preset.replace(".—", "");
}

const MerchantPage = () => {
  const [view, setView] = useState<View>("home");
  const [selectedAmount, setSelectedAmount] = useState<string>("15.50");

  if (view === "qr") {
    return (
      <div className="container mx-auto px-6 py-10 max-w-2xl">
        <button className="btn btn-ghost mb-4" onClick={() => setView("home")}>
          ← Zurück
        </button>
        <h2 className="text-2xl font-bold mb-6">QR-Code · {selectedAmount} ZCHF</h2>

        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <QRCodeSVG value={`frankencoin:${MERCHANT_ADDRESS}?amount=${presetToAmount(selectedAmount)}`} size={192} />
          </div>
        </div>

        <p className="text-center text-base-content/50 mb-2">⏳ Warte auf Zahlung...</p>
        <p className="text-center font-mono text-sm">
          {MERCHANT_ADDRESS.slice(0, 6)}...{MERCHANT_ADDRESS.slice(-4)}
        </p>
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
            <span className="font-bold">847.50 ZCHF</span>
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
          <p className="text-base-content/60 text-sm">Gesamtguthaben</p>
          <p className="text-5xl font-bold mt-1">1&#39;847.50</p>
          <div className="mt-2">
            <span className="badge badge-primary">ZCHF · Frankencoin</span>
          </div>
        </div>
      </div>

      {/* Accounts Section */}
      <h2 className="text-xs font-semibold tracking-widest text-base-content/50 mb-3">MEINE KONTEN</h2>

      <div className="card bg-base-100 shadow">
        <div className="card-body flex-row justify-between items-center py-4">
          <span className="font-semibold">Privatkonto</span>
          <span className="font-bold">847.50 ZCHF</span>
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
