type SendenViewProps = {
  onBack: () => void;
  isConnected: boolean;
  isSending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  txHash: `0x${string}` | undefined;
  recipientAddress: string;
  sendAmount: string;
  sendError: string;
  onRecipientChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onSend: () => void;
};

const SendenView = ({
  onBack,
  isConnected,
  isSending,
  isConfirming,
  isConfirmed,
  txHash,
  recipientAddress,
  sendAmount,
  sendError,
  onRecipientChange,
  onAmountChange,
  onSend,
}: SendenViewProps) => (
  <div className="container mx-auto px-6 py-10 max-w-2xl">
    <button className="btn btn-ghost mb-4" onClick={onBack}>
      ← Zurück
    </button>
    <h2 className="text-2xl font-bold mb-6">Senden</h2>

    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Empfänger-Adresse (0x...)"
        className="input input-bordered w-full font-mono text-sm"
        value={recipientAddress}
        onChange={e => onRecipientChange(e.target.value)}
      />

      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="0.00"
          className="input input-bordered w-full text-xl font-bold"
          value={sendAmount}
          onChange={e => onAmountChange(e.target.value)}
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

      <button className="btn btn-primary w-full" onClick={onSend} disabled={isSending || isConfirming || !isConnected}>
        {isSending || isConfirming ? <span className="loading loading-spinner loading-sm" /> : "Senden"}
      </button>

      {!isConnected && <p className="text-sm text-center opacity-60">Bitte verbinde deine Wallet um ZCHF zu senden.</p>}
    </div>
  </div>
);

export default SendenView;
