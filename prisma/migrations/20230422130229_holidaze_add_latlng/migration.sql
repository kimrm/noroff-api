-- AlterTable
ALTER TABLE "HolidazeVenue" ALTER COLUMN "rating" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "HolidazeVenueLocation" ADD COLUMN     "lat" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lng" DOUBLE PRECISION NOT NULL DEFAULT 0;