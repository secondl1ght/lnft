FROM asoltys/tokenocean

WORKDIR /app

COPY . .

RUN pnpm i
RUN pnpm build
RUN cat build/middlewares.js >> shim.js
RUN mv shim.js build/middlewares.js
CMD ["node", "build"]
