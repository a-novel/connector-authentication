import {
  DefaultError,
  MutationKey,
  QueryKey,
  UseMutationResult,
  UseQueryResult,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";

export type MutationAPI<Args extends any[], TData, TError = DefaultError, TVariables = unknown, TContext = unknown> = {
  key: MutationKey;
  useAPI: (...args: Args) => UseMutationResult<TData, TError, TVariables, TContext>;
};

export type QueryAPI<Args extends any[], TData, TError = DefaultError> = {
  key: (...args: Args) => QueryKey;
  useAPI: (...args: Args) => UseQueryResult<TData, TError>;
};

export type InfiniteQueryAPI<Args extends any[], TData, TError = DefaultError> = {
  key: (...args: Args) => QueryKey;
  useAPI: (...args: Args) => UseInfiniteQueryResult<TData, TError>;
};
