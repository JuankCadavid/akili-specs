"use strict";
const cdk = require("aws-cdk-lib");
const iam = require("aws-cdk-lib/aws-iam");

const HOST = "token.actions.githubusercontent.com";
const SUB = "repo:JuankCadavid/akili-specs:environment:aws-mcp";
const QUALIFIER = "hnb659fds"; // CDK default bootstrap qualifier (P-20)

// GitHub OIDC deploy role. Deployed once by the owner; CI never deploys it.
class DeployRoleStack extends cdk.Stack {
  constructor(scope, id, { oidcProvider }) {
    super(scope, id, { stackName: id });
    cdk.Tags.of(this).add("project", "akili-mcp");

    // One provider per URL per account: import by ARN (built from tokens) or create.
    const providerArn =
      oidcProvider === "create"
        ? new iam.OidcProviderNative(this, "GitHub", { url: `https://${HOST}`, clientIds: ["sts.amazonaws.com"] })
            .oidcProviderArn
        : this.formatArn({ service: "iam", region: "", resource: "oidc-provider", resourceName: HOST });

    const role = new iam.Role(this, "Role", {
      roleName: "akili-mcp-deploy",
      assumedBy: new iam.FederatedPrincipal(
        providerArn,
        { StringEquals: { [`${HOST}:aud`]: "sts.amazonaws.com", [`${HOST}:sub`]: SUB } },
        "sts:AssumeRoleWithWebIdentity"
      ),
      maxSessionDuration: cdk.Duration.hours(1),
    });

    // CDK bootstrap roles this deploy may assume (not the CloudFormation execution role).
    role.addToPolicy(
      new iam.PolicyStatement({
        actions: ["sts:AssumeRole"],
        resources: ["deploy-role", "file-publishing-role", "lookup-role"].map((r) =>
          this.formatArn({
            service: "iam",
            region: "",
            resource: "role",
            resourceName: `cdk-${QUALIFIER}-${r}-${cdk.Aws.ACCOUNT_ID}-${cdk.Aws.REGION}`,
          })
        ),
      })
    );
    // Read, invoke and repoint the alias of the production function only.
    role.addToPolicy(
      new iam.PolicyStatement({
        actions: ["lambda:InvokeFunction", "lambda:GetAlias", "lambda:UpdateAlias", "lambda:ListVersionsByFunction"],
        resources: [
          this.formatArn({
            service: "lambda",
            resource: "function",
            resourceName: "akili-mcp-content*",
            arnFormat: cdk.ArnFormat.COLON_RESOURCE_NAME,
          }),
        ],
      })
    );
    new cdk.CfnOutput(this, "DeployRoleArn", { value: role.roleArn });
  }
}

module.exports = { DeployRoleStack };
