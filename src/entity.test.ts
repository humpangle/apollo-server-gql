import { paginate, offsetToCursor } from "./entity";
import { PageInfo } from "./apollo.generated";

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
      expect(error.message).toMatch(
        'You may not specify both "first" and "last" pagination arguments.'
      );
    });
  });

  it("throws error if pagination before and after args specified", () => {
    expect.assertions(1);

    return paginate(jest.fn(), jest.fn(), {
      before: "",
      after: ""
    }).catch(error => {
      expect(error.message).toMatch(
        'You may not specify both "before" and "after" pagination arguments.'
      );
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
});
