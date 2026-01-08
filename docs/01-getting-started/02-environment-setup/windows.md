# Windows Setup Guide

For Windows, we have two modern, "easy" ways to get started. You only need to choose **one**.

---

## Option A: Laravel Herd (The Easiest Way)

**Laravel Herd** is a lightning-fast, native development environment. It includes everything you need (PHP, Composer, Node.js) in a single installer.

1.  **Download**: Go to [herd.laravel.com](https://herd.laravel.com/windows) and download the installer.
2.  **Install**: Run the `.exe` file.
3.  **Done**: You can now open your terminal and type `php -v` or `composer` and it just works!

---

## Option B: The "php.new" Script (Command Line)

If you prefer using the terminal, there is a specialized script that automatically installs PHP 8.5, Composer, and Laravel, and configures your system path for you.

### Instructions

1.  **Open the Start Menu**: Press the `Windows` key.
2.  **Find PowerShell**: Type `Powershell`.
3.  **Run as Administrator**: Right-click the app and select **"Run as Administrator"**.
4.  **Run the Command**: Copy and paste the following command, then hit `Enter`:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows'))
```

5.  **Follow Prompts**: The script will handle the rest.
6.  **Verify**: Close PowerShell and open a new one. Type `php -v`.

---

## Option C: Manual Setup (Laragon/XAMPP)

*Note: This is the "Old School" way. Only use this if you are already familiar with these tools.*

-   **Laragon**: Download from [laragon.org](https://laragon.org). It is excellent and comes with MySQL/HeidiSQL out of the box.
-   **XAMPP**: Download from [apachefriends.org](https://www.apachefriends.org).

---

## Next Step: Database

If you used **Herd** or **php.new**, you still need a database.
-   **Download MySQL**: [dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/)
-   **Or use DBngin**: A free tool to manage databases easily. [dbngin.com](https://dbngin.com/) (Highly Recommended to pair with Herd).
