import { RequestEmailUpdateForm, RequestPasswordResetForm, RequestRegistrationForm, Token } from "./bindings";
import { authPath, withAuthHeaders } from "./common";
import { InternalError, newErrorResponseMessage, UnauthorizedError } from "./errors";

import { z } from "zod";

// https://a-novel.github.io/authentication/#tag/shortcode

const SHORT_CODE_PATH = "/short-code";

/**
 * To prevent spam in our user database, registration must be done through a link sent by e-mail, so we can ensure this
 * address is valid. When a user registers, the short code it received must be sent along with the registration payload.
 * The email of the payload MUST match the email the short code was sent to, and is used to retrieve the short code.
 *
 * NOTE that this request does not verify the availability of an email. You may check this beforehand, using the Email
 * Exists endpoint.
 *
 * If multiple registration links are requested for the same email, only the last one will be valid.
 */
export const requestRegistration = async (
  token: z.infer<typeof Token>,
  form: z.infer<typeof RequestRegistrationForm>
): Promise<void> => {
  const response = await fetch(
    authPath(SHORT_CODE_PATH + "/register"),
    withAuthHeaders(token, {
      method: "PUT",
      body: JSON.stringify(form),
    })
  );

  switch (response.status) {
    case 401:
      throw new UnauthorizedError("invalid credentials");
    default:
      if (!response.ok) throw new InternalError(await newErrorResponseMessage("request registration", response));
  }
};

/**
 * Create a new short code for updating the email of a user. This short code is sent to the new address. If the user
 * clicks on it, it should take it to a page that will forward the short code back to this API. Once done, the email
 * associated to the user will be updated automatically.
 *
 * This route requires to be called by an authenticated user. Anonymous sessions cannot trigger an email update request.
 *
 * NOTE that this request does not verify the availability of an email. You may check this beforehand, using the Email
 * Exists endpoint.
 *
 * If multiple email update links are requested for the same email, only the last one will be valid.
 */
export const requestEmailUpdate = async (
  token: z.infer<typeof Token>,
  form: z.infer<typeof RequestEmailUpdateForm>
): Promise<void> => {
  const response = await fetch(
    authPath(SHORT_CODE_PATH + "/update-email"),
    withAuthHeaders(token, {
      method: "PUT",
      body: JSON.stringify(form),
    })
  );

  switch (response.status) {
    case 401:
      throw new UnauthorizedError("invalid credentials");
    default:
      if (!response.ok) throw new InternalError(await newErrorResponseMessage("request email update", response));
  }
};

/**
 * Create a new short code for updating the password of a user. This short code is sent to the new address. If the
 * user clicks on it, it should take it to a page that will forward the short code back to this API. Once done, the
 * password of the user is updated.
 *
 * This route does not require authentication (although it requires at least an anonymous session). This allows users
 * who forgot their password to reset it.
 *
 * If multiple password update links are requested for the same email, only the last one will be valid.
 */
export const requestPasswordReset = async (
  token: z.infer<typeof Token>,
  form: z.infer<typeof RequestPasswordResetForm>
): Promise<void> => {
  const response = await fetch(
    authPath(SHORT_CODE_PATH + "/update-password"),
    withAuthHeaders(token, {
      method: "PUT",
      body: JSON.stringify(form),
    })
  );

  switch (response.status) {
    case 401:
      throw new UnauthorizedError("invalid credentials");
    default:
      if (!response.ok) throw new InternalError(await newErrorResponseMessage("request password reset", response));
  }
};
