import axios from "axios";

import { Player } from "app/models";
import { PlayerResponseInterface, PlayerTempInterface } from "app/interfaces";

export const getInfoFromApiFIFA = async (): Promise<void> => {
  try {
    const playersFromDB = await Player.find().limit(5);
    if (playersFromDB.length === 0) {
      console.log("Getting players information, please wait...");
      const responseInfoPages = await axios.get(
        "https://www.easports.com/fifa/ultimate-team/api/fut/item"
      );
      const data = responseInfoPages.data;
      const totalPages = data.totalPages;
      for (let index = 1; index <= totalPages; index++) {
        const response = await axios.get(
          `https://www.easports.com/fifa/ultimate-team/api/fut/item?page=${index}`
        );
        const items = response.data.items;
        const players: PlayerTempInterface[] = items.map(
          (player: PlayerResponseInterface) => {
            return {
              name: player.name,
              position: player.position,
              nationality: player.nation.name,
              club: player.club.name,
            };
          }
        );
        await Promise.all(
          players.map(async (player) => {
            delete player.idFifa;
            const newPlayer = new Player(player);
            await newPlayer.save();
          })
        );
      }
      console.log("Players saved.");
      return;
    }
    console.log("The players have already been saved.");
  } catch (error) {
    console.log("Error getInfoFromApiFIFA =>", error);
    throw new Error(error as string);
  }
};
