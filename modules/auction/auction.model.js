import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    leagueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "League",
      required: true,
    },

    team: {
      type: Object,
      required: true,
    },
    bidInfo: {
      type: [
        {
          _id: false,
          bidder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          amount: Number,
        },
      ],
      required: false,
      default: [],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    price: {
      type: Number,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Auction = mongoose.model("Auction", auctionSchema);

export default Auction;
