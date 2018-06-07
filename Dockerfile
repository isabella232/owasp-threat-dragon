# docker run --name td -p 3000:3000 --env-file env-file.txt appsecco/owasp-threat-dragon 
FROM node:alpine
LABEL MAINTAINER="Subash SN"

COPY . /app

WORKDIR /app

RUN apk --no-cache add python make \
    && npm install

EXPOSE 3000

CMD ["npm", "start"]
