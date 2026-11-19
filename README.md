# qq-farm-docker

QQ 农场助手的通用 **Docker / 群晖 NAS** 版本，基于 [Maksim-venus/qq-farm-bot-fnos](https://github.com/Maksim-venus/qq-farm-bot-fnos)（飞牛 fnOS 原生 fork）继续改造。

上游链：[liyangpengs/qq-farm-bot](https://github.com/liyangpengs/qq-farm-bot) → Maksim 飞牛 fork → 本仓库。核心玩法来自上游；飞牛原生适配与额外玩法来自 Maksim；本仓库主要补了 Docker 打包和少量配置项。

- **Docker 运行**：根目录 `Dockerfile` + `docker-compose.yml`，Node 22 三段构建，直接监听 TCP `3007`，不依赖飞牛网关 / Unix Socket。
- **数据持久化**：`./data:/app/core/data`，账号、日志、配置都在宿主机 `data/` 目录，重建镜像不丢。
- **保留飞牛 fork 功能**：大小号协作、偷收比、图鉴自动、游戏公告、Bark 推送等。
- **本仓库额外改动**：
  - 重新添加登录权鉴，可改账号密码。
  - 账号设置入口修复，uin 显示为「微信账号」。
- **奶茶自动化已下架**：上游 2026.11.15 起删除飞牛 fork 的奶茶自动雇佣 / 工作 / 领取收益 / 森野种子兑换 / 自动制作 / 工资 / 店铺升级（本仓库跟随上游删除），奶茶相关操作改用活动页手动完成。



设置类功能**按账号分别设置，默认关闭**。

「设置 → 大小号协作」：

- **大号/小号**：把账号设为小号并从好友中选择大号后，可打开「成熟作物先留给大号偷」（默认开）：小号的成熟作物先留给大号偷，检测到大号偷过才自动收获，可设置超时后仍收获；关掉则小号正常收获自己的地。手动收获不受限制。
- **不偷大号的菜**：小号自动巡查好友时不偷大号。
- **只给大号放捣乱**：小号的放草、放虫只对大号做，不对其他好友做（「自动捣乱」关着也会对大号放）；帮大号时有草/虫的地不帮，留给大号自己清。
- **偷收比**：生涯偷菜 ÷ 生涯收获 × 100%（与好友卡片「收偷比」同一组数据）。阈值默认 80%，超过才触发。可单独打开：拒绝高偷收比好友申请、好友页按偷收比筛选、高偷收比好友来偷菜时用现有 Bark 推送、自动删除高偷收比好友（大小号协作里的大号和小号不删）。四项默认关。
- **在线期间来偷菜的自动删除**（默认关，与偷收比阈值无关）：程序正在运行且这次上线之后，有好友来偷菜就删除。掉线、程序停止，以及重连后补拉到的历史记录不删。不删大号、本机登录过的小号。两次删除至少间隔 1 分钟。

「设置 → 活动设置」：

- （奶茶自动雇佣、被雇佣后自动工作、收益自动领取、森野种子自动兑换、自动制作奶茶、自动领取工资、店铺自动升级均已随上游 2026.11.15 下架，不再提供）
- **图鉴奖励自动领取**：约每 10 分钟检查作物图鉴、变异图鉴，有可领的等级奖励就领取。
- **自动完成图鉴**：找出作物图鉴里未收藏、背包里没有种子、地里也没种着的作物，从种子商店买 1 个种子（只买已解锁、等级够、不需要解锁卡、未售罄且金币够的；每次检查最多买 1 个，同时最多 2 个待种，同一种子最多自动买 3 次），下次自动播种时先把它种下，种下或收藏后恢复原来的播种顺序。会花金币，需要打开自动种植。

「设置 → 策略设置」：

- **背包种子优先顺序：改序号、拖动排序**：每行左边的序号可以点一下直接改，输入目标位置后回车或点别处即移过去，其他种子依次顺延（超出范围按第 1 位或最后一位算，输错了恢复原序号）；也可以按住序号右侧、上下箭头左边的拖动手柄（六个点）拖到想要的位置，拖动时有插入位置提示线和「移到第 N 位」气泡，拖到列表上下边缘会自动滚动。手机上只有按住手柄才拖动，其他地方照常滑动页面。原来的上/下箭头仍保留。

「设置 → 系统设置 → 下线提醒」（全局设置）：

- **Bark 静音也提醒（重要警告）**：推送渠道选 Bark 时出现此开关，默认开启。开启后账号掉线的提醒以 Bark「重要警告」发送（音量 5、铃声持续约 30 秒），手机静音或勿扰时也会响铃，「测试通知」同样按此设置发送；其他事件提醒仍为普通推送。需在 iPhone「设置 → 通知 → Bark」里允许「重要警告」。同时修复了 Bark（以及 PushPlus、WxPusher）推送成功却提示「测试失败: success」的问题。

「概览 → 运行日志」：

- **偷菜日志 / 报错日志分栏**：运行日志分为「全部」「偷菜日志」「报错日志」三栏，原来的过滤器照常可用。偷菜日志收录偷到菜的好友访问、巡查总结、小号给大号留菜的记录。报错日志收录错误和警告，可选只看错误或只看警告。偷菜、报错两类日志各自最多保留最近 1000 条，不会被普通日志挤掉。

「我的农场」：

- **地块卡片直接施肥**：每块地的卡片上有「普通肥」「有机肥」按钮，点一下只给这一块地施肥；当前不能施肥时按钮变灰，悬停可看原因（如「当前作物无需施肥」「有机化肥次数已用完」）。受「设置 → 自动控制 → 显示手动施肥按钮」控制，进入「选择土地」时隐藏。上游的选地批量施肥和一键施肥照常可用。

「页头」：

- **游戏公告（只读）**：页头的公告图标可查看当前账号的游戏公告标题列表，点开看全文、起止时间和封面图。只读取，不会替你标记已读；账号需已启动并登录。
- **界面固定浅色**：去掉深色模式和主题切换，界面始终为浅色。概览页「运行日志」卡片的底边与「今日统计」对齐，日志多时在卡片内滚动。

执行结果会写在日志里。详细说明见变更说明中的 2026.10.20.1、2026.10.21、2026.10.21.1、2026.10.21.2、2026.10.21.3、2026.10.21.4、2026.10.22、2026.10.22.1、2026.10.27、2026.10.27.1、2026.10.29、2026.10.29.1、2026.10.30、2026.10.31、2026.11.1、2026.11.2 和 2026.11.2.1 各节。

## 上游同步说明

- **上游主仓库**：[liyangpengs/qq-farm-bot](https://github.com/liyangpengs/qq-farm-bot)，本仓库 remote 名 `upstream`，所有功能改动都从这里直接合并。
- **中间层**：[Maksim-venus/qq-farm-bot-fnos](https://github.com/Maksim-venus/qq-farm-bot-fnos)，remote 名 `fnos`，只作参考对照，不再作为同步源。
- **同步策略**：直接 `merge upstream/master`；冲突处保留本仓库自有改动（Docker 打包、管理员鉴权、微信登录持久化、游戏公告、偷收比、背包种子、牧草补充配置等）。
- **最近同步**：`6ac7a3d`（2026-11-17，牧场工作台 + PR #135~#139 牧场修复）。
- **同步方式**：`scripts/sync-upstream.ps1`（见下），或手动 `git fetch upstream --prune` → `git merge upstream/master` → core `tsc --noEmit` 与 web `vite build` 校验后提交。

```powershell
# 仅同步并校验（需要代理时加 -Proxy http://127.0.0.1:7289）
.\scripts\sync-upstream.ps1 -Proxy http://127.0.0.1:7289

# 同步后顺带推送 origin/master
.\scripts\sync-upstream.ps1 -Proxy http://127.0.0.1:7289 -Push
```

## 安装（群晖 / NAS Docker）

```bash
git clone https://github.com/loftyaspiration/qq-farm-docker.git
cd qq-farm-docker
docker compose up -d --build
```

构建完成后访问 `http://<NAS-IP>:3007`。数据在仓库下的 `data/` 目录，升级重建镜像不会丢。

- 自定义端口：`PORT=3008 docker compose up -d --build`（compose 默认映射 `3007:3007`）。
- 本仓库仍保留 Maksim 的飞牛 FPK 原生包构建脚本 `fnos/build.sh`，但日常部署推荐用上面的 Docker 方式。
- 详细变更见 [`fnos/飞牛部署与变更说明.md`](fnos/飞牛部署与变更说明.md)。

## 许可

Compose 使用根目录作为构建上下文，Dockerfile 位于 `core/Dockerfile`。镜像构建阶段固定使用 Node `20.19.6` 和 pnpm `10.30.2`，通过 BuildKit 缓存 pnpm store，并在相互独立的阶段构建 Web、Core 和生产依赖；仅修改一侧源码时可直接复用另一侧缓存。运行阶段只保留生产依赖、编译产物、协议定义、游戏配置和 TSDK WASM。容器内部固定监听 `3007`，根目录 `.env` 中的 `PORT` 只用于宿主机端口映射。

依赖源默认使用 npm 官方源；网络受限时可以在根目录 `.env` 中覆盖构建参数后重新构建：

```dotenv
NPM_REGISTRY=https://registry.npmmirror.com/
```

如需显式指定基础镜像或 pnpm 版本，也可以配置 `NODE_IMAGE` 和 `PNPM_VERSION`。修改构建参数或排查旧缓存问题时请执行 `docker compose build --pull --no-cache`，确保重新拉取基础镜像并安装依赖。

### 二进制发布版

可从 [Releases](https://github.com/liyangpengs/qq-farm-bot/releases) 下载对应平台文件，也可以自行构建：

```bash
pnpm install
pnpm package:release
```

Windows x64、Linux x64、macOS Intel 和 macOS Apple Silicon 产物生成在 `core/dist/bin/`。运行后，程序会在可执行文件同级创建 `data/` 目录。

Linux 和 macOS 首次运行可能需要添加执行权限：

```bash
chmod +x ./qq-farm-bot
./qq-farm-bot
```

## 首次使用

1. 打开 Web 面板，使用 `admin` / `admin` 登录。
2. 进入“设置 → 系统设置”修改管理员密码。
3. 如需使用 QQ 扫码登录，先部署并启动 [qq-miniapp-auth](https://github.com/liyangpengs/qq-miniapp-auth) 服务，再在“设置 → 系统设置 → 登录设置”开启 QQ 扫码登录，并填写 NapCat 接口地址和接口签名。
4. 在设置页添加游戏账号，可使用有效 Code、微信扫码或 QQ扫码登录。
5. 为账号配置种植、自动化和好友策略，并按需设置实例级下线提醒。
6. 启动账号，在概览页确认连接状态、农场数据和实时日志。

Code 具有时效性；登录失败时应先重新获取 Code 或重新扫码。QQ 客户端被挤下线后，官方“重新登录”会签发新的 Code；可启动 QQFarmCodeHelper 的标准获取模式并开启自动同步，再点击官方“重新登录”，Helper 会更新匹配账号的 Code 并重新启动远程账号。协议监听模式只落盘抓包，永远不会自动上传 Code。

QQ 扫码登录依赖外部 [qq-miniapp-auth](https://github.com/liyangpengs/qq-miniapp-auth) 服务。登录设置中的 NapCat 接口地址需填写该服务的可访问地址，NapCat 接口签名需与其 `API_SIGNING_SECRET` 配置一致；两者会保存在本机数据目录中，由后端调用外部服务时读取。QQ 扫码登录默认关闭，开启前必须同时配置接口地址和签名。

## 配置说明

### 环境变量

| 变量 | 默认值 | 适用范围 | 说明 |
| --- | --- | --- | --- |
| `ADMIN_PORT` | `3007` | 源码、二进制 | Web 面板监听端口；Compose 容器内固定为 `3007` |
| `PORT` | `3007` | Docker Compose | 宿主机映射端口，从根目录 `.env` 读取 |
| `TZ` | `Asia/Shanghai` | Docker Compose | 容器时区 |
| `NODE_ENV` | `production` | Docker | Compose 当前固定为生产环境 |
| `LOG_LEVEL` | `info` | 后端 | 服务端日志级别 |

管理员账号不通过环境变量初始化。首次运行会自动创建 `admin` / `admin`，之后的管理员凭据保存在数据目录的 `admin.json` 中。项目不提供注册或新增管理员功能。

### 种植策略

| 策略值 | 面板名称 | 行为 |
| --- | --- | --- |
| `preferred` | 优先种植种子 | 优先使用指定种子，不可用时自动回退 |
| `level` | 最高等级作物 | 优先选择当前可种植的高等级作物 |
| `max_exp` | 最大经验/时 | 按单位时间经验选择，默认策略 |
| `max_fert_exp` | 最大普通肥经验/时 | 按普通肥条件下的单位时间经验选择 |
| `max_profit` | 最大净利润/时 | 按单位时间净利润选择 |
| `max_fert_profit` | 最大普通肥净利润/时 | 按普通肥条件下的单位时间净利润选择 |
| `bag_priority` | 背包种子优先 | 先按优先级消耗背包种子，再使用回退策略 |

### 施肥模式

| 模式值 | 面板名称 | 行为 |
| --- | --- | --- |
| `none` | 不施肥 | 新账号默认值，关闭自动施肥 |
| `smart` | 智能施肥（普通 + 有机催熟） | 常规使用普通肥，有机肥只在临近成熟时使用 |
| `both` | 普通 + 有机 | 同时使用普通肥和有机肥 |
| `normal` | 仅普通化肥 | 只使用普通化肥 |
| `organic` | 仅有机化肥 | 只使用有机化肥 |
| `normal_ripen` | 仅普通化肥催熟 | 只在临近成熟时用普通肥，播种后不提前施肥 |
| `organic_ripen` | 仅有机化肥催熟 | 只在临近成熟时用有机肥，播种后不提前施肥 |

已保存的施肥策略和催熟秒数保持不变。催熟策略共用土地范围和成熟时间阈值（默认 300 秒）。两个「仅催熟」策略每季独立判断，不受「多季补肥」开关影响；每次巡田最多发一条批量施肥请求。巡田施肥成功后复查一次土地，已经成熟的作物当轮收获，未成熟的留给下次巡田。手动施肥不受自动施肥策略限制。

### 图鉴配置

图鉴使用 `core/src/gameConfig/Illustrated.json` 和 `core/src/gameConfig/BuffCfg.json` 两份游戏配置：

| 配置 | 字段 | 说明 |
| --- | --- | --- |
| `Illustrated.json` | `param` | 与图鉴协议返回的果实 ID 对应 |
| `Illustrated.json` | `type` | 果实分类，包括普通果实、黄金果实、活动果实和装扮果实 |
| `Illustrated.json` | `illustrated_type` | 区分普通图鉴和超变图鉴 |
| `Illustrated.json` | `sort` | 图鉴中的展示顺序 |
| `BuffCfg.json` | `source_type` | 超变图鉴只展示 `超变升级`，隐藏 `活动加成` |
| `BuffCfg.json` | `source_param` | 触发该属性加成的图鉴等级 |
| `BuffCfg.json` | `attr_id` | 属性加成名称 |
| `BuffCfg.json` | `attr_value` | 大于 `10` 时为触发概率，小于 `10` 时为数量 |

概率值按千分值转换为百分比展示，例如 `100` 显示为 `10%`、`500` 显示为 `50%`；数量值直接展示，例如 `2` 显示为 `数量 +2`。当前加成会按属性名称取当前等级已生效的最新配置。

## 数据与备份

| 运行方式 | 数据位置 |
| --- | --- |
| 源码运行 | `core/data/` |
| 二进制运行 | 可执行文件同级的 `data/` |
| Docker | `/app/core/data`，映射到 `qq-farm-data` 命名卷 |

管理员凭据、游戏账号、配置、活动状态和日志都属于运行数据。升级、迁移或重新部署前，建议先停止服务并备份整个数据目录或 Docker 命名卷，而不是只复制单个 JSON 文件。

游戏账号属于当前实例，不带用户归属字段，也没有数量上限。下线提醒同样是实例级配置，对当前实例内的所有游戏账号生效。

## 项目结构

```text
qq-farm-bot/
├── core/                  # Node.js 后端、账号 Worker 与协议实现
│   ├── src/
│   │   ├── controllers/   # Web API 与鉴权路由
│   │   ├── core/          # 单账号 Worker 与任务调度
│   │   ├── runtime/       # 多账号运行时和状态同步
│   │   ├── services/      # 农场、好友、图鉴、活动、商城、微信登录等业务
│   │   ├── proto/         # Protocol Buffers 定义
│   │   ├── gameConfig/    # 作物、道具、等级、图鉴与属性加成等游戏配置
│   │   └── models/        # 超级管理员、游戏账号与配置持久化
│   └── data/              # 源码模式运行数据
├── web/                   # Vue 3 Web 面板
│   ├── src/components/    # 农场、图鉴、背包、任务、活动与基础组件
│   ├── src/stores/        # Pinia 状态管理
│   ├── src/views/         # 各功能页面
│   └── dist/              # 前端构建产物
├── docs/                  # 项目专题文档
├── tools/                 # 配置下载、图片下载与协议分析工具
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

## 开发命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 构建前端并启动后端开发服务 |
| `pnpm dev:web` | 启动 Vite 前端开发服务 |
| `pnpm dev:core` | 使用 `tsx` 启动后端 |
| `pnpm lint` | 检查并自动修复前后端代码风格 |
| `pnpm -C core typecheck` | 执行后端 TypeScript 类型检查 |
| `pnpm typecheck:web` | 执行前端 TypeScript 类型检查（不参与生产启动） |
| `pnpm build:web` | 构建 Web 面板到 `web/dist/` |
| `pnpm -C web build:compressed` | 构建 Web 并额外生成预压缩 `.gz` 文件 |
| `pnpm -C web build:analyze` | 构建 Web 并生成 bundle 分析报告 |
| `pnpm build:core` | 编译后端 TypeScript |
| `pnpm build` | 依次构建前端和后端 |
| `pnpm package:release` | 构建四个平台的独立二进制文件 |
| `pnpm -C core test` | 编译 Core 并运行抓包协议、活动和请求并发测试 |

### 清理构建产物

```bash
# Linux/macOS
bash ./clean.sh

# Windows
clean-for-pack.bat

# 保留 core/data 运行数据
clean-for-pack.bat --keep-data
```

`clean.sh` 会停止当前服务，然后删除项目根目录下除 `.git` 以外的全部文件和目录，包括源码、依赖、构建产物、运行数据以及脚本自身。该操作不可撤销，只应用于准备通过 Git 重新检出工作区的场景。

Windows 的 `clean-for-pack.bat` 会清理依赖、构建产物、覆盖率文件、日志以及 `core/data` 运行数据，适合生成不包含账号和凭据的发布目录。如需保留 `core/data`，必须显式传入 `--keep-data`。

### 抓包协议分析

```bash
# 解码指定抓包目录中的协议帧
pnpm -C core exec tsx ../tools/decode-latest-protocols.js <capture-dir>

# 检查抓包 RPC 与本地 Protobuf 定义的兼容性
pnpm -C core exec tsx ../tools/audit-capture-compatibility.js <capture-dir>
```

## 项目文档

专题说明统一收录在 [`docs/`](docs/README.md)：

- [工具脚本](docs/tools.md)
- [网络并发模型](docs/network-concurrency.md)
- [TSDK Node.js 运行约定](docs/tsdk-runtime.md)
- [配置存储、迁移与缓存](docs/config-storage.md)
- [2026-10-22 游戏版本与资源对齐](docs/game-update-20261022.md)
- [雨落成诗活动协议与实现](docs/weather-activity.md)
- [神秘商人、游戏商城与购买协议](docs/shop-protocols.md)
- [好友宠物缓存与每日同步](docs/friend-pet-cache.md)
- [个人页宠物协议](docs/pet-protocols.md)

## 免责声明

本项目仅供学习与研究用途。使用本工具可能违反游戏服务条款，由此产生的一切后果由使用者自行承担。

<div align="center">
  <p>如果觉得项目有用，欢迎点一个 Star。</p>
</div>

- [图鉴、变异宝典与藏品](docs/collections-20261101.md)

## 许可

许可沿用上游项目的声明（上游 `package.json` 中声明为 ISC）。本项目同样仅供学习与研究使用，使用者需自行承担因使用本工具产生的后果。
