FROM node:18

RUN apt-get update && \
  apt-get install -y \
  neofetch \
  git \
  ffmpeg && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /root/xyvnz
RUN npm i -g pm2 

COPY package.json .
COPY . .

RUN git clone https://github.com/VanzGantengz/es6
RUN mv es6 xyvnz && cp -r xyvnz /root
RUN npm i

CMD pm2-runtime start index.js --name bot