# Docker for Beginners — clear notes with examples, commands, and interview answers

These notes follow the video’s learning path, but use the current Docker command style and correct a few shortcuts that can cause confusion in a real project. Read them in order once, then use the command reference while practising.

## 1. Start with the real problem Docker solves

Imagine that you build a Flask website on your laptop. It works because your laptop happens to have Python 3.12, Flask, a particular library version, and a database driver already installed. You send the source code to a client or teammate. Their computer has Python 3.10, a missing library, or a different operating system. Now the same code fails. This is the classic: **“it works on my machine.”**

Docker solves this by packaging the application *with the runtime, libraries, and configuration it needs* into an **image**. Anyone can use that same image to create a **container**. The result is a repeatable environment: the application is not relying on random software installed on each machine.

Think of a restaurant franchise:

- The recipe and exact ingredients list are the **image**.
- One running kitchen following that recipe is a **container**.
- The chef that builds and runs kitchens is the **Docker Engine**.

An image is not a running application. It is a read-only template. A container is the running, writable instance made from that template. One image can create many separate containers.

> **Memory sentence:** `Dockerfile → Image → Container`.

Docker is very useful for development, testing, CI/CD, and deployment. It makes an application portable, but it does not make every operating-system difference disappear. Most containers are Linux containers and share the Linux kernel of their host. On macOS and Windows, Docker Desktop normally runs a small Linux virtual machine underneath to provide that kernel. A Linux container is not a full virtual machine and cannot magically run an arbitrary Windows or macOS application.

## 2. Containers versus virtual machines

A **virtual machine (VM)** is like renting a complete flat for every application: each VM gets a guest operating system, its own system files, and allocated virtual hardware. A **container** is more like separate rooms in the same building: applications are isolated, but they share the host’s operating-system kernel.

| Question | Virtual machine | Container |
| --- | --- | --- |
| Includes a full guest operating system? | Yes | Usually no |
| Starts in | Usually seconds to minutes | Usually seconds or less |
| Memory and disk use | Higher | Usually lower |
| Isolation | Stronger hardware-style boundary | Process-level isolation; configure carefully |
| Best mental use | Different OS / strong separation | Package and run application services |

The word *lightweight* does not mean *zero cost*. A container still consumes CPU, RAM, disk, and network resources. It is lightweight mainly because it does not boot a whole guest OS for every application.

## 3. What happens when you type a Docker command?

Docker uses a client-server design.

```text
You in terminal
   │ docker run nginx
   ▼
Docker CLI / client ── Docker API ──> Docker daemon (dockerd)
                                         │
                                         ├─ images
                                         ├─ containers
                                         ├─ networks
                                         └─ volumes
```

The **Docker CLI** is the `docker` command you type. The **Docker daemon**, called `dockerd`, is the background service that does the work: it builds images, starts containers, creates networks, and manages volumes. The CLI sends its request to that daemon through the Docker API. The daemon commonly uses lower-level runtime components such as `containerd` and `runc` to run containers.

**Docker Desktop** is a convenient desktop application. It bundles the engine, CLI, Compose, graphical UI, and—on Mac/Windows—the Linux environment needed to run Linux containers. It is not merely a dashboard.

When you run `docker run hello-world`, Docker does this in order:

1. Looks for the `hello-world` image locally.
2. If missing, pulls it from the configured registry (Docker Hub by default).
3. Creates a new container from the image.
4. Gives the container a small writable layer and network setup.
5. Starts its main command and prints the output.
6. Stops the container when that main command finishes.

## 4. Installation and first safe check

For a beginner on macOS or Windows, install **Docker Desktop** from Docker’s official website, start it, and wait until the engine is running. On Ubuntu, follow Docker’s official installation guide for your release; the distribution package (`docker.io`) is convenient for a lab, though the official Docker Engine repository is generally the better choice when you need current features.

On Ubuntu, these are useful checks:

```bash
docker --version                 # Shows the installed Docker CLI version.
docker compose version           # Checks that the Compose plugin is available.
sudo systemctl status docker     # Shows whether the Docker daemon is active on Linux.
docker run hello-world           # Pulls (if needed), creates, runs, then exits a test container.
```

If Linux says permission is denied while connecting to Docker, your current user may not be allowed to use Docker’s Unix socket. For a personal development VM, you can add the current user to the `docker` group, then sign out and back in (or use `newgrp docker`).

```bash
sudo usermod -aG docker "$USER"  # Adds the current user to the docker group.
newgrp docker                     # Starts a shell with refreshed group membership for this session.
docker ps                         # Lists running containers; should now work without sudo.
```

Be careful: access to the Docker daemon is effectively high-privilege access on that machine. Do not add untrusted users to this group.

If you practise on an AWS EC2 machine, open only the ports your application needs in its Security Group. For example, open TCP 80 for a public HTTP demo, but do **not** expose MySQL port 3306 publicly just because a tutorial maps it. Databases should normally remain reachable only from the application network.

## 5. The four objects you will use most

### Image

An **image** is a packaged, read-only blueprint. It contains a base operating-system filesystem, language runtime, packages, application files, and default startup instructions. Images are built in reusable layers, so Docker can reuse unchanged layers on the next build.

```bash
docker image ls                   # Lists images stored locally.
docker pull mysql:8.4             # Downloads a specific MySQL image tag from a registry.
docker image inspect mysql:8.4    # Shows detailed metadata, such as entrypoint and layers.
```

Always prefer a meaningful, tested tag such as `mysql:8.4` or `myapp:1.2.0`, not an unexamined `latest`. `latest` is only a tag name; it does not guarantee “newest”, stability, or safety.

### Container

A **container** is a runnable instance of an image plus runtime settings: environment variables, ports, network, volumes, and command. Its writable filesystem is temporary by default. Delete the container and changes that were not stored in a volume disappear.

```bash
docker run --name web nginx:alpine # Creates and starts a container called web from nginx:alpine.
docker ps                          # Lists only running containers.
docker ps -a                       # Lists running, stopped, and exited containers.
docker stop web                    # Sends a graceful stop signal to the web container.
docker start web                   # Starts the existing stopped container again.
docker rm web                      # Removes a stopped container named web.
```

### Network

A **network** is the private road system that lets selected containers communicate. Containers on the same user-defined bridge network can normally reach one another by service/container name. This is why an app can use `db` as a database hostname instead of hard-coding a changing IP address.

```bash
docker network ls                         # Lists Docker networks.
docker network create app-net              # Creates a user-defined bridge network.
docker network inspect app-net             # Shows attached containers and settings.
```

### Volume

A **volume** stores important data outside a container’s temporary writable layer. Use it for database data, uploads, and other state that must survive a container replacement.

```bash
docker volume create mysql-data            # Creates Docker-managed persistent storage.
docker volume ls                           # Lists named volumes.
docker volume inspect mysql-data           # Shows the volume’s metadata and mount point.
```

## 6. Your first useful `docker run` commands

### A web server and port mapping

```bash
docker run -d --name web -p 8080:80 nginx:alpine
# -d              Run detached: return your terminal immediately.
# --name web      Give the container a memorable name instead of a random one.
# -p 8080:80      Publish HOST port 8080 to CONTAINER port 80.
# nginx:alpine    Image name and tag to run.
```

Open `http://localhost:8080`. The application is listening on port 80 *inside* the container; your browser reaches port 8080 on your own computer. Docker forwards the request across that boundary.

`-p 8080:80` does **not** mean “the app now listens on 8080.” It means “traffic arriving at host port 8080 is sent to container port 80.” In an EC2 example, you also need the cloud firewall to allow the host port you publish.

### Background, foreground, and interactive mode

```bash
docker run --rm hello-world                  # Foreground: terminal displays the main process output.
docker run -d --name web nginx:alpine         # Background: Docker prints a container ID and returns.
docker run -it --rm ubuntu:24.04 bash        # Opens an interactive Bash shell; removes it after exit.
```

`-i` keeps standard input open; `-t` allocates a terminal. `-it` is for an interactive session such as a shell. It does not by itself keep an application alive. A container stays running only while its main process (PID 1) remains running. For example, `docker run ubuntu:24.04` exits immediately because the image has no long-running default command.

### Environment variables

```bash
docker run -d --name db \
  -e MYSQL_DATABASE=appdb \
  -e MYSQL_ROOT_PASSWORD='change-this-for-a-real-secret' \
  -v mysql-data:/var/lib/mysql \
  mysql:8.4
# -e NAME=value   Passes configuration into the container at runtime.
# -v volume:path   Mounts durable volume storage at MySQL's data directory.
```

Environment variables are configuration, not a safe secret vault. Do not commit passwords, API keys, or personal access tokens into a Dockerfile, image, or Git repository. Use an uncommitted `.env` file for local development and a proper secret mechanism in shared/production environments.

## 7. See, enter, and troubleshoot containers

These commands are the beginner’s debugging kit. Use them before guessing.

```bash
docker ps -a                        # Is it running, exited, restarting, or created?
docker logs web                     # Prints logs already produced by container web.
docker logs -f --tail 100 web        # Follows the latest 100 log lines live; Ctrl-C only stops following.
docker inspect web                   # Shows low-level configuration and state as JSON.
docker stats                         # Shows live CPU, memory, network, and block-I/O usage.
docker exec -it web sh               # Opens a shell inside a running Alpine-like container.
docker exec -it db mysql -uroot -p   # Runs the MySQL client inside a running database container.
```

Use `docker exec` to inspect a running container, not `ssh`. A typical container does not run an SSH server, and it should not need one. `docker attach` connects your terminal directly to the main process; it can be useful, but `docker logs -f` is safer for reading logs because you do not accidentally send input to the application. To detach from an attached container without stopping it, use `Ctrl-P` then `Ctrl-Q`.

When a container exits, read the logs first. Common causes are: a missing required variable, an incorrect image command, a port conflict, a database that is not ready yet, or an application error. Docker did its job if it started the process; a stack trace from the application often belongs to the application code or configuration.

## 8. Dockerfile: write the application recipe

A **Dockerfile** is a text recipe that tells Docker how to build an image. Docker reads it top to bottom. Every substantial instruction can create a cached layer, so order matters.

Here is a small Flask example:

```Dockerfile
# syntax=docker/dockerfile:1
FROM python:3.12-slim
# Starts from a small Python 3.12 environment. Pin a tested version in real projects.

WORKDIR /app
# Changes the working folder inside the image. Later paths are relative to /app.

COPY requirements.txt ./
# Copies only dependency list first. This layer remains cached while dependencies do not change.

RUN pip install --no-cache-dir -r requirements.txt
# Runs while BUILDING the image and installs Flask and other Python packages.

COPY . .
# Copies the remaining application files from the build context into /app.

EXPOSE 8000
# Documents that the application listens on 8000. It does NOT publish the port by itself.

CMD ["python", "app.py"]
# Default command that starts when a container is created from this image.
```

Build and run it:

```bash
docker build -t flask-demo:1.0 .     # Builds an image named flask-demo tagged 1.0; `.` is the build context.
docker run --rm -p 8000:8000 flask-demo:1.0
# Starts a temporary container and publishes its internal port 8000 to localhost:8000.
```

The final `.` in `docker build` is important. It is the **build context**: the directory whose files Docker may send to the builder. Keep it small by using `.dockerignore`.

```gitignore
# .dockerignore — files Docker must not send in the build context
.git
.env
node_modules
__pycache__/
.venv/
*.log
```

### The instructions you must understand

| Instruction | Plain meaning | When it matters |
| --- | --- | --- |
| `FROM` | Choose the starting image. | Every normal Dockerfile starts here; each `FROM` begins a stage. |
| `WORKDIR` | Set the folder for later operations. | Prevents confusing long paths. |
| `COPY` | Copy files from build context to image. | Use before a `RUN` that needs those files. |
| `RUN` | Execute a command during image build. | Installing dependencies or compiling code. |
| `ENV` | Set a default environment variable in the image. | Non-secret defaults; runtime can override it. |
| `EXPOSE` | Document a listening port. | It does not open/publish a host port. |
| `CMD` | Give a default command/arguments for the container. | Easily overridden at `docker run` time. |
| `ENTRYPOINT` | Set the container’s primary executable. | Combine with `CMD` for default arguments. |

### `RUN` versus `CMD` versus `ENTRYPOINT`

This is a favourite interview topic:

- `RUN` happens **while building** the image. Example: install Java packages or compile source code.
- `CMD` is the **default command or default arguments** when the container starts. It is easy to replace: `docker run image another-command`.
- `ENTRYPOINT` defines the **main executable**. In exec form, arguments supplied to `docker run` are appended to it. It is harder to replace and should be used deliberately.

For example:

```Dockerfile
ENTRYPOINT ["python"]
CMD ["app.py"]
```

`docker run my-python-image` runs `python app.py`. `docker run my-python-image worker.py` runs `python worker.py`. That is a clean use of both instructions.

### Example: Java application

```Dockerfile
FROM eclipse-temurin:21-jdk
# Provides a JDK because Java source must be compiled.

WORKDIR /app
COPY src/Main.java ./
RUN javac Main.java
# Compiles at build time and creates Main.class.

CMD ["java", "Main"]
# Runs when a container is started.
```

If you change source code, rebuild the image. An already-built image does not watch your host files. Docker may reuse layers from cache; changing a file copied by `COPY` invalidates that layer and the later dependent layers.

## 9. Networking: make application containers talk safely

Containers are isolated by default, so do not assume an app can find a database automatically. The simplest and best learning pattern is a **user-defined bridge network**.

```bash
docker network create two-tier-net
# Creates a private network with built-in DNS for attached containers.

docker run -d --name db --network two-tier-net \
  -e MYSQL_DATABASE=messages \
  -e MYSQL_ROOT_PASSWORD='local-dev-password' \
  -v mysql-data:/var/lib/mysql \
  mysql:8.4
# The database is named db on this network.

docker run -d --name api --network two-tier-net -p 5000:5000 \
  -e MYSQL_HOST=db \
  -e MYSQL_DATABASE=messages \
  -e MYSQL_USER=root \
  -e MYSQL_PASSWORD='local-dev-password' \
  my-flask-api:1.0
# The API reaches MySQL with hostname db, not an IP address.
```

The important idea is **service discovery by name**. Docker’s internal DNS resolves `db` to the current container IP on that network. Do not use a random generated container name and do not hard-code a container IP; both make the setup fragile.

Important network drivers:

- **User-defined `bridge`**: the normal choice for multiple containers on one Docker host. It gives name-based discovery between attached containers.
- **Default `bridge`**: exists automatically, but is less convenient for named multi-container apps. Prefer a user-defined bridge.
- **`host`**: the container shares the host network namespace; no port mapping is needed/used. Linux-specific behaviour, and it sacrifices isolation.
- **`none`**: no network access; useful for deliberately isolated tasks.
- **`overlay`**: connects services across Docker Swarm nodes. It is not obsolete; it is just outside the scope of a single-host beginner setup.

Do not publish the database port in the API-and-database example unless a human tool on the host genuinely needs it. The API can reach `db:3306` internally. Publishing `3306:3306` only adds external exposure.

## 10. Volumes and bind mounts: keep data after containers die

A container is meant to be disposable. Restarting a container preserves its writable layer, but **removing and recreating it does not**. A database without persistent storage can look fine today and lose all records tomorrow when the container is replaced.

### Named volume — best default for databases

```bash
docker volume create mysql-data

docker run -d --name db \
  -v mysql-data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD='local-dev-password' \
  mysql:8.4
# mysql-data is managed by Docker; MySQL writes database files at /var/lib/mysql.
```

Remove the container with `docker rm -f db`, then run a new MySQL container mounting the same `mysql-data` volume. The data remains. Remove the volume itself only when you intentionally want to erase the data: `docker volume rm mysql-data`.

### Bind mount — use a specific host folder

```bash
docker run --rm -it \
  --mount type=bind,src="$PWD",dst=/workspace \
  -w /workspace node:22-alpine sh
# Mounts the current host folder directly into /workspace in the container.
```

Bind mounts are excellent for live local development—edit a file on your laptop and the container sees the edit. They depend on an exact host path, so they are less portable than named volumes and are not usually the first choice for production database storage.

> **Simple rule:** application image = replaceable; database data = volume; local source-code editing = bind mount.

## 11. Docker Compose: describe an entire app in one file

Typing long `docker run` commands is good for learning but error-prone for a real two-tier or three-tier application. **Docker Compose** lets you describe services, networks, volumes, configuration, and dependencies in a `compose.yaml` file. Then one command creates the whole stack.

Here is a clean two-tier Flask + MySQL example. It assumes the Flask Dockerfile exposes an app which listens on port 5000 and reads the shown environment variables.

```yaml
services:
  db:
    image: mysql:8.4
    environment:
      MYSQL_DATABASE: messages
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h localhost -uroot -p$$MYSQL_ROOT_PASSWORD || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s
    restart: unless-stopped
    # No ports here: only the API needs to reach MySQL.

  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      MYSQL_HOST: db
      MYSQL_DATABASE: messages
      MYSQL_USER: root
      MYSQL_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

volumes:
  mysql-data:
```

Put this in an uncommitted `.env` file beside `compose.yaml`:

```dotenv
MYSQL_ROOT_PASSWORD=only-for-local-development
```

The Compose project automatically creates a private default network. Within it, `api` can reach the database by the service name `db`. You only need an explicit `networks:` section when you want more than one network or custom behaviour.

Run the stack:

```bash
docker compose config             # Validates and renders the final Compose configuration first.
docker compose up --build         # Builds missing local images and starts services in the foreground.
docker compose up -d --build      # Same, but detached for normal use.
docker compose ps                 # Shows the stack’s service status.
docker compose logs -f api        # Follows only the API service logs.
docker compose down               # Stops and removes containers/networks; named volumes stay by default.
docker compose down -v            # Also removes named volumes: destructive database reset.
```

`depends_on` controls start order. By itself it does **not** prove that a database is ready to accept connections. That is why the example has a database `healthcheck` and uses `condition: service_healthy`. Applications should still implement sensible connection retries because networks and databases can fail later too.

Modern Docker Compose uses `docker compose` with a space. The older `docker-compose` command may exist, but use the plugin syntax in new notes and projects. A top-level `version: "3.8"` is unnecessary in current Compose; it is accepted by some tools but no longer selects a Compose version.

## 12. A three-tier application: browser → Nginx → app → database

A common production-shaped layout has three responsibilities:

```text
Browser ── HTTP/HTTPS ──> Nginx reverse proxy ──> Django / Spring Boot app ──> MySQL
                                  public                 private                  private
```

**Nginx** is a reverse proxy: it accepts a request from the browser and forwards it to the application service. This lets the app stay private, provides one public entry point, and later makes TLS/HTTPS, static files, routing, rate limiting, and load balancing easier.

For a Django service named `app` listening on port 8000, an Nginx configuration can contain:

```nginx
server {
  listen 80;

  location / {
    proxy_pass http://app:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

`app` is the Compose service name, resolved through Docker’s internal DNS. Only Nginx needs `ports: ["80:80"]`; do not publish `8000` or `3306` unless there is a deliberate reason. In production, add HTTPS with a properly configured certificate provider or load balancer—do not treat an HTTP-only demo as a secure deployment.

For a Spring Boot + MySQL project, the same principles apply: build the JAR into an application image, set the database hostname to the Compose service name (for example `db`), persist `/var/lib/mysql`, add readiness/health checks, and expose only the reverse proxy or intentional app port.

## 13. Registry and Docker Hub: share the finished image

A **registry** stores images. Docker Hub is the default public registry, but companies often use private registries such as Amazon ECR, GitHub Container Registry, GitLab Container Registry, or a self-hosted registry.

The normal sharing flow is:

```bash
docker login
# Authenticates to the registry. Use a personal access token when the registry recommends it.

docker build -t mydockerhubuser/flask-demo:1.0.0 .
# Builds an image whose name includes the registry namespace and an explicit release tag.

docker push mydockerhubuser/flask-demo:1.0.0
# Uploads image layers that the registry does not already have.

docker pull mydockerhubuser/flask-demo:1.0.0
# Downloads that exact image on another machine.

docker run --rm mydockerhubuser/flask-demo:1.0.0
# Creates a container from the identical published image.
```

`docker tag old-image:old-tag mydockerhubuser/new-name:1.0.0` adds another name/tag pointing to the same image content; it does not rebuild the application.

Never paste an access token into a screenshot, terminal recording, Dockerfile, Git commit, or chat. Treat it like a password; revoke and replace it if exposed.

## 14. Multi-stage builds: build with big tools, ship only what runs

Some projects need heavy build tools: Maven for Java, a C compiler for native Python modules, or Node tooling for a frontend. End users do not need those build tools inside the final runtime image.

Multi-stage builds solve this. The first stage compiles or installs build dependencies. The final stage starts from a smaller runtime image and copies only the finished artifact.

```Dockerfile
# Stage 1: build the Java application
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src
COPY pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline
# Download dependencies first; this layer is cached while pom.xml stays unchanged.
COPY src ./src
RUN mvn -q -DskipTests package
# Produces a runnable JAR in target/.

# Stage 2: run only the artifact
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /src/target/*.jar app.jar
USER 10001
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

The first stage may be large; it is not shipped as the final image. The final image contains only the JRE and JAR, which generally makes downloads faster and reduces the software attack surface. Do not copy random Python `site-packages` between different Linux distributions unless you know native library compatibility; for Python, a carefully chosen slim runtime plus a virtual environment built for the same base is usually safer.

## 15. Logging, monitoring, health, and cleanup

By default, a container writes standard output and error, and Docker makes those logs available through `docker logs`. That is why applications should log to stdout/stderr rather than only to a file inside the container.

```bash
docker logs -f --timestamps api      # Stream application logs with timestamps.
docker events                        # Watch Docker lifecycle events while debugging.
docker stats --no-stream             # One snapshot of container CPU and memory use.
docker inspect --format '{{.State.Health.Status}}' db
# Prints the health status of the db container when it has a health check.
```

For a local demo, this is enough. In production, use centralized logs and metrics (for example cloud logging, OpenTelemetry, Prometheus/Grafana, ELK/OpenSearch, or your platform’s tooling). `nohup docker attach ...` is not a durable logging strategy: it ties logs to one machine and does not provide rotation, aggregation, search, or alerts.

Use cleanup commands cautiously:

```bash
docker container prune               # Asks before removing all stopped containers.
docker image prune                   # Removes dangling/unreferenced image layers.
docker system prune                  # Removes unused containers, networks, dangling images, and build cache.
docker system prune -a               # More aggressive: also removes unused tagged images; review before confirming.
```

Do **not** run `docker system prune --volumes` casually. It can delete unused volumes, which may contain database data you meant to keep. Prefer inspecting first with `docker ps -a`, `docker image ls`, and `docker volume ls`.

## 16. Docker and Kubernetes: the correct relationship

Docker packages and runs containers. **Kubernetes** is a container orchestration platform for managing containerized workloads across one or more machines. It can schedule workloads, restart failed replicas, roll out updates, scale replicas, and manage service networking.

You absolutely can run Docker containers directly in production for a small, well-managed application. Docker is not “only for development,” and a container is not inherently unreliable. The production question is: *who will manage restarts, scaling, networking, secrets, rollout, and observability?* Docker Compose, a cloud container service, Nomad, or Kubernetes can be appropriate depending on the size and needs of the system.

Useful Kubernetes bridge terms:

- **Pod**: smallest deployable Kubernetes unit; usually one main application container, sometimes closely related sidecars.
- **Deployment**: declares desired replicas and rolling-update behaviour for stateless Pods.
- **Service**: stable internal address/load balancing for a group of Pods.
- **Ingress / Gateway**: HTTP(S) routing from outside the cluster toward Services.

Learn Docker well first. Kubernetes becomes easier once image, container, port, environment-variable, network, health-check, and persistent-storage ideas feel natural.

## 17. Security habits from day one

1. Use trusted, small, regularly updated base images and pin meaningful versions.
2. Add `.dockerignore`; do not send `.env`, Git history, `node_modules`, or private keys into the build context.
3. Never bake secrets into an image with `COPY`, `ENV`, or `ARG`. Build arguments can be visible in image metadata/history.
4. Run the app as a non-root user when possible (`USER appuser` or a numeric non-root UID).
5. Publish only required ports. Your database should rarely be public.
6. Scan images and act on relevant findings. Docker Scout can provide a quick report:

```bash
docker scout quickview mydockerhubuser/flask-demo:1.0.0
# Summarises image packages and known vulnerability findings.

docker scout cves mydockerhubuser/flask-demo:1.0.0
# Lists detailed CVE findings to investigate and prioritise.
```

Scanning reports are a starting point, not a command to blindly replace packages. Check whether the vulnerable package is reachable in your application, whether a fixed base image exists, and whether an upgrade breaks compatibility.

`docker init` can generate starter Dockerfile, Compose, README, and `.dockerignore` templates for a known language. It saves typing, but you must still review ports, commands, files included, credentials, and the generated image versions before using it.

## 18. Common failures and the quickest way to think about them

| Symptom | Likely reason | First checks / fix |
| --- | --- | --- |
| `permission denied` to Docker socket | Linux user lacks permission to talk to daemon | `sudo systemctl status docker`; check group membership; remember Docker group is powerful. |
| Container disappears from `docker ps` | Its main process exited | `docker ps -a`, then `docker logs <name>`. |
| `port is already allocated` | Another host process/container owns that host port | `docker ps`; change only the *left* side of `-p HOST:CONTAINER`, such as `8081:8080`. |
| App says database host unknown | App and DB are not on same network, or wrong hostname | Use Compose service name like `db`; confirm network with `docker network inspect`. |
| App starts before DB is ready | Start order is not readiness | Add DB healthcheck, Compose `service_healthy`, and app retry logic. |
| Data disappears after replacing DB container | Data was in container writable layer | Mount a named volume at the DB’s documented data path. |
| Code change does not appear | You ran an old image/container | Rebuild image, recreate container, or use a bind mount only for local dev. |
| `EXPOSE` but browser cannot connect | `EXPOSE` only documents; port not published/firewall blocks it | Use `-p` / Compose `ports`; check local/cloud firewall. |
| Compose YAML error | Indentation or key structure is wrong | Run `docker compose config` before `up`. |

## 19. Interview-ready answers

**What is Docker?**  Docker is a platform and tooling for packaging an application and its dependencies into a portable image, then running that image in an isolated container.

**Image versus container?**  An image is the read-only blueprint. A container is a runnable instance of that image with runtime configuration and a writable layer.

**Why are containers lighter than VMs?**  Containers share the host kernel rather than booting a complete guest OS each, so they usually start faster and use fewer resources.

**What is the Docker daemon?**  `dockerd` is the background service that receives Docker API requests and manages images, containers, networks, and volumes.

**What is a Dockerfile?**  A versionable text recipe Docker uses to build an image. Instructions run in order and are commonly cached as layers.

**`RUN` versus `CMD`?**  `RUN` executes during image build. `CMD` supplies the default runtime command or arguments when a container starts.

**What does `EXPOSE` do?**  It documents the port the application listens on. It does not publish that port to the host; `-p` or Compose `ports` does that.

**What is a volume?**  Docker-managed persistent storage mounted into a container. It is the normal way to preserve database data when a container is replaced.

**Named volume versus bind mount?**  A named volume is managed by Docker and is portable in a Compose setup; a bind mount maps a particular host path and is often used for local source-code development.

**What is Docker Compose?**  A declarative YAML-based way to define and run a multi-container application—services, volumes, networks, environment, health checks, and dependencies—through commands such as `docker compose up`.

**How do two Compose services communicate?**  Services join the project’s default network and resolve each other by service name. For example, the API connects to hostname `db`, not `localhost` and not a hard-coded IP.

**What is a registry?**  A service that stores and distributes Docker images. Docker Hub is a common registry; private registries are common in companies.

**What is a multi-stage build?**  A Dockerfile with multiple `FROM` stages. Use a build stage with compilers/tools, then copy only the required final artifact into a slimmer runtime stage.

**Does `depends_on` mean the database is ready?**  No. It controls dependency/start ordering. Pair it with a health check and `condition: service_healthy`; keep app-level retry logic too.

**Docker versus Kubernetes?**  Docker packages/runs containerized applications. Kubernetes orchestrates containerized workloads across infrastructure—scheduling, replicas, networking, rollouts, and recovery.

## 20. A practical learning sequence

Do these in order while following the video. Do not only watch.

1. Run `hello-world`, then run `nginx` with `-p 8080:80`; inspect it with `ps`, `logs`, and `exec`.
2. Build a small Flask/Node/Java image. Change one line of source, rebuild, and observe layer caching.
3. Run MySQL with a named volume. Add a row, remove the container, recreate it with the same volume, and verify the row remains.
4. Put an API and MySQL on a user-defined bridge network. Make the API connect by the database container name.
5. Convert that setup into the Compose example. Use `docker compose config` before `up`.
6. Add a health check and intentionally use a wrong database hostname. Read logs and fix it rather than starting again from scratch.
7. Push a versioned image to a registry, pull it on another machine, and run the same tag.
8. Rewrite one Dockerfile as a multi-stage build. Compare image sizes with `docker image ls`.

If you can explain every decision in the Compose example—why `db` is a hostname, why MySQL has a volume, why only the API port is public, why `depends_on` needs a health check—you understand Docker at a strong beginner level.

## 21. Important corrections to remember from the video

- Docker was first released in 2013. **containerd** was donated to CNCF in 2017; Docker itself is not a CNCF project.
- Containers share a kernel; Docker does not run any OS inside any host in the same way a VM can.
- `docker run -itd ubuntu` is not a general “keep any container alive” trick. A container should run its real foreground application process; use a shell only for exploration.
- `EXPOSE 8000` does not expose a service to your laptop or the internet. Publish it with `-p` or Compose `ports`, then configure any cloud firewall separately.
- Compose uses service names for networking. Avoid `container_name` unless there is a real need; it can make scaling and reuse harder.
- `depends_on` alone does not wait for a DB to become ready. Health checks plus retry logic solve the actual problem.
- `restart: always` does not turn every health-check failure into a restart in the simple way many tutorials suggest. Restart policy reacts to a container process exiting; use health status for readiness/monitoring and design the application to exit/retry appropriately.
- Do not run `sudo rm -r` on a Docker volume’s host folder just to repair an error. Identify the Compose project/volume first and prefer an intentional `docker compose down -v` only when resetting disposable local data is acceptable.
- Docker can be used directly in production. Kubernetes is one orchestration option for systems that need its capabilities; it is not an automatic next step for every app.

---

### One-page recall

```text
Dockerfile  = written recipe
Image       = packaged, read-only recipe result
Container   = running instance of image
Registry    = image store (Docker Hub/ECR/etc.)
Network     = private communication road between containers
Volume      = persistent data store outside a disposable container
Compose     = one YAML definition for a multi-container application

Build:  docker build -t name:tag .
Run:    docker run -d --name app -p host:container name:tag
See:    docker ps | docker logs -f app | docker exec -it app sh
Stack:  docker compose up -d --build
Stop:   docker compose down
```
