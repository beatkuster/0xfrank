type TransferViewProps = {
  onBack: () => void;
  zchfBalance: string;
  isLoading: boolean;
};

const TransferView = ({ onBack, zchfBalance, isLoading }: TransferViewProps) => (
  <div className="container mx-auto px-6 py-10 max-w-2xl">
    <button className="btn btn-ghost mb-4" onClick={onBack}>
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

export default TransferView;
