import Link from "next/link";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="flex items-center justify-center flex-col grow pt-16 px-6">
      <h1 className="text-4xl font-bold mb-2">0xFrank</h1>
      <p className="text-base-content/50 mb-12">Wähle deine Ansicht</p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Link href="/client" className="btn btn-primary flex-1 text-lg py-6">
          Client
        </Link>
        <Link href="/merchant" className="btn btn-secondary flex-1 text-lg py-6">
          Merchant
        </Link>
      </div>
    </div>
  );
};

export default Home;
