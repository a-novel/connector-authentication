import { initBaseURL } from "./api/common";

export interface InitProps {
  /**
   * The URL to the API server.
   */
  baseURL: string;
}

export const init = (props: InitProps) => {
  initBaseURL(props.baseURL);
};
