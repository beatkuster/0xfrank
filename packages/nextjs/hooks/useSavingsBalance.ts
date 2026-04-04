import { useEffect, useState } from "react";
import { formatUnits } from "viem";

const SAVINGS_MODULE = "0x27d9ad987bde08a0d083ef7e0e4043c857a17b38";
const MAINNET_CHAIN_ID = "1";

type SavingsApiResponse = {
  [chainId: string]: {
    [module: string]: {
      balance: string;
    };
  };
};

export const useSavingsBalance = (address: string | undefined) => {
  const [savingsRaw, setSavingsRaw] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setSavingsRaw(0n);
      return;
    }

    const fetchBalance = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`https://api.frankencoin.com/savings/core/balance/${address}`);
        const data: SavingsApiResponse = await res.json();
        const balance = data?.[MAINNET_CHAIN_ID]?.[SAVINGS_MODULE]?.balance;
        setSavingsRaw(balance ? BigInt(balance) : 0n);
      } catch {
        setSavingsRaw(0n);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [address]);

  const savingsBalance = parseFloat(formatUnits(savingsRaw, 18)).toLocaleString("de-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return { savingsBalance, savingsRaw, isLoading };
};
