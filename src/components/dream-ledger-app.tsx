"use client";

import {
  CloudMoon,
  Eye,
  Loader2,
  MapPin,
  Moon,
  Search,
  Sparkles,
  Stars,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { parseEventLogs, type Address } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  dreamLedgerAbi,
  dreamLedgerContractAddress,
  MAX_FRAGMENT_LENGTH,
  MAX_MOOD_LENGTH,
  MAX_PLACE_LENGTH,
  MAX_TITLE_LENGTH,
} from "@/lib/dream-ledger";

const MOODS = ["Lucid", "Soft", "Strange", "Golden"] as const;

function shortAddress(address?: Address) {
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    return "--";
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(value?: bigint) {
  if (!value) return "--";
  return new Date(Number(value) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function friendlyError(error: unknown) {
  if (!(error instanceof Error)) return "Transaction was cancelled.";
  if (error.message.includes("User rejected")) return "Request cancelled in wallet.";
  if (error.message.includes("Invalid title")) return "Title needs 1 to 42 characters.";
  if (error.message.includes("Invalid mood")) return "Choose a short mood.";
  if (error.message.includes("Invalid place")) return "Place needs 1 to 42 characters.";
  if (error.message.includes("Invalid fragment")) return "Fragment needs 1 to 220 characters.";
  return error.message;
}

function DreamPage({
  title,
  mood,
  place,
  fragment,
  dreamer,
  createdAt,
}: {
  title: string;
  mood: string;
  place: string;
  fragment: string;
  dreamer?: Address;
  createdAt?: bigint;
}) {
  const accent =
    mood === "Golden"
      ? "text-[#d69b39] border-[#d69b39] bg-[#fff3c7]"
      : mood === "Strange"
        ? "text-[#8b5cf6] border-[#8b5cf6] bg-[#efe8ff]"
        : mood === "Lucid"
          ? "text-[#2563eb] border-[#2563eb] bg-[#e8f0ff]"
          : "text-[#256f64] border-[#67b7a8] bg-[#e8fbf6]";

  return (
    <article className="relative overflow-hidden rounded-[8px] border border-[#c7bca7] bg-[#fffaf0] p-5 text-[#241b2f] shadow-[0_28px_90px_rgba(35,25,49,0.18)] sm:p-7">
      <div className="absolute right-[-120px] top-[-130px] h-80 w-80 rounded-full bg-[#d7cdfd]" />
      <div className="absolute bottom-[-150px] left-[-100px] h-96 w-96 rounded-full bg-[#c5efe7]" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#6f5d8f]">
              Dream Ledger
            </p>
            <h2 className="mt-4 max-w-3xl break-words text-5xl font-black leading-none sm:text-7xl">
              {title || "Untitled dream"}
            </h2>
          </div>
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[8px] border border-[#241b2f] bg-[#241b2f] text-[#fffaf0]">
            <CloudMoon className="h-9 w-9" />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className={`rounded-full border px-4 py-2 text-sm font-black ${accent}`}>
            {mood}
          </span>
          <span className="rounded-full border border-[#241b2f] bg-[#241b2f] px-4 py-2 text-sm font-black text-[#fffaf0]">
            On Base
          </span>
        </div>

        <section className="mt-7 rounded-[8px] border border-[#c7bca7] bg-[#fff4df] p-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#8b5cf6]" />
            <h3 className="text-xl font-black">Dream place</h3>
          </div>
          <p className="mt-3 break-words text-3xl font-black">{place || "Somewhere half-lit"}</p>
        </section>

        <section className="mt-4 rounded-[8px] border border-[#c7bca7] bg-[#fffcf6] p-5">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-[#8b5cf6]" />
            <h3 className="text-xl font-black">Fragment</h3>
          </div>
          <p className="mt-4 min-h-[190px] whitespace-pre-wrap text-2xl font-bold leading-10">
            {fragment || "Write the scene before it fades."}
          </p>
        </section>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[8px] border border-[#c7bca7] bg-[#fffcf6] p-4">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#6f5d8f]">
              Dreamer
            </p>
            <p className="mt-2 text-xl font-black">{shortAddress(dreamer)}</p>
          </div>
          <div className="rounded-[8px] border border-[#c7bca7] bg-[#fffcf6] p-4">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#6f5d8f]">
              Saved
            </p>
            <p className="mt-2 text-xl font-black">{formatDate(createdAt)}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function DreamLedgerApp() {
  const [dreamIdInput, setDreamIdInput] = useState("1");
  const [title, setTitle] = useState("Glass Staircase");
  const [mood, setMood] = useState<(typeof MOODS)[number]>("Lucid");
  const [place, setPlace] = useState("A quiet station above the ocean");
  const [fragment, setFragment] = useState(
    "I found a staircase made of glass. Every step played a soft note, and the train below waited without tracks.",
  );
  const [status, setStatus] = useState("Save a dream fragment before it fades.");
  const [lastAction, setLastAction] = useState<"create" | null>(null);

  const { address, chainId, connector, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnectAsync } = useDisconnect();
  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
    } catch {}
  }
  const { switchChain, isPending: switching } = useSwitchChain();
  const {
    data: hash,
    writeContractAsync,
    isPending: writing,
  } = useWriteContract();
  const { data: receipt, isLoading: confirming } = useWaitForTransactionReceipt({ hash });

  const selectedConnector =
    connectors.find((connector) => connector.id === "injected") ??
    connectors.find((connector) => connector.id === "baseAccount") ??
    connectors[0];
  const parsedDreamId = BigInt(Math.max(1, Number(dreamIdInput || "1")));

  const dreamQuery = useReadContract({
    abi: dreamLedgerAbi,
    address: dreamLedgerContractAddress,
    functionName: "getDream",
    args: [parsedDreamId],
    query: {
      enabled: Boolean(dreamLedgerContractAddress),
      refetchInterval: 12000,
    },
  });

  const totalQuery = useReadContract({
    abi: dreamLedgerAbi,
    address: dreamLedgerContractAddress,
    functionName: "nextDreamId",
    query: {
      enabled: Boolean(dreamLedgerContractAddress),
      refetchInterval: 12000,
    },
  });

  const tuple = dreamQuery.data as
    | readonly [Address, string, string, string, string, bigint]
    | undefined;

  const liveDream = useMemo(
    () =>
      tuple
        ? {
            dreamer: tuple[0],
            title: tuple[1],
            mood: tuple[2],
            place: tuple[3],
            fragment: tuple[4],
            createdAt: tuple[5],
          }
        : undefined,
    [tuple],
  );

  const totalDreams = totalQuery.data ? Math.max(Number(totalQuery.data) - 1, 0) : 0;
  const validFields =
    title.trim().length > 0 &&
    title.trim().length <= MAX_TITLE_LENGTH &&
    mood.trim().length > 0 &&
    mood.trim().length <= MAX_MOOD_LENGTH &&
    place.trim().length > 0 &&
    place.trim().length <= MAX_PLACE_LENGTH &&
    fragment.trim().length > 0 &&
    fragment.trim().length <= MAX_FRAGMENT_LENGTH;

  const createBlocker = !dreamLedgerContractAddress
    ? "Contract not deployed yet. Run npm run deploy:contract, then add NEXT_PUBLIC_DREAM_LEDGER_CONTRACT_ADDRESS."
    : !isConnected
      ? "Connect wallet first."
      : chainId !== base.id
        ? "Switch to Base first."
        : !validFields
          ? "Fill title, mood, place, and fragment."
          : "";

  useEffect(() => {
    if (!receipt || lastAction !== "create") return;

    void totalQuery.refetch();
    void dreamQuery.refetch();

    const logs = parseEventLogs({
      abi: dreamLedgerAbi,
      logs: receipt.logs,
      eventName: "DreamSaved",
    });
    const dreamId = logs[0]?.args.dreamId;

    window.setTimeout(() => {
      if (dreamId) setDreamIdInput(dreamId.toString());
      setStatus(
        dreamId
          ? `Dream #${dreamId.toString()} saved on Base.`
          : "Dream saved on Base. Load the newest Dream ID.",
      );
    }, 0);
  }, [dreamQuery, lastAction, receipt, totalQuery]);

  async function connectWallet() {
    const connectorQueue = [
      connectors.find((connector) => connector.id === "injected"),
      connectors.find((connector) => connector.id === "baseAccount"),
      selectedConnector,
    ]
      .filter((connector): connector is NonNullable<typeof selectedConnector> =>
        Boolean(connector),
      )
      .filter(
        (connector, index, queue) =>
          queue.findIndex((item) => item.id === connector.id) === index,
      );

    if (connectorQueue.length === 0) {
      setStatus("No wallet connector found. Open this app inside Base App or a wallet browser.");
      return;
    }

    let lastError: unknown;
    setStatus("Opening wallet connection...");

    for (const connector of connectorQueue) {
      try {
        await connectAsync({ connector });
        setStatus("Wallet connected. Save a dream when ready.");
        return;
      } catch (error) {
        lastError = error;
      }
    }

    setStatus(friendlyError(lastError));
  }

  async function saveDream() {
    const contractAddress = dreamLedgerContractAddress;

    if (createBlocker) {
      setStatus(createBlocker);
      return;
    }

    if (!contractAddress) {
      setStatus("Contract not deployed yet. Run npm run deploy:contract first.");
      return;
    }

    try {
      setLastAction("create");
      setStatus("Confirm your dream in your wallet.");
      await writeContractAsync({
        address: contractAddress,
        abi: dreamLedgerAbi,
        functionName: "saveDream",
        args: [title.trim(), mood.trim(), place.trim(), fragment.trim()],
        chainId: base.id,
      });
      setStatus("Dream sent. Waiting for Base confirmation...");
    } catch (error) {
      setStatus(friendlyError(error));
    }
  }

  const previewTitle = liveDream?.title || title;
  const previewMood = liveDream?.mood || mood;
  const previewPlace = liveDream?.place || place;
  const previewFragment = liveDream?.fragment ?? fragment;

  return (
    <main className="min-h-screen bg-[#f4efe7] text-[#241b2f]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[390px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[8px] border border-[#c7bca7] bg-[#fffaf0] p-4 shadow-[0_20px_80px_rgba(35,25,49,0.14)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#6f5d8f]">
                Dream Ledger
              </p>
              <h1 className="mt-2 text-4xl font-black leading-none">
                Save a dream fragment.
              </h1>
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] border border-[#241b2f] bg-[#d7cdfd]">
              <Moon className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[8px] border border-[#c7bca7] bg-[#fff4df] p-3">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#6f5d8f]">
                Dreams
              </p>
              <p className="mt-2 text-3xl font-black">{totalDreams}</p>
            </div>
            <div className="rounded-[8px] border border-[#c7bca7] bg-[#241b2f] p-3 text-[#fffaf0]">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#d7cdfd]">
                Chain
              </p>
              <p className="mt-2 text-xl font-black">Base</p>
            </div>
          </div>

          <section className="mt-4 rounded-[8px] border border-[#c7bca7] bg-[#fff4df] p-4">
            <h2 className="text-xl font-black">New dream</h2>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#6f5d8f]">
                  Title
                </span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={MAX_TITLE_LENGTH}
                  className="mt-1 w-full rounded-[8px] border border-[#c7bca7] bg-[#fffcf6] px-3 py-3 font-black outline-none"
                />
              </label>

              <div>
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#6f5d8f]">
                  Mood
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {MOODS.map((value) => (
                    <button
                      key={value}
                      className={`rounded-[8px] border px-2 py-3 text-sm font-black ${
                        value === mood
                          ? "border-[#241b2f] bg-[#241b2f] text-[#fffaf0]"
                          : "border-[#c7bca7] bg-[#fffcf6]"
                      }`}
                      onClick={() => setMood(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#6f5d8f]">
                  Dream place
                </span>
                <input
                  value={place}
                  onChange={(event) => setPlace(event.target.value)}
                  maxLength={MAX_PLACE_LENGTH}
                  className="mt-1 w-full rounded-[8px] border border-[#c7bca7] bg-[#fffcf6] px-3 py-3 font-bold outline-none"
                />
              </label>

              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#6f5d8f]">
                  Fragment
                </span>
                <textarea
                  value={fragment}
                  onChange={(event) => setFragment(event.target.value)}
                  maxLength={MAX_FRAGMENT_LENGTH}
                  rows={5}
                  className="mt-1 w-full rounded-[8px] border border-[#c7bca7] bg-[#fffcf6] px-3 py-3 text-sm font-bold leading-6 outline-none"
                />
              </label>
            </div>
          </section>

          <div className="mt-4 space-y-3">
            {isConnected && chainId !== base.id ? (
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#241b2f] bg-[#d7cdfd] px-4 py-3 font-black disabled:opacity-60"
                disabled={switching}
                onClick={() => switchChain({ chainId: base.id })}
              >
                {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Switch to Base
              </button>
            ) : (
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#241b2f] px-4 py-3 font-black text-[#fffaf0] disabled:opacity-60"
                disabled={writing || confirming}
                onClick={saveDream}
              >
                {writing || confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Save Dream
              </button>
            )}

            {isConnected ? (
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#c7bca7] bg-[#fffcf6] px-4 py-3 font-black"
                onClick={disconnectWallet}
              >
                {shortAddress(address)}
              </button>
            ) : (
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#c7bca7] bg-[#fffcf6] px-4 py-3 font-black disabled:opacity-60"
                disabled={!selectedConnector || connecting}
                onClick={connectWallet}
              >
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                Connect wallet
              </button>
            )}

            <p className="rounded-[8px] border border-[#c7bca7] bg-[#fffcf6] px-3 py-3 text-sm font-bold leading-6">
              {status}
            </p>
            {hash ? (
              <a
                className="block rounded-[8px] border border-[#c7bca7] bg-[#241b2f] px-3 py-3 text-xs font-black leading-5 text-[#d7cdfd] underline"
                href={`https://basescan.org/tx/${hash}`}
                rel="noreferrer"
                target="_blank"
              >
                View transaction on BaseScan
              </a>
            ) : null}
            {createBlocker && isConnected ? (
              <p className="rounded-[8px] border border-[#c7bca7] bg-[#fff4df] px-3 py-3 text-xs font-bold leading-5">
                {createBlocker}
              </p>
            ) : null}
          </div>
        </aside>

        <section className="grid gap-4">
          <DreamPage
            title={previewTitle}
            mood={previewMood}
            place={previewPlace}
            fragment={previewFragment}
            dreamer={liveDream?.dreamer}
            createdAt={liveDream?.createdAt}
          />

          <div className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
            <div className="rounded-[8px] border border-[#c7bca7] bg-[#fffaf0] p-4">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                <h2 className="text-2xl font-black">Load dream</h2>
              </div>
              <label className="mt-4 block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#6f5d8f]">
                  Dream ID
                </span>
                <input
                  value={dreamIdInput}
                  onChange={(event) =>
                    setDreamIdInput(event.target.value.replace(/\D/g, ""))
                  }
                  className="mt-1 w-full rounded-[8px] border border-[#c7bca7] bg-[#fffcf6] px-3 py-3 text-2xl font-black outline-none"
                />
              </label>
            </div>

            <div className="rounded-[8px] border border-[#c7bca7] bg-[#fffaf0] p-4">
              <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#6f5d8f]">
                What it does
              </p>
              <p className="mt-3 max-w-xl text-sm font-bold leading-6">
                Dream Ledger saves a dream title, mood, place, fragment,
                dreamer wallet, and timestamp on Base.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#c7bca7] bg-[#fffcf6] px-3 py-2 text-xs font-black">
                  <Stars className="h-4 w-4 text-[#8b5cf6]" /> Dream fragment
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#c7bca7] bg-[#fffcf6] px-3 py-2 text-xs font-black">
                  <Moon className="h-4 w-4 text-[#8b5cf6]" /> Mood tag
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
