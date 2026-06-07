FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN apt-get update -y \
	&& rm -rf /var/lib/apt/lists/*

COPY . .

 

EXPOSE 3000

CMD ["npm", "start"]
