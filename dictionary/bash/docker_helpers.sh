# docker_ps_short prints running containers with their names.
docker_ps_short() {
    docker ps --format '{{.Names}}\t{{.Image}}\t{{.Status}}'
}

# docker_stop_all stops every running container.
docker_stop_all() {
    docker ps -q | xargs -r docker stop
}

# docker_rm_stopped removes containers that are no longer running.
docker_rm_stopped() {
    docker ps -a -q -f status=exited | xargs -r docker rm
}

# docker_clean_dangling removes image layers no longer referenced.
docker_clean_dangling() {
    docker image prune -f
}

# docker_image_size prints the size of an image by name.
docker_image_size() {
    local image="${1:?missing image}"
    docker image inspect "$image" --format '{{.Size}}' \
        | awk '{ printf "%.1f MB\n", $1 / 1024 / 1024 }'
}

# docker_container_ip prints the IP address of a container.
docker_container_ip() {
    local name="${1:?missing container}"
    docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$name"
}

# docker_logs_follow tails the logs of a container.
docker_logs_follow() {
    local name="${1:?missing container}" lines="${2:-50}"
    docker logs -f --tail "$lines" "$name"
}

# docker_exec_shell opens a shell inside a running container.
docker_exec_shell() {
    local name="${1:?missing container}"
    docker exec -it "$name" /bin/bash
}

# docker_build_tag builds an image from a directory with a tag.
docker_build_tag() {
    local dir="${1:?missing dir}" tag="${2:?missing tag}"
    docker build -t "$tag" "$dir"
}

# docker_run_rm runs a one-shot container and removes it afterwards.
docker_run_rm() {
    local image="${1:?missing image}"
    shift
    docker run --rm "$image" "$@"
}

# docker_compose_up starts the project services in the background.
docker_compose_up() {
    local dir="${1:-.}"
    (cd "$dir" && docker compose up -d)
}

# docker_compose_down stops the project services.
docker_compose_down() {
    local dir="${1:-.}"
    (cd "$dir" && docker compose down)
}

# docker_is_running tests whether a named container is up.
docker_is_running() {
    local name="${1:?missing container}"
    [[ "$(docker inspect -f '{{.State.Running}}' "$name" 2>/dev/null)" == "true" ]]
}

# docker_restart restarts a container by name.
docker_restart() {
    local name="${1:?missing container}"
    docker restart "$name"
}

# docker_prune_all removes unused containers, networks and images.
docker_prune_all() {
    docker system prune -af
}

# docker_network_ls lists networks with their driver and scope.
docker_network_ls() {
    docker network ls --format '{{.Name}}\t{{.Driver}}\t{{.Scope}}'
}

# docker_volume_ls lists named volumes with their mount point.
docker_volume_ls() {
    docker volume ls -q | while read -r v; do
        printf '%s %s\n' "$v" "$(docker volume inspect -f '{{.Mountpoint}}' "$v")"
    done
}

# docker_healthcheck prints the health state of a container.
docker_healthcheck() {
    local name="${1:?missing container}"
    docker inspect -f '{{.State.Health.Status}}' "$name" 2>/dev/null || printf 'no healthcheck'
}

# docker_clean_old removes containers that exited more than a week ago.
docker_clean_old() {
    docker ps -a --filter 'status=exited' --format '{{.ID}} {{.Status}}' \
        | awk '$2 ~ /weeks/ { print $1 }' | xargs -r docker rm
}
