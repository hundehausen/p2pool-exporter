FROM oven/bun

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install --production

COPY src src
COPY tsconfig.json .

# Expose the port the application will run on
EXPOSE 6543/tcp
ENV PORT=6543
ENV BASE_URL=https://p2pool.observer
ENV ADDRESS=

#Start the BUN server
CMD ["bun", "src/index.ts"]