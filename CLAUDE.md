# CLAUDE.md

> 这是给 AI 协作者(Claude Code 等)的项目规范文档。Claude Code 会自动读取它。
> 本文档也是人类新成员的入职指南。修改后请确保团队成员和 AI 都了解变化。

## 项目概述

- **产品名称**: Web3 Dashboard Demo
- **一句话描述**: 一个极简的 Web3 dApp,支持钱包连接、账户展示、ERC20 token 查询
- **目标**: 作为 AI 协作流程的练习载体,同时产出一个可用的 Web3 前端模板

## 技术栈

- **框架**: Next.js 16+ (App Router)
- **语言**: TypeScript 5+ (strict mode)
- **样式**: Tailwind CSS 3+
- **类名合并**: classnames(通过 `src/lib/cn.ts` 封装)
- **UI 组件**: Radix UI primitives(自己包一层)
- **Web3**:
  - wagmi v2(React hooks)
  - viem v2(底层 Ethereum client)
  - RainbowKit v2(钱包 UI)
  - @tanstack/react-query v5(wagmi 的 peer dep)
- **包管理器**: pnpm(请勿用 npm/yarn)
- **测试**: vitest + @testing-library/react(可选,Task 6)

## 支持的链

- Ethereum Mainnet(只读,主要用于 ENS)
- Sepolia(测试网,主要交互链)
- Base
- Arbitrum

## 目录结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx          # 根 layout
│   ├── providers.tsx       # 所有 Provider("use client")
│   ├── page.tsx            # 首页
│   ├── token/
│   │   └── page.tsx        # Token 查询页
│   └── settings/
│       └── page.tsx        # 设置页
│
├── components/
│   ├── ui/                 # 通用 UI 原语(基于 Radix 封装)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Dialog.tsx
│   │   └── index.ts        # barrel export
│   └── wallet/             # 钱包相关组件
│       ├── AccountCard.tsx
│       ├── AddressDisplay.tsx
│       └── ChainBadge.tsx
│
├── features/               # 按业务域组织的功能代码
│   ├── token/
│   │   ├── TokenQueryForm.tsx
│   │   ├── TokenInfoCard.tsx
│   │   └── ExamplePresets.tsx
│   └── settings/
│       ├── ThemeSwitch.tsx
│       ├── DefaultChainSelect.tsx
│       └── DisconnectButton.tsx
│
├── hooks/                  # 自定义 React hooks
│   ├── use-account-info.ts
│   ├── use-token-info.ts
│   └── use-theme.ts
│
└── lib/                    # 工具函数、配置、常量
    ├── cn.ts               # classnames 封装
    ├── wagmi.ts            # wagmi 配置(getDefaultConfig)
    ├── chains.ts           # 链的元数据
    ├── format.ts           # 格式化工具(地址、金额)
    └── abis/
        └── erc20.ts        # ERC20 标准 ABI
```

### 模块放哪里的判断标准

- 只在一个页面用的组件 → `features/<业务域>/`
- 跨页面复用的 UI 原语 → `components/ui/`
- 跨页面复用的业务组件 → `components/<业务域>/`
- 纯逻辑 hook → `hooks/`
- 纯函数工具 → `lib/`

## 代码规范

### TypeScript

- **strict mode 必须开启**,`tsconfig.json` 里 `"strict": true`
- **禁用 `any`**: 不确定的类型用 `unknown` + 类型守卫
- **禁用 `@ts-ignore` 和 `@ts-expect-error`**(除非有详细注释说明为什么必须)
- **组件 props 用 `interface`** 定义,并 `export` 方便复用
- **返回类型尽量显式标注**,特别是导出的函数
- **优先用类型推导,但关键处要显式**:
  - ✅ 函数参数必须显式
  - ✅ 导出的函数返回类型显式
  - ❌ 内部局部变量不用显式(影响可读性)

### React / Next.js

- **组件用 function 声明**,不用箭头函数:

  ```tsx
  // ✅ 推荐
  export function Button(props: ButtonProps) { ... }

  // ❌ 不推荐
  export const Button = (props: ButtonProps) => { ... }
  ```

- **明确区分 Server Component 和 Client Component**:
  - 使用 wagmi hook / Radix / 用户交互的组件必须是 Client(`"use client"` 开头)
  - 纯展示、纯数据的可以是 Server Component
- **`"use client"` 放在文件第一行**,之前不能有其他代码(注释除外)
- **避免 hydration mismatch**: SSR 时不知道钱包状态,初始值要和客户端一致
- **事件处理函数命名**: `handleXxx`(定义时)/ `onXxx`(作为 prop 时)

### Tailwind + classnames

- **类名合并统一用 `cn()`**(来自 `src/lib/cn.ts`):

  ```tsx
  import { cn } from "@/lib/cn";

  <button
    className={cn(
      "px-4 py-2 rounded-md",
      "bg-primary-500 text-white",
      "hover:bg-primary-600",
      className, // 允许外部覆盖
    )}
  />;
  ```

- **深浅色用 `dark:` 变体**,不要用 JS 条件渲染
- **复杂 variant 抽成独立函数**,不要堆在 className 里
- **响应式断点**: `sm:` (640px) / `md:` (768px) / `lg:` (1024px) / `xl:` (1280px)
- **颜色不要 hardcode**:统一用 `tailwind.config.ts` 里定义的设计 token

### 文件命名

- **组件文件**: PascalCase,如 `AccountCard.tsx`
- **hook 文件**: kebab-case 带 use 前缀,如 `use-account-info.ts`
- **工具文件**: kebab-case,如 `format.ts`、`cn.ts`
- **页面**: Next.js 约定,`page.tsx`、`layout.tsx`
- **测试文件**: `<源文件名>.test.ts`,与源文件同目录

## Web3 特定规则(重点!)

### wagmi v2 的 API(不要搞错)

| v1 (过时)                 | v2 (当前)                           |
| ------------------------- | ----------------------------------- |
| `useContractRead`         | `useReadContract`                   |
| `useContractWrite`        | `useWriteContract`                  |
| `useContractReads`        | `useReadContracts`                  |
| `useContractEvent`        | `useWatchContractEvent`             |
| `usePrepareContractWrite` | ❌ 已移除,直接用 `useWriteContract` |
| `WagmiConfig`             | `WagmiProvider`                     |
| `configureChains`         | ❌ 已移除                           |

**如果你不确定某个 API 是 v1 还是 v2,查 https://wagmi.sh/react/api/hooks**

### 链上调用必须处理三态

```tsx
const { data, isLoading, isError, error, refetch } = useReadContract({ ... })

if (isLoading) return <Loading />
if (isError) return <ErrorCard error={error} onRetry={refetch} />
if (!data) return null  // 或者默认状态

return <TokenInfo data={data} />
```

**不允许**: 假设数据一定存在、不处理 loading、不处理 error。

### 地址处理

- **校验地址**: 用 viem 的 `isAddress(addr)`,不要用正则
- **显示地址**: 用我们自己的 `formatAddress(addr, 4)` → `0x1234...5678`
- **checksum 大小写**: 用 viem 的 `getAddress()` 统一成 EIP-55 格式
- **永远不要 hardcode 地址**: 合约地址要么来自用户输入,要么来自 `lib/chains.ts` 的配置

### 金额处理

- **链上返回都是 `bigint`**,显示前用 `formatUnits(amount, decimals)` 格式化
- **注意**: React 不能直接渲染 bigint,会报错。必须先转字符串
- **用户输入数字 → 链上调用**: 用 `parseUnits(str, decimals)` 转回 bigint
- **永远不要用 `Number()` 转 bigint**: 精度会丢

### ENS

- **ENS 只在主网有**: 其他链 `useEnsName` 返回 null,要正确处理
- **避免在非主网 query ENS**: `useEnsName({ address, chainId: 1 })` 显式指定 chainId

### SSR 和钱包状态

- **服务端不知道钱包连接状态**,初始 render 要中性
- **不要写 "如果没连接显示 A,连接了显示 B"** 的条件在 SSR 里 — 会 hydration mismatch
- **方案**: 用 `useIsMounted` hook 或者 wagmi 的 `useAccount` 配合 `isConnected + isMounted`

## 不要做的事(黑名单)

- ❌ **不要用 npm 或 yarn**,统一 pnpm
- ❌ **不要引入 ethers.js**(和 viem 会冲突,选一个)
- ❌ **不要引入新的状态管理库**(Zustand、Jotai、Redux 都不要),react-query + React state 够用
- ❌ **不要引入 CSS-in-JS 库**(styled-components、emotion),我们用 Tailwind
- ❌ **不要引入 UI 组件库**(shadcn/ui 除外可以参考实现,但我们自己写)
- ❌ **不要在 Server Component 里用 wagmi hook**
- ❌ **不要把环境变量 hardcode 在代码里**
- ❌ **不要提交 `.env.local`** (已在 .gitignore)
- ❌ **不要用 v1 的 wagmi API**(见上表)
- ❌ **不要修改 `src/lib/abis/` 里的文件内容**,除非要加新合约
- ❌ **不要用 `class` 组件**,统一 function 组件
- ❌ **不要嵌套过深的三元表达式**(超过 2 层就抽出来)

## 命令速查

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm build            # 生产构建
pnpm start            # 启动生产服务器

# 质量检查
pnpm typecheck        # TypeScript 类型检查(tsc --noEmit)
pnpm lint             # ESLint 检查
pnpm lint:fix         # ESLint 自动修复
pnpm test             # 跑测试(如果有)
pnpm test:watch       # 测试 watch 模式

# 全量检查(提交前跑)
pnpm typecheck && pnpm lint && pnpm build
```

## 环境变量

所有环境变量必须在 `.env.example` 里列出,并写注释说明用途。客户端可访问的变量必须以 `NEXT_PUBLIC_` 开头。

| 变量                                    | 必填 | 说明                                                          |
| --------------------------------------- | ---- | ------------------------------------------------------------- |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | 是   | WalletConnect Project ID,https://cloud.walletconnect.com 申请 |
| `NEXT_PUBLIC_APP_NAME`                  | 是   | 应用名字,显示在钱包连接弹窗                                   |
| `NEXT_PUBLIC_ENABLE_TESTNETS`           | 否   | `true` / `false`,是否启用测试网                               |
| `NEXT_PUBLIC_ALCHEMY_API_KEY`           | 否   | 用自己的 RPC,不填用公共节点(被限流)                           |

## Git 约定

- **分支命名**:
  - `ai/task-N-xxx` — AI 协作任务
  - `feat/xxx` — 人类新功能
  - `fix/xxx` — 人类修 bug
  - `chore/xxx` — 杂务
- **Commit message**: Conventional Commits(`feat:`、`fix:`、`chore:` 等)
- **AI 主导的 commit 加 `Co-Authored-By: Claude <noreply@anthropic.com>` trailer**
- **一个 PR 聚焦一件事**,不要顺手改无关代码
- **PR 描述必填**:改了什么、为什么、怎么测的、风险点

## AI 协作者注意事项(给 Claude 的话)

- **做事前先读 PRD 和当前 Task 清单**(在 `docs/01-PRD.md` 和 `docs/02-TASKS.md`)
- **不确定就问,不要瞎猜**。特别是业务逻辑、设计决策
- **不要做范围外的事**。如果发现应该改但不在当前 Task 范围内,记录下来但不动手,等下一个 Task 专门处理
- **完成一步汇报一步进度**,不要闷头干一大堆
- **每次改完 `pnpm typecheck && pnpm lint` 自己跑一下**,有错先修
- **不要自行 commit**,每次让人类 review 后再提交
- **如果发现本文档(CLAUDE.md)里的规则有冲突或不清楚的地方,提出来,一起修订**

## 文档维护

本文档是"活文档",随项目发展而更新:

- 发现新的约定 → 立刻加进来
- 某条规则不再适用 → 删掉或修改
- Claude 反复犯同类错 → 说明这里的规则不够具体,要补

**更新频率**: 每完成一个 Task 后花 5 分钟看看要不要更新。
