"use client";

import { useState } from "react";
import { parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { useAccount, useConfig, useReadContract, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

const SAVINGS_ADDRESS = "0x27d9ad987bde08a0d083ef7e0e4043c857a17b38" as const;
const ZCHF_ADDRESS = "0xB58E61C3098d85632Df34EecfB899A1Ed80921cB" as const;
const REFERRAL_ADDRESS = "0x526273396a746e74038AbCD11357e5a145f30020" as const;
const REFERRAL_FEE_PPM = 250000 as const;

const ZCHF_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const SAVINGS_ABI = [
  {
    name: "save",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint192" },
      { name: "referrer", type: "address" },
      { name: "referralFeePPM", type: "uint24" },
    ],
    outputs: [],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "target", type: "address" },
      { name: "amount", type: "uint192" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

type TransferViewProps = {
  onBack: () => void;
  zchfBalance: string;
  isLoading: boolean;
  savingsBalance: string;
  isLoadingSavings: boolean;
};

const TransferView = ({ onBack, zchfBalance, isLoading, savingsBalance, isLoadingSavings }: TransferViewProps) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [isPrivatkontoOnTop, setIsPrivatkontoOnTop] = useState(true);

  const { address } = useAccount();
  const config = useConfig();

  const { data: allowance } = useReadContract({
    address: ZCHF_ADDRESS,
    abi: ZCHF_ABI,
    functionName: "allowance",
    args: [address!, SAVINGS_ADDRESS],
    chainId: mainnet.id,
    query: { enabled: !!address },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  const handleTransfer = async () => {
    setError("");

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Bitte gültigen Betrag eingeben.");
      return;
    }

    const parsedAmount = parseUnits(amount, 18);

    if (isPrivatkontoOnTop) {
      if (allowance !== undefined && allowance < parsedAmount) {
        const approveHash = await writeContractAsync({
          address: ZCHF_ADDRESS,
          abi: ZCHF_ABI,
          functionName: "approve",
          args: [SAVINGS_ADDRESS, parsedAmount],
          chainId: mainnet.id,
        });
        await waitForTransactionReceipt(config, { hash: approveHash });
      }

      await writeContractAsync({
        address: SAVINGS_ADDRESS,
        abi: SAVINGS_ABI,
        functionName: "save",
        args: [parsedAmount, REFERRAL_ADDRESS, REFERRAL_FEE_PPM],
        chainId: mainnet.id,
      });
    } else {
      await writeContractAsync({
        address: SAVINGS_ADDRESS,
        abi: SAVINGS_ABI,
        functionName: "withdraw",
        args: [address!, parsedAmount],
        chainId: mainnet.id,
      });
    }
  };

  const privatkontoCard = (
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
  );

  const sparkontoCard = (
    <div className="card bg-base-100 shadow">
      <div className="card-body flex-row justify-between items-center">
        <span className="font-semibold">Sparkonto</span>
        {isLoadingSavings ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          <span className="font-bold">{savingsBalance} ZCHF</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-10 max-w-2xl">
      <button className="btn btn-ghost mb-4" onClick={onBack}>
        ← Zurück
      </button>
      <h2 className="text-2xl font-bold mb-6">Transfer</h2>

      <div className="relative h-[13rem]">
        <div
          className={`absolute inset-x-0 top-0 transition-transform duration-300 ease-in-out ${
            isPrivatkontoOnTop ? "translate-y-0" : "translate-y-[8rem]"
          }`}
        >
          {privatkontoCard}
        </div>

        <div className="absolute inset-x-0 flex justify-center" style={{ top: "5rem" }}>
          <button className="text-2xl px-4 py-2" onClick={() => setIsPrivatkontoOnTop(prev => !prev)}>
            ⇅
          </button>
        </div>

        <div
          className={`absolute inset-x-0 bottom-0 transition-transform duration-300 ease-in-out ${
            isPrivatkontoOnTop ? "translate-y-0" : "-translate-y-[8rem]"
          }`}
        >
          {sparkontoCard}
        </div>
      </div>

      <div className="mt-6">
        <label className="label">
          <span className="label-text">Betrag (ZCHF)</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="0.00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        {error && <p className="text-error text-sm mt-2">{error}</p>}
      </div>

      <button className="btn btn-primary w-full mt-4" onClick={handleTransfer} disabled={isPending}>
        {isPending ? <span className="loading loading-spinner loading-sm" /> : "Transfer ausführen"}
      </button>
    </div>
  );
};

export default TransferView;
