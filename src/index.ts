import { initBaseURL } from "./api/common";

export interface initProps {
  /**
   * The URL to the API server.
   */
  baseURL: string;
}

export const init = (props: initProps) => {
  initBaseURL(props.baseURL);
};
