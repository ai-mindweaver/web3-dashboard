# PRD: Web3 Dashboard Demo

> 这是喂给 Claude Code 的需求文档。需求写得越清楚,AI 产出质量越高。

## 产品定位

一个极简的 Web3 前端 dApp,作为 AI 协作开发流程的练习载体。功能不求多,但要覆盖典型 Web3 前端场景:钱包连接、链上数据读取、UI 组件使用、状态管理。

## 核心功能

### 1. Home 首页(`/`)

**未连接钱包时**:

- 居中展示产品 logo + slogan
- 一个显眼的 "Connect Wallet" 按钮(用 RainbowKit 的 `ConnectButton`)
- 底部列出支持的链图标

**已连接钱包时**:

- 顶部显示账户卡片:
  - 地址(缩略显示:`0x1234...5678`,点击复制)
  - ENS 名字(如果有)
  - 当前链名字 + 图标
  - 原生代币余额(如 ETH、MATIC)
- 下方显示 3 个快捷入口卡片:
  - "查询 Token" → 跳到 `/token`
  - "设置" → 跳到 `/settings`
  - "查看最近交易"(这个暂时只显示 "Coming Soon")

### 2. Token 查询页(`/token`)

**功能**:

- 一个输入框,让用户贴入任意 ERC20 合约地址
- 一个 "查询" 按钮
- 查询后展示:
  - Token 名字(`name()`)
  - Token 符号(`symbol()`)
  - 小数位(`decimals()`)
  - Token 总供应量(`totalSupply()`,按 decimals 格式化)
  - **当前钱包的余额**(`balanceOf(user)`,按 decimals 格式化)

**边界情况**:

- 地址格式错误 → 显示 "无效地址"
- 不是 ERC20 合约 → 显示 "该地址不是有效的 ERC20 合约"
- 用户未连接钱包 → 余额显示 "请先连接钱包"
- 加载中 → 显示 loading 状态
- 查询失败 → 显示错误信息,有重试按钮

**预置示例**:
页面底部放几个"试试这些"的按钮,预置几个知名 token 地址(比如 Sepolia 上的测试 USDC),点一下自动填入并查询。

### 3. Settings 设置页(`/settings`)

**功能**:

- **主题切换**: 深色 / 浅色 / 跟随系统(用 Radix 的 `RadioGroup`)
- **默认链选择**: 用 Radix 的 `Select` 展示支持的链列表
- **关于**: 展示项目信息、GitHub 链接、版本号
- 一个 "断开钱包" 按钮(带 Radix `AlertDialog` 二次确认)

## 技术要求

### 技术栈(必须)

- **Next.js 16+** (App Router)
- **React 19+**
- **TypeScript 5+**(strict mode)
- **Tailwind CSS 3+**
- **wagmi v2** + **viem v2**
- **RainbowKit v2**(钱包连接)
- **@tanstack/react-query v5**(wagmi v2 peer dep)
- **Radix UI**(UI primitive)
- **classnames**(class 合并)
- **pnpm**(包管理器)

### 支持的链

- Ethereum Mainnet(只读,用于 ENS)
- Sepolia(测试网,主要交互链)
- Base
- Arbitrum

### 设计要求

- **响应式**: 手机、平板、桌面三套断点都能正常显示
- **深浅色主题**: 用 Tailwind 的 `dark:` 变体实现,初始跟随系统
- **一致的设计 token**: 颜色、间距、圆角、字号要用 Tailwind 配置统一管理
- **无障碍**: 所有交互元素有 keyboard focus 状态,颜色对比度达标(Radix 组件自带)
- **简约风**: 不要花哨,clean 为主。参考 Linear、Vercel 的设计感

### 性能要求

- Lighthouse 分数: Performance > 90, Accessibility > 95
- 首屏 JS bundle < 300KB(gzipped)
- 链上数据要有合理缓存(react-query 默认的 staleTime 策略够用)

### 代码质量要求

- TypeScript **strict mode**,禁用 `any`
- 所有链上调用必须处理 `loading / error / success` 三态
- 组件 props 用 `interface` 声明,exported
- 所有用户可见文案集中管理(方便后续做 i18n)
- 工具函数有 JSDoc 注释

## 不做的事(明确范围)

- **不做多语言 i18n**(结构上为未来预留,但不实际翻译)
- **不做后端**:纯前端,所有数据都来自链上
- **不做账号系统**:钱包连接就是身份
- **不做交易签名**:只读,不写
- **不做复杂状态管理**:react-query 和 wagmi 自带的就够
- **不做 E2E 测试**:单元测试即可

## 成功标准

完成后,项目应该:

1. `pnpm dev` 能跑起来,钱包能连上
2. 三个页面功能都正常
3. `pnpm typecheck && pnpm lint && pnpm build` 全部通过
4. 手机浏览器访问不崩
5. 深浅色切换正常
6. 有基本的单元测试(至少 5 个测试用例)
7. `CLAUDE.md` 与实际代码吻合(这是关键!随着项目发展要同步更新)

## 环境变量

```env
# WalletConnect Project ID(必填,从 https://cloud.walletconnect.com 申请,免费)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=

# 应用名字(显示在钱包连接弹窗里)
NEXT_PUBLIC_APP_NAME=Web3 Dashboard Demo

# 是否启用测试网(默认 true)
NEXT_PUBLIC_ENABLE_TESTNETS=true

# 可选:Alchemy / Infura API Key(没有也能跑,但会用公共 RPC 被限流)
NEXT_PUBLIC_ALCHEMY_API_KEY=
```

## 参考资源

搭建过程中 Claude Code 可以参考:

- RainbowKit 文档: https://rainbowkit.com/docs/installation
- wagmi v2 文档: https://wagmi.sh
- viem 文档: https://viem.sh
- Radix UI 文档: https://www.radix-ui.com/primitives/docs
- Next.js App Router: https://nextjs.org/docs/app
