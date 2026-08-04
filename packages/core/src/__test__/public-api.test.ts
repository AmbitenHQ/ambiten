import {
  AmbitenBootstrapFactory,
  AmbitenClient,
  AmbitenContext,
  AmbitenModel,
  AmbitenSchema
} from "@ambiten/core";

describe("Public API", () => {
  it("exports all public symbols", () => {
    expect(AmbitenBootstrapFactory).toBeDefined();
    expect(AmbitenClient).toBeDefined();
    expect(AmbitenContext).toBeDefined();
    expect(AmbitenModel).toBeDefined();
    expect(AmbitenSchema).toBeDefined();
  });
});