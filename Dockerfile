FROM node:14.17.3-alpine
WORKDIR /var/www/math
COPY . .
RUN yarn install
RUN yarn prisma generate
RUN yarn tsc
ENV NODE_ENV production
EXPOSE 8080
CMD yarn node dist
