import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { LordProject } from "./lord-project";

describe("The LordProject stack", () => {
  it("matches the snapshot", () => {
    const app = new App();
    const stack = new LordProject(app, "LordProject", { stack: "investigations", stage: "TEST" });
    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });
});
