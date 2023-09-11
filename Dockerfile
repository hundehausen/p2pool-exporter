# Step 1: Build the application
FROM oven/bun AS builder

# Set the working directory in the container
WORKDIR /app

# Copy all the application files to the container
COPY . .

# Run your build process
RUN bun i
RUN bun build src/index.ts --compile --outfile server

# Step 2: Create a smaller image for running the application
FROM oven/bun

# Copy only the necessary files from the builder image to the final image
COPY --from=builder /app/server .

# Expose the port the application will run on
EXPOSE 6543/tcp
ENV PORT=6543
ENV BASE_URL=https://p2pool.observer
ENV ADDRESS=

#Start the BUN server
CMD ["./server"]