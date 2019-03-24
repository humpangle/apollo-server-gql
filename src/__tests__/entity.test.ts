import {
  paginate,
  offsetToCursor,
  PAGINATION_ARGS_COMBINATION_ERROR
} from "../entity";
import { PageInfo } from "../apollo.generated";

describe("paginate test", () => {
  it("throws error if invalid cursor format provided", () => {
    expect.assertions(1);

    return paginate(jest.fn(), jest.fn(), { before: "" }).catch(error => {
      expect(error.message).toMatch("Bad cursor");
    });
  });

  it("throws error if cursor does not decode to number", () => {
    expect.assertions(1);

    return paginate(jest.fn(), jest.fn(), {
      before: offsetToCursor("x")
    }).catch(error => {
      expect(error.message).toMatch("Bad cursor");
    });
  });

  it("throws error if pagination first and last args specified", () => {
    expect.assertions(1);

    return paginate(jest.fn(), jest.fn(), {
      first: 1,
      last: 0
    }).catch(error => {
      expect(error.message).toMatch(PAGINATION_ARGS_COMBINATION_ERROR);
    });
  });

  it("throws error if pagination before and after args specified", () => {
    expect.assertions(1);

    return paginate(jest.fn(), jest.fn(), {
      before: "",
      after: ""
    }).catch(error => {
      expect(error.message).toMatch(PAGINATION_ARGS_COMBINATION_ERROR);
    });
  });

  it("returns empty list if no messages", async () => {
    const { edges, pageInfo } = await paginate(jest.fn().mockResolvedValue([]));

    expect(edges).toEqual([]);

    let expectedPageInfo: PageInfo = {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null
    };

    expect(pageInfo).toEqual(expectedPageInfo);
  });

  it("throws error if pagination before and first args specified", () => {
    expect.assertions(1);

    return paginate(jest.fn(), jest.fn(), {
      before: "",
      first: 1
    }).catch(error => {
      expect(error.message).toMatch(PAGINATION_ARGS_COMBINATION_ERROR);
    });
  });

  it("throws error if pagination after and last args specified", () => {
    expect.assertions(1);

    return paginate(jest.fn(), jest.fn(), {
      after: "",
      last: 1
    }).catch(error => {
      expect(error.message).toMatch(PAGINATION_ARGS_COMBINATION_ERROR);
    });
  });
});
