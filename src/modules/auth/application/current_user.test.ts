import { readCurrentUser, type CurrentUserGateway } from "./current_user";

describe("readCurrentUser", () => {
  it("returns only the authenticated identity needed by the application", async () => {
    const externalUser = {
      id: "user-42",
      email: "user@example.com",
      phone: "09000000000",
    };
    const gateway: CurrentUserGateway = {
      getUser: vi.fn<CurrentUserGateway["getUser"]>().mockResolvedValue(externalUser),
    };

    await expect(readCurrentUser(gateway)).resolves.toEqual({
      id: "user-42",
      email: "user@example.com",
    });
  });

  it("returns null when there is no authenticated user", async () => {
    const gateway: CurrentUserGateway = {
      getUser: vi.fn<CurrentUserGateway["getUser"]>().mockResolvedValue(null),
    };

    await expect(readCurrentUser(gateway)).resolves.toBeNull();
  });
});
