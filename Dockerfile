ARG TAG
FROM codercom/code-server:${TAG}

COPY run.sh /run.sh
EXPOSE 8888
ENTRYPOINT ["/run.sh"]
