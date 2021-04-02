FROM node:12.22.0-alpine3.10

ENV DEBIAN_FRONTEND="noninteractive" TZ="Europe/Moscow" DOPENSSL_ENGINES_DIR="/usr/lib/ssl"

WORKDIR /root
#COPY ./ api3-dao/
WORKDIR api3-dao
RUN apk add git python make g++
RUN npm config set prefix ~/npm
RUN export PATH="$PATH:$HOME/npm/bin"
RUN npm install -g @aragon/cli
RUN npm run bootstrap
ENTRYPOINT ["tail", "-f", "/dev/null"]
