import { AuctionListing, AuctionProfile } from "@prisma/client"
import { FastifyReply, FastifyRequest } from "fastify"
import { mediaGuard } from "../../../utils/mediaGuard"
import { NotFound, BadRequest, Forbidden } from "http-errors"

import { CreateListingSchema, UpdateListingSchema } from "./listings.schema"
import { getListings, getListing, createListing, updateListing } from "./listings.service"

export interface AuctionListingIncludes {
  bids?: boolean
  seller?: boolean
}

export async function getListingsHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      offset?: number
      sort?: keyof AuctionListing
      sortOrder?: "asc" | "desc"
      _seller?: boolean
      _bids?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { sort, sortOrder, limit, offset, _bids, _seller } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const includes: AuctionListingIncludes = {
    bids: Boolean(_bids),
    seller: Boolean(_seller)
  }

  const listings = await getListings(sort, sortOrder, limit, offset, includes)
  return reply.code(200).send(listings)
}

export async function getListingHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Querystring: {
      _seller?: boolean
      _bids?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { _bids, _seller } = request.query

  const includes: AuctionListingIncludes = {
    bids: Boolean(_bids),
    seller: Boolean(_seller)
  }

  const listing = await getListing(id, includes)

  if (!listing) {
    throw new NotFound("No listing with such ID")
  }

  return reply.code(200).send(listing)
}

export async function createListingHandler(
  request: FastifyRequest<{
    Body: CreateListingSchema
    Querystring: {
      _seller?: boolean
      _bids?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { name } = request.user as AuctionProfile
  const { media } = request.body
  const { _bids, _seller } = request.query

  const includes: AuctionListingIncludes = {
    bids: Boolean(_bids),
    seller: Boolean(_seller)
  }

  if (media) {
    for (const url of media) {
      await mediaGuard(url)
    }
  }

  try {
    const listing = await createListing(request.body, name, includes)
    return reply.code(201).send(listing)
  } catch (error) {
    reply.code(500).send(error)
  }
}

export async function updateListingHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: UpdateListingSchema
    Querystring: {
      _seller?: boolean
      _bids?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { name } = request.user as AuctionProfile
  const { media } = request.body
  const { _bids, _seller } = request.query

  const includes: AuctionListingIncludes = {
    bids: Boolean(_bids),
    seller: Boolean(_seller)
  }

  const listing = await getListing(id)

  if (!listing) {
    throw new NotFound("No listing with such ID")
  }

  if (listing.sellerName.toLowerCase() !== name.toLowerCase()) {
    throw new Forbidden("You do not have permission to update this listing")
  }

  if (media) {
    for (const url of media) {
      await mediaGuard(url)
    }
  }

  try {
    const updatedListing = await updateListing(id, request.body, includes)
    return reply.code(200).send(updatedListing)
  } catch (error) {
    reply.code(500).send(error)
  }
}
