import League from "./league.model.js";
import { v4 as uuidv4 } from "uuid";
import LeagueUser from "./leagueUser.model.js";
import mongoose from "mongoose";
import AuctionSettings from "../auction/auctionSettings.model.js";
import { removeSensitiveInfo } from "../../utils/auth.js";

export const createLeague = async (req, res) => {
  try {
    const { leagueName, event, eventScope, eventScopeId, eventId } = req.body;
    const inviteCode = uuidv4();

    const newLeague = new League({
      leagueName,
      event,
      eventScope,
      creatorId: req.user._id,
      inviteCode,
      eventId,
      eventScopeId,
    });

    const league = await newLeague.save();

    const joinLeague = new LeagueUser({
      league: league?._id,
      user: req.user._id,
      userName: req.user.name,
      role: "Creator",
    });
    const auctionSettings = new AuctionSettings({
      leagueName: leagueName,
      leagueId: league?._id,
    });

    const result = await joinLeague.save();
    const settings = await auctionSettings.save();
    res.status(200).send({
      message: "League created  successfully!",
      success: true,
      data: league,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      success: false,
    });
  }
};

export const joinLeague = async (req, res) => {
  try {
    const { inviteCode } = req.query;

    const league = await League.findOne({ inviteCode: inviteCode });

    const isExist = await LeagueUser.findOne({
      user: req.user?._id,
      league: league?._id,
    });

    // console.log(league, "league");
    // console.log(isExist, "isExist");

    if (league && !isExist) {
      const joinLeague = new LeagueUser({
        league: league?._id,
        user: req.user?._id,
        userName: req.user?.name,
        role: "Member",
      });
      const result = await joinLeague.save();

      res.status(200).send({
        message: "League joined successfully!",
        success: true,
        data: result,
      });
    } else if (league && isExist) {
      res.status(401).send({
        message: "You have already joined this league!",
        success: false,
      });
    } else if (!league && !isExist) {
      res.status(401).send({
        message: "There is no such league.",
        success: false,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
      success: false,
    });
  }
};

export const getUserLeagues = async (req, res) => {
  try {
    const userLeagues = await LeagueUser.find({
      user: req.user._id,
    }).populate("league");
    res.status(200).send(userLeagues);
  } catch (err) {
    res.status(500).send({
      message: err.message,
      success: false,
    });
  }
};

export const getLeagueUsersData = async (req, res) => {

  //realtime auction user activation


  try {
    const { leagueId } = req.params;  

    if (!mongoose.Types.ObjectId.isValid(leagueId)) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid league ID" });
    }

    const leagueUsers = await LeagueUser.find({
      league: leagueId,
    }).populate("user");
    res.status(200).send(leagueUsers);
  } catch (err) {
    res.status(500).send({
      message: err.message,
      success: false,
    });
  }
};

export const getSingleLeagueInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const league = await League.findById(id);
    res.status(200).send(league);
  } catch (err) {
    res.status(500).send({
      message: err.message,
      success: false,
    });
  }
};

export const updateLeagueInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const league = await League.findById(id);
    if (league) {
      const result = await League.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.status(200).json({
        success: true,
        message: "League Info Update successfully",
        data: removeSensitiveInfo(result),
      });
    } else {
      res.status(201).json({
        success: false,
        message: "Update unsuccessful",
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
      success: false,
    });
  }
};

export const removeUserFromLeague = async (req, res) => {
  try {
    await LeagueUser.findOneAndDelete({ _id: req.params.id })
      .exec()
      .then((result) => {
        res.status(200).send({
          message: `${result.userName} is successfully removed!`,
          success: true,
        });
      })
      .catch((err) => {
        res.status(401).send({
          message: err.message,
          success: false,
        });
      });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      success: false,
    });
  }
};
