import wretch from "wretch";
import * as middlewares from "wretch-middlewares";
import { token } from "$lib/store";
import { get } from "svelte/store";
import { err } from "$lib/utils";

const { retry } = middlewares.default || middlewares;
wretch().polyfills({ fetch });

export const api = wretch().url("/api");
export const electrs = wretch().url("/api/el");

export const hasura = wretch()
  .middlewares([retry({ maxAttempts: 2 })])
  .url("/api/v1/graphql");

export const pub = (t) => (t ? hasura.auth(`Bearer ${t}`) : hasura);
export const query = async (query, variables) => {
  let { data, errors } = await pub(get(token))
    .post({ query, variables })
    .json();
  if (errors) throw new Error(errors[0].message);
  return data;
};

export const hbp = wretch().url("http://localhost:3400");

let serverApi = wretch().url(import.meta.env.VITE_HASURA);
export const sapi = (headers) => async (query, variables) => {
  let { data, errors } = await wretch().url(import.meta.env.VITE_HASURA)
    .headers(headers)
    .post({ query, variables })
    .json();
  if (errors) {
    let { message } = errors[0];
    if (message.includes("JWTExpired")) {
      await refresh();
      q(query, variables);
    }
    throw new Error(errors[0].message);
  }

  return data;
};

export const q = async (query, variables) => {
  let { data, errors } = await serverApi.post({ query, variables }).json();
  if (errors) {
    let { message } = errors[0];
    if (message.includes("JWTExpired")) {
      await refresh();
      q(query, variables);
    }
    throw new Error(errors[0].message);
  }

  return data;
};

export const sessions = {};

export const refresh = async (headers) => {
  let jwt, setCookie, user;

  try {
    let res = await hbp.url("/auth/token/refresh").headers(headers).get().res();
    let { jwt_token, refresh_token } = await res.json();

    jwt = jwt_token;
    setCookie = res.headers.get("set-cookie") || "";

    auth({ authorization: `Bearer ${jwt}` });
    sessions[refresh_token] = jwt;
  } catch (e) {
    console.log(e);
  }

  return {
    jwt,
    setCookie,
  };
};
