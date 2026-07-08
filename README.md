# Dream Ledger

这个仓库不讲虚的。它对应一个已经部署的 Base 小应用，方向是：dream fragments。用户要做的事也很短：连接钱包，writing down a strange memory，拿到一个 dream line。

## 公开证明

不用邮箱来证明。看下面这些就够了：

| Field | Value |
| --- | --- |
| Base Developer Dashboard | Registered |
| Build ID / Base App ID | `6a08030ebc175abcdd5651cb` |
| Builder Wallet | `0xB0B7A0905d046DA716830B1161d69354753B1D70` |
| Builder Code | `bc_6j4s58ed` |
| Live Demo | https://dream-ledger.vercel.app |
| GitHub Repository | https://github.com/JulietteGibson/dream-ledger-base-dapp |
| Network | Base |
| Deployment | Vercel |

## 本地跑

```bash
npm install
npm run dev
```

技术栈：React app router, wallet hooks, Base network config, Vercel deployment。

敏感信息不要进 Git：Do not commit `.env`, private keys, seed phrases, RPC keys, GitHub tokens, or Vercel tokens. Use `.env.example` only for placeholders.

MIT。
