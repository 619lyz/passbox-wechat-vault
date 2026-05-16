# Passbox

Passbox 是一个基于微信小程序和微信云开发的账号密码管理工具。它用于记录不同平台的账号、密码、备注和图标，并将账号库加密后同步到云端。

## 功能

- 记录不同平台的账号和密码
- 内置常见 App / 网站图标
- 支持自定义平台图标
- 密码默认折叠，进入详情后手动查看
- 支持复制账号和密码
- 支持编辑、删除和批量删除账号
- 账号库自动加密后上传到微信云开发数据库
- 云端只保存密文，不直接保存明文密码
- 安全与隐私页面展示同步状态
- 关于页面展示版本、作者和项目地址

## 技术栈

- 微信小程序
- 微信云开发 CloudBase
- 云数据库
- CryptoJS
- AES-256-CBC + HMAC-SHA256
- PBKDF2-SHA256

## 项目结构

```text
passbox-cloud
├── cloudfunctions/          # 云函数目录
├── miniprogram/             # 小程序源码
│   ├── assets/              # 图标和静态资源
│   ├── libs/                # 第三方库
│   ├── pages/               # 页面
│   └── utils/               # 数据、加密、云同步工具
├── project.config.json      # 微信开发者工具项目配置
└── README.md
```

## 云开发配置

项目使用云数据库集合：

```text
vaults
```

建议数据库权限设置为：

```text
仅创建者可读写
```

小程序云环境 ID 配置在：

```text
miniprogram/app.js
```

```js
env: 'cloudbase-d9guy5yz6e83d6098'
```

## 安全说明

Passbox 会在本地将账号库加密后上传到云数据库。云端记录中应只出现 `encryptedVault`、`accountCount`、`updatedAt` 等字段，不应出现明文密码。

当前版本为了使用体验，采用应用内置同步密钥进行加密。正式用于高安全场景时，建议升级为用户自定义主密码或系统生物识别解锁方案。

## 作者

作者：619

GitHub：<https://github.com/619lyz>

## 版本

当前版本：`v1.0.0`
