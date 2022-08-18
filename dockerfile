#produccion

FROM node:16.3.0-alpine as build

RUN mkdir -p /home/node/backend/node_modules && chown -R node:node /home/node/backend

WORKDIR /home/node/backend
# RUN npm install --global pm2
COPY package*.json ./
RUN npm cache verify 
# RUN npm install
# && npm --update-checksums
COPY . ./
EXPOSE 8000
CMD ["npm", "start"]
# RUN npm run start

# Stage - Productio
# FROM nginx:1.17-alpine
# RUN rm /etc/nginx/conf.d/default.conf
# # COPY nginx.conf /etc/nginx/conf.d/default.conf
# # COPY --from=build /backend /usr/share/nginx/html 
# EXPOSE 8080
# CMD ["nginx", "-g", "daemon off;"]