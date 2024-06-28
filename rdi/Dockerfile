FROM redhat/ubi9-init
WORKDIR /opt/rdi_stage
RUN dnf -y update && dnf -y install wget && dnf clean all
COPY install.toml .
COPY config.yaml /opt/rdi/config/config.yaml
ENV RDI_VERSION 1.2.0
RUN wget -q https://redis-enterprise-software-downloads.s3.amazonaws.com/redis-di/rdi-installation-$RDI_VERSION.tar.gz
RUN tar -xzf rdi-installation-$RDI_VERSION.tar.gz && rm rdi-installation-$RDI_VERSION.tar.gz
VOLUME ["/tmp", "/run", "/var/lib/rancher"]