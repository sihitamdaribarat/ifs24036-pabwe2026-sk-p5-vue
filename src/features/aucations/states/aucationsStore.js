import { defineStore } from "pinia";
import * as aucationApi from "../api/aucationApi";
import { runAction } from "../../../helpers/storeHelper";

export const useAucationsStore = defineStore("aucations", {
  state: () => ({
    aucations: [],
    aucation: null,
    isAucations: false,
    isAucation: false,
    isAucationAdd: false,
    isAucationAdded: false,
    isAucationChange: false,
    isAucationChanged: false,
    isAucationChangeCover: false,
    isAucationChangedCover: false,
    isAucationDelete: false,
    isAucationDeleted: false,
    isBidAdd: false,
    isBidAdded: false,
    isBidDelete: false,
    isBidDeleted: false,
    isAucationDeleteAll: false,
    isAucationDeletedAll: false,
  }),
  actions: {
    getAucations(filters = {}) {
      return runAction(this, "isAucations", null, async () => {
        this.aucations = await aucationApi.getAucations(filters);
        return "";
      });
    },
    getAucation(id) {
      return runAction(this, "isAucation", null, async () => {
        this.aucation = await aucationApi.getAucationById(id);
        return "";
      });
    },
    addAucation(data) {
      return runAction(this, "isAucationAdd", "isAucationAdded", () =>
        aucationApi.postAucation(data),
      );
    },
    changeAucation(id, data) {
      return runAction(this, "isAucationChange", "isAucationChanged", () =>
        aucationApi.putAucation(id, data),
      );
    },
    changeCover(id, cover) {
      return runAction(
        this,
        "isAucationChangeCover",
        "isAucationChangedCover",
        () => aucationApi.postAucationCover(id, cover),
      );
    },
    deleteAucation(id) {
      return runAction(this, "isAucationDelete", "isAucationDeleted", async () => {
        const message = await aucationApi.deleteAucation(id);
        this.aucations = this.aucations.filter((item) => item.id !== id);
        if (this.aucation?.id === id) this.aucation = null;
        return message;
      });
    },
    addBid(id, bid) {
      return runAction(this, "isBidAdd", "isBidAdded", () =>
        aucationApi.postBid(id, bid),
      );
    },
    deleteBid(id) {
      return runAction(this, "isBidDelete", "isBidDeleted", () =>
        aucationApi.deleteBid(id),
      );
    },
    deleteAllAucations() {
      return runAction(
        this,
        "isAucationDeleteAll",
        "isAucationDeletedAll",
        () => aucationApi.deleteAllAucations(),
      );
    },
  },
});
