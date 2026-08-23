FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN apt-get update -y \
	&& rm -rf /var/lib/apt/lists/*

COPY . .

COPY docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "start"]
