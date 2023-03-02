import type { FastifyRequest } from "fastify"
import fp from "fastify-plugin"
import rateLimit from "@fastify/rate-limit"

export default fp(async fastify => {
  fastify.register(rateLimit, {
    max: 30,
    timeWindow: "1 minute",
    keyGenerator: (req: FastifyRequest) => (req.headers["true-client-ip"] as string) || req.ip
  })
})