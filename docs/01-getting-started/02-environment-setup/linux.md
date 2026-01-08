# Linux Setup Guide

For Ubuntu, Debian, and related distributions.

---

## Option A: The "php.new" Script (Recommended)

This script automates the installation of PHP, Composer, and Laravel.

### Instructions

1.  **Open Terminal**:
    -   On Ubuntu, press `Ctrl` + `Alt` + `T`.

2.  **Copy the Command**:
    ```bash
    /bin/bash -c "$(curl -fsSL https://php.new/install/linux)"
    ```

3.  **Run It**: Paste into your terminal (Right-click > Paste) and hit `Enter`.

4.  **Completion**: Once finished, close and reopen your terminal.

---

## Option B: Manual Installation (APT)

If the script doesn't work for your distribution or you prefer control.

1.  **Update Packages**:
    ```bash
    sudo apt update
    ```

2.  **Install PHP & Extensions**:
    ```bash
    sudo apt install php-cli php-mbstring php-xml php-bcmath php-curl php-zip php-intl php-mysql php-pgsql
    ```

3.  **Install Composer**:
    ```bash
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
    ```

4.  **Install Node.js**:
    ```bash
    sudo apt install nodejs npm
    ```

---

## Database Setup

You will likely need a local database server.

**For MySQL:**
```bash
sudo apt install mysql-server
sudo mysql_secure_installation
```

**For PostgreSQL:**
```bash
sudo apt install postgresql
```
