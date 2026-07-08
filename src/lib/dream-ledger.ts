import type { Address } from "viem";

export const MAX_TITLE_LENGTH = 42;
export const MAX_MOOD_LENGTH = 18;
export const MAX_PLACE_LENGTH = 42;
export const MAX_FRAGMENT_LENGTH = 220;

export const dreamLedgerAbi = [
  {
    type: "event",
    name: "DreamSaved",
    inputs: [
      { name: "dreamId", type: "uint256", indexed: true },
      { name: "dreamer", type: "address", indexed: true },
      { name: "title", type: "string", indexed: false },
      { name: "mood", type: "string", indexed: false },
    ],
  },
  {
    type: "function",
    name: "saveDream",
    stateMutability: "nonpayable",
    inputs: [
      { name: "title", type: "string" },
      { name: "mood", type: "string" },
      { name: "place", type: "string" },
      { name: "fragment", type: "string" },
    ],
    outputs: [{ name: "dreamId", type: "uint256" }],
  },
  {
    type: "function",
    name: "getDream",
    stateMutability: "view",
    inputs: [{ name: "dreamId", type: "uint256" }],
    outputs: [
      { name: "dreamer", type: "address" },
      { name: "title", type: "string" },
      { name: "mood", type: "string" },
      { name: "place", type: "string" },
      { name: "fragment", type: "string" },
      { name: "createdAt", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "nextDreamId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

function isAddressLike(value?: string) {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value));
}

const configuredDreamLedgerContractAddress =
  process.env.NEXT_PUBLIC_DREAM_LEDGER_CONTRACT_ADDRESS?.trim();

export const dreamLedgerContractAddress = isAddressLike(
  configuredDreamLedgerContractAddress,
)
  ? (configuredDreamLedgerContractAddress as Address)
  : undefined;
