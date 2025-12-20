# Linux Deployment Guide

Follow these steps to move your built Docker image to your Linux server and run it.

## 1. Save the Image (on Windows)

In your local terminal, run this command to export the image to a file:

```powershell
docker build -t hemodialisis-app .
docker save -o hemodialisis-app.tar hemodialisis-app:latest
```

## 2. Transfer the Files

Transfer the `.tar` file and the `docker-compose.yml` to your Linux server using `scp` or a USB drive:

```powershell
# Example using scp
scp hemodialisis-app.tar docker-compose.yml user@linux-server-ip:/home/user/app/
```

## 3. Load the Image (on Linux Server)

SSH into your Linux server and load the image:

```bash
cd /home/user/app/
docker load -i hemodialisis-app.tar
```

## 4. Deploy with Docker Compose

Run the app and its database using Docker Compose. Depending on your Docker version, use one of these commands:

```bash
# For Docker Compose V2 (recommended)
docker compose up -d

# OR for Docker Compose V1 (legacy)
docker-compose up -d
```

## 5. First Time Setup (Database Migrations)

Since this is a fresh database, you need to run the Prisma migrations inside the container:

```bash
docker compose exec app pnpm prisma migrate deploy
```

---

### Prerequisites on Linux Server:

- Docker installed
- **Docker Compose V2** (The modern plugin)
- Port 9999 opened in the firewall

#### How to install Docker Compose V2:

If `docker compose version` fails, try one of these methods:

**Method A: Add Docker Repository (Recommended)**

```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install docker-compose-plugin
```

**Method B: Manual Binary Install (Fallback)**
If the above fails, download the binary directly:

```bash
mkdir -p ~/.docker/cli-plugins/
curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose

# Verify:
docker compose version
```

> [!NOTE]
> This deployment uses **PostgreSQL 18**, which has changed its default data storage path to `/var/lib/postgresql`. If you are migrating a database from an older version, ensure you backup and restore your data, as the volume structure is not backwards compatible.
