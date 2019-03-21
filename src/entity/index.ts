import { PageInfo } from "../apollo.generated";
import { ConnectionInput } from "../apollo.generated";

export interface RelayNode {
  cursor: string;
}

export interface RelayEdge<TEntity> {
  cursor: string;
  node: TEntity;
}

export interface RelayConnection<TEntity> {
  edges: Array<RelayEdge<TEntity>>;

  pageInfo: PageInfo;
}

export async function paginate<TEntity>(
  fetchDataFn: (
    offset: number,
    limit: number
  ) => TEntity[] | Promise<TEntity[]>,
  transformDataFn?: (
    rawEntity: { [k in keyof TEntity]: TEntity[k] }
  ) => TEntity,
  args?: ConnectionInput | null
): Promise<RelayConnection<TEntity>> {
  let hasNextPage = false;
  let startCursor = null;
  let endCursor = null;

  const [offset, limit, hasPreviousPage] = getOffsetAndLimit(args);

  const results = await fetchDataFn(offset, limit + 1);

  let len = results.length;

  if (len > limit) {
    hasNextPage = true;
    len = limit;
  }

  const edges = [];

  if (len > 0) {
    let nextCursor = offsetToCursor(offset);

    startCursor = nextCursor;

    for (let i = 0; i < len; i++) {
      nextCursor = offsetToCursor(offset + i);

      const rawDbColumnValues = results[i];

      edges.push({
        node: transformDataFn
          ? transformDataFn(rawDbColumnValues)
          : rawDbColumnValues,
        cursor: nextCursor
      });
    }

    endCursor = nextCursor;
  }

  const pageInfo: PageInfo = {
    startCursor,
    endCursor,
    hasNextPage,
    hasPreviousPage
  };

  return { edges, pageInfo };
}

const CURSOR_PREFIX = "authority michael";
const CURSOR_PREFIX_JOINER = ":";

export function offsetToCursor(cursorString: string | number) {
  return Buffer.from(
    CURSOR_PREFIX + CURSOR_PREFIX_JOINER + cursorString
  ).toString("base64");
}

function offsetFromCursor(opaqueValue: string) {
  const [prefix, cursorString] = Buffer.from(opaqueValue, "base64")
    .toString("utf-8")
    .split(CURSOR_PREFIX_JOINER);

  if (CURSOR_PREFIX !== prefix || !cursorString) {
    throw new Error(`Bad cursor "${opaqueValue}"`);
  }

  const cursor = parseInt(cursorString, 10);

  if (isNaN(cursor)) {
    throw new Error(`Bad cursor "${opaqueValue}"`);
  }

  return cursor;
}

const MAX_LIMIT = 100;

function getOffsetAndLimit(
  args?: ConnectionInput | null
): [number, number, boolean] {
  let { first, last, after, before } = (args || {}) as ConnectionInput;

  if (before !== undefined && after !== undefined) {
    throw new Error(
      'You may not specify both "before" and "after" pagination arguments.'
    );
  }

  if (first !== undefined && last !== undefined) {
    throw new Error(
      'You may not specify both "first" and "last" pagination arguments.'
    );
  }

  const limit =
    first || last ? Math.min(MAX_LIMIT, first || last || 0) : MAX_LIMIT;

  const offset = getOffset(limit, after, before);

  let hasPreviousPage = false;

  if (before || (after && limit > 0)) {
    hasPreviousPage = true;
  }

  return [offset, limit, hasPreviousPage];
}

function getOffset(
  limit: number,
  after?: string | null,
  before?: string | null
) {
  if (typeof after === "string") {
    return offsetFromCursor(after) + 1;
  }

  if (typeof before === "string") {
    return Math.max(0, offsetFromCursor(before) - limit);
  }

  return 0;
}
