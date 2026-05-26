# Passbox

Passbox is a WeChat Mini Program practice project built mainly to:

1. Learn the complete setup workflow for a WeChat Mini Program, from creation and development to debugging and previewing.
2. Practice Vibe Coding skills.

Passbox is an account and password management tool based on WeChat Mini Program and WeChat Cloud Development. It records accounts, passwords, notes, and icons for different platforms, then encrypts the vault before syncing it to the cloud.

<img width="684" height="1260" alt="image" src="https://github.com/user-attachments/assets/0e037229-babf-4c39-bada-946b866087fe" />

## Features

- Store accounts and passwords for different platforms
- Built-in icons for common apps and websites
- Support custom platform icons
- Keep passwords collapsed by default, with manual viewing on the detail page
- Copy account names and passwords
- Edit, delete, and batch-delete accounts
- Automatically encrypt the vault before uploading it to the WeChat Cloud Development database
- Store only ciphertext in the cloud, without directly saving plaintext passwords
- Show sync status on the Security and Privacy page
- Show version, author, and project URL on the About page

## Tech Stack

- WeChat Mini Program
- WeChat Cloud Development / CloudBase
- Cloud Database
- CryptoJS
- AES-256-CBC + HMAC-SHA256
- PBKDF2-SHA256

## Project Structure

```text
passbox-wechat-vault
|-- cloudfunctions/          # Cloud function directory
|-- miniprogram/             # Mini Program source code
|   |-- assets/              # Icons and static assets
|   |-- libs/                # Third-party libraries
|   |-- pages/               # Pages
|   `-- utils/               # Data, encryption, and cloud sync utilities
|-- project.config.json      # WeChat DevTools project configuration
`-- README.md
```

## Cloud Development Configuration

The project uses the following cloud database collection:

```text
vaults
```

Recommended database permission setting:

```text
Readable and writable only by the creator
```

The Mini Program cloud environment ID is configured in:

```text
miniprogram/app.js
```

```js
env: 'cloudbase-d9guy5yz6e83d6098'
```

## Security Notes

Passbox encrypts the account vault locally before uploading it to the cloud database. Cloud records should only contain fields such as `encryptedVault`, `accountCount`, and `updatedAt`; plaintext passwords should not appear in cloud records.

For convenience in the current version, encryption uses a sync key built into the app. For production or high-security use cases, it is recommended to upgrade to a user-defined master password or a system biometric unlock solution.

## Author

Author: 619

GitHub: <https://github.com/619lyz>

## Version

Current version: `v1.0.0`
