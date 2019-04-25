FROM amazonlinux:2
WORKDIR /opt/app
RUN yum install tar gzip which make gcc openssl openssl-devel nasm -y
RUN yum groupinstall "Development Tools" -y
RUN mkdir -p /root/.nvm /opt/app
ENV HOME /root
ENV YARN_VERSION 1.13.0
ENV NODE_VERSION 11.10.1
ENV NVM_DIR $HOME/.nvm
ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin
ENV YARN_PATH $HOME/.yarn/bin
ENV YARN_GLOBALS_PATH $HOME/.config/yarn/global/node_modules/.bin
ENV PATH $PATH:$NODE_PATH:$YARN_PATH:$YARN_GLOBALS_PATH
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm install-latest-npm \
    && nvm alias default $NODE_VERSION \
    && nvm use default
RUN curl -o- -L https://yarnpkg.com/install.sh | bash
ADD package.json yarn.lock .npmrc /tmp/
RUN cd /tmp && yarn install --pure-lockfile && rm -rf package.json yarn.lock .npmrc node_modules
RUN cd /opt/app