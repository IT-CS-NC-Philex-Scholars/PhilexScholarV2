# Docker Setup (Laravel Sail)

## What is Docker?
Imagine you are baking a cake.
-   **Traditional Way**: You buy flour, eggs, and an oven and put them in your kitchen (Your Computer). If you make a mess, your kitchen gets dirty.
-   **Docker Way**: You buy a "Magic Box". Inside the box is a pre-built kitchen with all the ingredients. You step into the box, bake the cake, and step out. Your actual kitchen stays clean.

**Docker** creates these "Magic Boxes" (called **Containers**) that have PHP, MySQL, and everything else pre-installed.

## Pros & Cons
-   **✅ Pros**: No need to install PHP/MySQL on your actual computer. Matches the "Production" server perfectly.
-   **❌ Cons**: Can be slower on Windows/Mac. Steeper learning curve.

## Using Laravel Sail

Laravel comes with a tool called **Sail**, which is a light command-line interface for interacting with Docker.

### Prerequisites
-   **Docker Desktop**: Download and install from [docker.com](https://www.docker.com/products/docker-desktop/).
-   **WSL2 (Windows Only)**: If on Windows, you must ensure Docker is using the WSL2 backend.

### How to Run
Instead of running `php artisan serve`, you use Sail:

1.  **Navigate to project**:
    ```bash
    cd PhilexScholarV2
    ```

2.  **Start Containers**:
    ```bash
    ./vendor/bin/sail up
    ```
    *This downloads and starts PHP, MySQL, and Redis containers.*

3.  **Run Commands**:
    Instead of typing `php artisan migrate`, you type:
    ```bash
    ./vendor/bin/sail artisan migrate
    ```

### Is this for me?
If you are a beginner, we recommend the **Native Method** (Herd/php.new) first. Use Docker once you are comfortable with the basics.
