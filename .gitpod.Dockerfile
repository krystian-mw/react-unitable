FROM gitpod/workspace-postgres

RUN     pg_start \
    &   psql -c "create role root with login" \
    &   psql -c "create database sample"