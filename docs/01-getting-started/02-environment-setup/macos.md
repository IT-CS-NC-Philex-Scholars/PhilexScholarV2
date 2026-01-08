# macOS Setup Guide

Mac is the native home of many Laravel developers. The tooling here is excellent.

---

## Option A: Laravel Herd (Recommended)

**Laravel Herd** for macOS is the gold standard. It provides a zero-config development environment.

### Steps
1.  **Download**: Visit [herd.laravel.com](https://herd.laravel.com).
2.  **Install**: Drag the app to your Applications folder.
3.  **Launch**: Open the app. It will automatically install the latest PHP and Composer versions.
4.  **Database**: Herd for Mac includes **Herd Pro** features, or you can download **DBngin** (free) to handle your MySQL/PostgreSQL database.

---

## Option B: Homebrew (The Manual Way)

If you prefer to manage packages yourself.

1.  **Install Homebrew**:
    ```bash
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```

2.  **Install PHP**:
    ```bash
    brew install php
    ```

3.  **Install Composer**:
    ```bash
    brew install composer
    ```

4.  **Install Node.js**:
    ```bash
    brew install node
    ```

---

## Verification

Open your terminal (Command + Space, type "Terminal") and run:
```bash
php -v
composer -V
node -v
```
You should see version numbers for all of them.
