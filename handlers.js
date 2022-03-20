import { writeFileSync } from 'fs';

import { ParseFeeConfigurationSpec } from './helpers.js'
const getPing = async (request, response) => {
  await response.json({
    success: true,
    result: "pong!",
  });
};

const SetupFeesSpec = async (request, response) => {
  try {
    if (!request.body.FeeConfigurationSpec) {
      return response.status(400).json({
        success: false,
        message: "FeeConfigurationSpec body parameter is empty",
      });
    }
    const FeeConfigurationSpec = request.body.FeeConfigurationSpec.split("\n");
    let FCS = await ParseFeeConfigurationSpec(FeeConfigurationSpec);
    let FCSData = JSON.stringify(FCS);
    writeFileSync("data/FeeConfigurationSpec.json", FCSData);
    return response.status(200).json({ status: "ok" });
  } catch (error) {
    console.log(error);
    return response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};

export { getPing, SetupFeesSpec };
