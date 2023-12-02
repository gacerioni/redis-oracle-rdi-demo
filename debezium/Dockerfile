FROM debezium/server:latest
USER root
RUN microdnf -y install unzip && \
microdnf clean all
RUN curl -s https://download.oracle.com/otn_software/linux/instantclient/219000/instantclient-basiclite-linux.x64-21.9.0.0.0dbru.zip -o instantclient.zip && \
unzip -qq -j instantclient.zip -d /debezium/instantclient && \
rm instantclient.zip && \
cp /debezium/instantclient/ojdbc8.jar /debezium/lib
ENV LD_LIBRARY_PATH=/debezium/instantclient