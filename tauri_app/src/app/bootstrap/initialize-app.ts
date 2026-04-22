import { createCacheActions } from "../cache/cache-actions";
import {
  createCommitContext,
  type CommitContext,
  type RootStoreToken,
} from "../../state/root-store";
import { applyStaticLayoutVariables } from "./apply-layout-variables";

export const initializeApp = (commitContext: CommitContext) => {
  const { lastStore: rootStoreToken, commit } = commitContext;
  const { recalculate } = createCacheActions(rootStoreToken);

  applyStaticLayoutVariables();
  recalculate();
  commit();
};

export const initializeAppFromStore = (rootStoreToken: RootStoreToken) => {
  initializeApp(createCommitContext(rootStoreToken));
};


